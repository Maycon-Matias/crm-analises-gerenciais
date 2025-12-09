"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { useSistema } from "@/hooks/use-sistema";
import { useAuth } from "@/hooks/use-auth";
import React from "react";
import { formatarDataHoraRobusta } from "@/lib/utils";

export function NotificationCenter() {
  const { notificacoes, marcarNotificacaoLida, limparNotificacoes } =
    useSistema();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // CORREÇÃO: Otimizar filtros com useMemo
  const { notificacoesDoUsuario, notificacaoNaoLidas } = React.useMemo(() => {
    if (!user) {
      return { notificacoesDoUsuario: [], notificacaoNaoLidas: [] };
    }

    const notificacoesDoUsuario = user.role === "admin" 
      ? notificacoes 
      : notificacoes.filter(n => n.usuarioId === user.id || !n.usuarioId); // Incluir notificações sem usuarioId (sistema)

    const notificacaoNaoLidas = notificacoesDoUsuario.filter((n) => !n.lida);

    return { notificacoesDoUsuario, notificacaoNaoLidas };
  }, [notificacoes, user]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (tipo: string, lida: boolean) => {
    if (lida) return "bg-muted/30";

    switch (tipo) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-green-800";
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificacaoNaoLidas.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {notificacaoNaoLidas.length > 9
                ? "9+"
                : notificacaoNaoLidas.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                {notificacaoNaoLidas.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notificacaoNaoLidas.length} novas
                  </Badge>
                )}
                {notificacoesDoUsuario.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparNotificacoes}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
                          {notificacoesDoUsuario.length > 0 ? (
              <div className="space-y-2 p-3">
                {notificacoesDoUsuario.slice(0, 10).map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${getBgColor(notificacao.tipo, notificacao.lida)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getIcon(notificacao.tipo)}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${!notificacao.lida ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notificacao.titulo}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notificacao.mensagem}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatarDataHoraRobusta(notificacao.criadaEm, {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        {!notificacao.lida && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() =>
                              marcarNotificacaoLida(notificacao.id)
                            }
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
