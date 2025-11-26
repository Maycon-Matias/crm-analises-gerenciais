"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { ConfiguracaoSistema, CampoPersonalizado, WebhookConfig } from "@/types/config";
import { configuracaoPadrao } from "@/types/config";
import { generateId } from "@/lib/utils";

interface ConfigContextType {
  configuracao: ConfiguracaoSistema;
  atualizarConfiguracao: (novaConfig: Partial<ConfiguracaoSistema>) => void;
  adicionarCampo: (campo: Omit<CampoPersonalizado, "id">) => void;
  removerCampo: (id: string) => void;
  atualizarCampo: (id: string, campo: Partial<CampoPersonalizado>) => void;
  adicionarWebhook: (webhook: Omit<WebhookConfig, "id" | "criadoEm" | "criadoPor">) => void;
  removerWebhook: (id: string) => void;
  atualizarWebhook: (id: string, webhook: Partial<WebhookConfig>) => void;
  resetarConfiguracao: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoSistema>(configuracaoPadrao);

  useEffect(() => {
    const configSalva = localStorage.getItem("configuracao-sistema");
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("configuracao-sistema", JSON.stringify(configuracao));
  }, [configuracao]);

  const atualizarConfiguracao = (novaConfig: Partial<ConfiguracaoSistema>) => {
    setConfiguracao((prev) => ({ ...prev, ...novaConfig }));
  };

  const adicionarCampo = (campo: Omit<CampoPersonalizado, "id">) => {
    const novoCampo: CampoPersonalizado = {
      ...campo,
      id: generateId(),
    };
    setConfiguracao((prev) => ({
      ...prev,
      camposPersonalizados: [...prev.camposPersonalizados, novoCampo],
    }));
  };

  const removerCampo = (id: string) => {
    setConfiguracao((prev) => ({
      ...prev,
      camposPersonalizados: prev.camposPersonalizados.filter(
        (campo) => campo.id !== id,
      ),
    }));
  };

  const atualizarCampo = (
    id: string,
    campoAtualizado: Partial<CampoPersonalizado>,
  ) => {
    setConfiguracao((prev) => ({
      ...prev,
      camposPersonalizados: prev.camposPersonalizados.map((campo) =>
        campo.id === id ? { ...campo, ...campoAtualizado } : campo,
      ),
    }));
  };

  const adicionarWebhook = (webhook: Omit<WebhookConfig, "id" | "criadoEm" | "criadoPor">) => {
    const novoWebhook: WebhookConfig = {
      ...webhook,
      id: generateId(),
      criadoEm: new Date().toISOString(),
      criadoPor: "Sistema",
    };
    setConfiguracao((prev) => ({
      ...prev,
      webhooks: [...prev.webhooks, novoWebhook],
    }));
  };

  const removerWebhook = (id: string) => {
    setConfiguracao((prev) => ({
      ...prev,
      webhooks: prev.webhooks.filter((webhook) => webhook.id !== id),
    }));
  };

  const atualizarWebhook = (id: string, webhookAtualizado: Partial<WebhookConfig>) => {
    setConfiguracao((prev) => ({
      ...prev,
      webhooks: prev.webhooks.map((webhook) =>
        webhook.id === id ? { ...webhook, ...webhookAtualizado } : webhook,
      ),
    }));
  };

  const resetarConfiguracao = () => {
    setConfiguracao(configuracaoPadrao);
  };

  return (
    <ConfigContext.Provider
      value={{
        configuracao,
        atualizarConfiguracao,
        adicionarCampo,
        removerCampo,
        atualizarCampo,
        adicionarWebhook,
        removerWebhook,
        atualizarWebhook,
        resetarConfiguracao,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig deve ser usado dentro de um ConfigProvider");
  }
  return context;
}
