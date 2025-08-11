import clientPromise from "@/lib/mongodb";

export interface WebhookPayload {
  evento: string;
  dados: any;
  timestamp: string;
  id: string;
}

export interface WebhookResponse {
  success: boolean;
  webhookId: string;
  url: string;
  statusCode?: number;
  error?: string;
}

// Função para disparar webhook
async function dispararWebhook(
  url: string,
  payload: WebhookPayload,
  headers: Record<string, string> = {},
  timeout: number = 30
): Promise<WebhookResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      success: response.ok,
      webhookId: payload.id,
      url,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      webhookId: payload.id,
      url,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Função principal para disparar webhooks baseado no evento
export async function dispararWebhooks(
  evento: "cliente.criado" | "cliente.atualizado" | "cliente.excluido" | "cliente.pago",
  dados: any
): Promise<WebhookResponse[]> {
  try {
    const client = await clientPromise;
    const db = client.db("crm");
    const collection = db.collection("webhooks");

    // Buscar webhooks ativos para este evento
    const webhooks = await collection.find({
      ativo: true,
      eventos: { $in: [evento] },
    }).toArray();

    if (webhooks.length === 0) {
      return [];
    }

    const payload: WebhookPayload = {
      evento,
      dados,
      timestamp: new Date().toISOString(),
      id: dados.id || "unknown",
    };

    const resultados: WebhookResponse[] = [];

    // Disparar webhooks em paralelo
    const promises = webhooks.map(async (webhook) => {
      const resultado = await dispararWebhook(
        webhook.url,
        payload,
        webhook.headers || {},
        webhook.timeout || 30
      );

      // Se falhou e há tentativas, tentar novamente
      if (!resultado.success && webhook.tentativas > 1) {
        for (let tentativa = 2; tentativa <= webhook.tentativas; tentativa++) {
          await new Promise(resolve => setTimeout(resolve, 1000 * tentativa)); // Delay exponencial
          const retryResult = await dispararWebhook(
            webhook.url,
            payload,
            webhook.headers || {},
            webhook.timeout || 30
          );
          
          if (retryResult.success) {
            return retryResult;
          }
        }
      }

      return resultado;
    });

    const resultadosCompletos = await Promise.all(promises);
    return resultadosCompletos;
  } catch (error) {
    console.error("Erro ao disparar webhooks:", error);
    return [];
  }
}

// Função para testar webhook
export async function testarWebhook(
  url: string,
  headers: Record<string, string> = {},
  timeout: number = 30
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payload: WebhookPayload = {
    evento: "teste",
    dados: {
      mensagem: "Teste de webhook",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    id: "teste",
  };

  const resultado = await dispararWebhook(url, payload, headers, timeout);
  return {
    success: resultado.success,
    statusCode: resultado.statusCode,
    error: resultado.error,
  };
}
