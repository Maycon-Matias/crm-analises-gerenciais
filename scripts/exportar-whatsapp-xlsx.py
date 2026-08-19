from __future__ import annotations

from datetime import datetime
from pathlib import Path
import argparse
import os

import pandas as pd
from pymongo import MongoClient
from pymongo.errors import OperationFailure


DEFAULT_URI = (
    "mongodb+srv://admin:admin123@poracred.lep058a.mongodb.net/"
    "?retryWrites=true&w=majority&appName=PoraCred"
)

FINALIZADAS_CANDIDATAS = [
    "whatsapp-finalizado",
    "whatsapp_finalizado",
    "whatsapp-finalizados",
    "whatsapp_finalizados",
    "whatsapp_finished",
    "dados_whatsapp_finalizado",
]

COLETADOS_CANDIDATAS = [
    "whatsapp_collected_data",
    "dados_coletados_do_whatsapp",
    "whatsapp_coletados",
    "whatsapp-coletados",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Exporta colecoes do WhatsApp para um unico arquivo Excel com 2 abas."
    )
    parser.add_argument("--uri", default="", help="String de conexao MongoDB.")
    parser.add_argument("--db", default="crm", help="Nome do banco de dados.")
    parser.add_argument(
        "--col-coletados",
        default="whatsapp_collected_data",
        help="Colecao de dados coletados do WhatsApp.",
    )
    parser.add_argument(
        "--col-finalizados",
        default="",
        help="Colecao de finalizados. Se vazio, tenta detectar automaticamente.",
    )
    parser.add_argument(
        "--output",
        default=f"exports/clientes-whatsapp-{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.xlsx",
        help="Arquivo de saida .xlsx",
    )
    parser.add_argument(
        "--tls-cert",
        default="",
        help="Caminho do certificado .pem (somente se sua conexao X509 exigir arquivo local).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limita quantidade por colecao (0 = sem limite).",
    )
    return parser.parse_args()


def normalize_docs(docs: list[dict]) -> list[dict]:
    def flatten_dict(value: dict, prefix: str = "") -> dict:
        flat: dict = {}
        for k, v in value.items():
            key = f"{prefix}.{k}" if prefix else str(k)
            if isinstance(v, dict):
                flat.update(flatten_dict(v, key))
            elif isinstance(v, list):
                flat[key] = str(v)
            else:
                flat[key] = v
        return flat

    normalized: list[dict] = []
    for doc in docs:
        flat = flatten_dict(doc)
        if "_id" in flat:
            flat["_id"] = str(flat["_id"])
        normalized.append(flat)
    return normalized


def organize_dataframe(df: pd.DataFrame, sheet_type: str) -> pd.DataFrame:
    if df.empty:
        return df

    if sheet_type == "coletados":
        preferred_order = [
            "_id",
            "id",
            "phone",
            "flowId",
            "collectedAt",
            "data.name",
            "data.cpf",
            "data.birthdate",
            "data.worksCLT",
            "data.authorizedDataprev",
            "data.consultaClt.status",
            "data.consultaClt.availableMargin",
            "data.consultaClt.availableMarginValue",
            "data.consultaClt.rejectionReason",
            "data.consultaClt.description",
            "data.consultaClt.partnerId",
            "data.consultaClt.documentNumber",
        ]
    else:
        preferred_order = [
            "_id",
            "phone",
            "finalizedAt",
        ]

    existing_preferred = [col for col in preferred_order if col in df.columns]
    remaining = sorted([col for col in df.columns if col not in existing_preferred])
    ordered_columns = existing_preferred + remaining
    return df[ordered_columns]


def detect_finalizados(collection_names: list[str]) -> str:
    lower_to_original = {name.lower(): name for name in collection_names}

    for candidate in FINALIZADAS_CANDIDATAS:
        if candidate.lower() in lower_to_original:
            return lower_to_original[candidate.lower()]

    # fallback: procura por nomes com "finaliz"
    for name in collection_names:
        if "finaliz" in name.lower():
            return name

    return ""

def detect_coletados(collection_names: list[str], preferred: str) -> str:
    lower_to_original = {name.lower(): name for name in collection_names}

    if preferred.lower() in lower_to_original:
        return lower_to_original[preferred.lower()]

    for candidate in COLETADOS_CANDIDATAS:
        if candidate.lower() in lower_to_original:
            return lower_to_original[candidate.lower()]

    # fallback: procura por nome com whatsapp + colet/collect
    for name in collection_names:
        lname = name.lower()
        if "whatsapp" in lname and ("colet" in lname or "collect" in lname):
            return name

    return ""


