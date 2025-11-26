"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useConfig } from "@/hooks/use-config";
import { WebhookConfig } from "@/types/config";
import { Trash2, Plus, TestTube, Save, Edit } from "lucide-react";

const EVENTOS_WEBHOOK = [
  { id: "cliente.criado", label: "Cliente Criado" },
  { id: "cliente.atualizado", label: "Cliente Atualizado" },
  { id: "cliente.excluido", label: "Cliente Excluído" },
  { id: "cliente.pago", label: "Cliente Pago" },
];

export function WebhookManager() {
  const { configuracao, adicionarWebhook, removerWebhook, atualizarWebhook } = useConfig();
  const { toast } = useToast();
  const [editando, setEditando] = useState<string | null>(null);
  const [testando, setTestando] = useState<string | null>(null);

  const [novoWebhook, setNovoWebhook] = useState({
    nome: "",
    url: "",
    eventos: [] as string[],
    ativo: true,
    headers: "",
    timeout: 30,
    tentativas: 3,
  });

  const handleAdicionarWebhook = () => {
    if (!novoWebhook.nome || !novoWebhook.url || novoWebhook.eventos.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const headers = novoWebhook.headers
        ? JSON.parse(novoWebhook.headers)
        : {};

      adicionarWebhook({
        nome: novoWebhook.nome,
        url: novoWebhook.url,
        eventos: novoWebhook.eventos as any,
        ativo: novoWebhook.ativo,
        headers,
        timeout: novoWebhook.timeout,
        tentativas: novoWebhook.tentativas,
      });

      setNovoWebhook({
        nome: "",
        url: "",
        eventos: [],
        ativo: true,
        headers: "",
        timeout: 30,
        tentativas: 3,
      });

      toast({
        title: "Sucesso",
        description: "Webhook adicionado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar webhook",
        variant: "destructive",
      });
    }
  };

  const handleTestarWebhook = async (webhook: WebhookConfig) => {
    setTestando(webhook.id);
    try {
      const response = await fetch("/api/webhooks/teste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhook.url,
          headers: webhook.headers,
          timeout: webhook.timeout,
        }),
      });

      const resultado = await response.json();

      if (resultado.success) {
        toast({
          title: "Teste bem-sucedido",
          description: `Webhook respondeu com status ${resultado.statusCode}`,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: resultado.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar webhook",
        variant: "destructive",
      });
    } finally {
      setTestando(null);
    }
  };

  const handleRemoverWebhook = (id: string) => {
    removerWebhook(id);
    toast({
      title: "Sucesso",
      description: "Webhook removido com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Webhook</Label>
              <Input
                id="nome"
                value={novoWebhook.nome}
                onChange={(e) =>
                  setNovoWebhook((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder="Ex: Notificação WhatsApp"
              />
            </div>
            <div>
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url"
                value={novoWebhook.url}
                onChange={(e) =>
                  setNovoWebhook((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://api.exemplo.com/webhook"
              />
            </div>
          </div>

          <div>
            <Label>Eventos</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {EVENTOS_WEBHOOK.map((evento) => (
                <div key={evento.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={evento.id}
                    checked={novoWebhook.eventos.includes(evento.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNovoWebhook((prev) => ({
                          ...prev,
                          eventos: [...prev.eventos, evento.id],
                        }));
                      } else {
                        setNovoWebhook((prev) => ({
                          ...prev,
                          eventos: prev.eventos.filter((e) => e !== evento.id),
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={evento.id} className="text-sm">
                    {evento.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (segundos)</Label>
              <Input
                id="timeout"
                type="number"
                value={novoWebhook.timeout}
                onChange={(e) =>
                  setNovoWebhook((prev) => ({
                    ...prev,
                    timeout: parseInt(e.target.value) || 30,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="tentativas">Tentativas</Label>
              <Input
                id="tentativas"
                type="number"
                value={novoWebhook.tentativas}
                onChange={(e) =>
                  setNovoWebhook((prev) => ({
                    ...prev,
                    tentativas: parseInt(e.target.value) || 3,
                  }))
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={novoWebhook.ativo}
                onCheckedChange={(checked) =>
                  setNovoWebhook((prev) => ({ ...prev, ativo: checked }))
                }
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="headers">Headers (JSON opcional)</Label>
            <Textarea
              id="headers"
              value={novoWebhook.headers}
              onChange={(e) =>
                setNovoWebhook((prev) => ({ ...prev, headers: e.target.value }))
              }
              placeholder='{"Authorization": "Bearer token"}'
              rows={3}
            />
          </div>

          <Button onClick={handleAdicionarWebhook} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Webhook
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Webhooks Configurados</h3>
        {configuracao.webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum webhook configurado
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {configuracao.webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{webhook.nome}</h4>
                        <Badge variant={webhook.ativo ? "default" : "secondary"}>
                          {webhook.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {webhook.url}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.eventos.map((evento) => (
                          <Badge key={evento} variant="outline" className="text-xs">
                            {EVENTOS_WEBHOOK.find((e) => e.id === evento)?.label || evento}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Timeout: {webhook.timeout}s | Tentativas: {webhook.tentativas}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestarWebhook(webhook)}
                        disabled={testando === webhook.id}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        {testando === webhook.id ? "Testando..." : "Testar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditando(webhook.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoverWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