def read_collection(db, collection_name: str, limit: int) -> list[dict]:
    cursor = db[collection_name].find({})
    if limit > 0:
        cursor = cursor.limit(limit)
    return list(cursor)


def main() -> None:
    args = parse_args()
    mongo_uri = args.uri.strip() or os.environ.get("MONGODB_URI", "").strip() or DEFAULT_URI

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    client_kwargs = {}
    if args.tls_cert:
        client_kwargs["tls"] = True
        client_kwargs["tlsCertificateKeyFile"] = args.tls_cert

    print("Conectando ao MongoDB...")
    client = MongoClient(mongo_uri, **client_kwargs)

    try:
        selected_db_name = args.db
        db = client[selected_db_name]
        collections = db.list_collection_names()

        if not collections:
            admin = client.admin
            dbs = admin.command("listDatabases").get("databases", [])
            for db_info in dbs:
                candidate_name = db_info.get("name")
                if not candidate_name:
                    continue
                candidate_db = client[candidate_name]
                candidate_cols = candidate_db.list_collection_names()
                if any("whatsapp" in c.lower() for c in candidate_cols):
                    selected_db_name = candidate_name
                    db = candidate_db
                    collections = candidate_cols
                    print(f"Banco detectado automaticamente: {selected_db_name}")
                    break

        print(f"Banco: {selected_db_name}")
        print(f"Colecoes encontradas: {', '.join(collections) if collections else '(nenhuma)'}")

        coletados_col = detect_coletados(collections, args.col_coletados)

        if not coletados_col:
            raise ValueError(
                f"Colecao de coletados nao encontrada: '{args.col_coletados}'. "
                "Use --col-coletados com o nome correto."
            )

        finalizados_col = args.col_finalizados.strip()
        if not finalizados_col:
            finalizados_col = detect_finalizados(collections)
        elif finalizados_col not in collections:
            match = next((c for c in collections if c.lower() == finalizados_col.lower()), "")
            if match:
                finalizados_col = match

        docs_coletados = normalize_docs(read_collection(db, coletados_col, args.limit))
        print(f"Colecao '{coletados_col}': {len(docs_coletados)} registros.")

        docs_finalizados: list[dict] = []
        if finalizados_col and finalizados_col in collections:
            docs_finalizados = normalize_docs(read_collection(db, finalizados_col, args.limit))
            print(f"Colecao '{finalizados_col}': {len(docs_finalizados)} registros.")
        else:
            print("Colecao de finalizados nao detectada. A aba de finalizados sera criada vazia.")

        df_coletados = pd.DataFrame(docs_coletados)
        df_finalizados = pd.DataFrame(docs_finalizados)
        df_coletados = organize_dataframe(df_coletados, "coletados")
        df_finalizados = organize_dataframe(df_finalizados, "finalizados")

        with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
            df_coletados.to_excel(writer, sheet_name="coletados", index=False)
            df_finalizados.to_excel(writer, sheet_name="finalizados", index=False)

            # Ajuste de largura para facilitar leitura no Excel
            for sheet_name, df in [("coletados", df_coletados), ("finalizados", df_finalizados)]:
                worksheet = writer.sheets[sheet_name]
                for idx, col in enumerate(df.columns):
                    max_len = max(len(str(col)), 12)
                    if not df.empty:
                        sample_max = (
                            df[col]
                            .head(200)
                            .map(lambda v: len(str(v)) if pd.notna(v) else 0)
                            .max()
                        )
                        max_len = max(max_len, int(sample_max) if pd.notna(sample_max) else 12)
                    worksheet.set_column(idx, idx, min(max_len + 2, 50))

        print(f"Planilha gerada com sucesso: {output_path.resolve()}")
    except OperationFailure as exc:
        if "certificate validation failed" in str(exc).lower():
            raise RuntimeError(
                "Falha de certificado X509. Use URI com usuario/senha ou informe --tls-cert=caminho\\certificado.pem."
            ) from exc
        raise
    except Exception as exc:
        raise RuntimeError(f"Falha ao exportar: {exc}") from exc

    finally:
        client.close()


if __name__ == "__main__":
    main()
