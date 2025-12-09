"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import React from "react";

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { clientes } = useClientes();

  // Filtrar clientes apenas do usuário logado (exceto admins)
  const clientesDoUsuario = React.useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return clientes;
    return clientes.filter(c => c.criadoPor === user.id);
  }, [clientes, user]);

  // CORREÇÃO: Otimizar geração de notificações com useMemo
  const notifications = React.useMemo(() => {
    if (!user) return [];

    const newNotifications: Notification[] = [];

    // Notificação de clientes pendentes do usuário
    const clientesPendentes = clientesDoUsuario.filter(c => c.status === "pendente");
    if (clientesPendentes.length > 5) {
      newNotifications.push({
        id: "pending-clients",
        type: "warning",
        title: "Clientes Pendentes",
        message: `Você tem ${clientesPendentes.length} clientes pendentes que precisam de atenção.`,
        timestamp: new Date(),
        read: false,
        action: {
          label: "Ver Clientes",
          onClick: () => window.location.href = "/clientes"
        }
      });
    }

    // Notificação de metas do usuário
    const clientesPagos = clientesDoUsuario.filter(c => c.status === "pago");
    if (clientesPagos.length > 0) {
      const valorTotal = clientesPagos.reduce((acc, c) => {
        const valor = Number(c.valor.replace("R$", "").replace(/\./g, "").replace(",", "."));
        return acc + (isNaN(valor) ? 0 : valor);
      }, 0);

      // Meta personalizada baseada no usuário
      const metaUsuario = user.role === "admin" ? 1000000 : 100000; // Meta menor para usuários comuns
      
      if (valorTotal > metaUsuario) {
        newNotifications.push({
          id: "high-revenue",
          type: "success",
          title: "Meta Atingida!",
          message: `Parabéns! Você atingiu R$ ${valorTotal.toLocaleString("pt-BR")} em vendas.`,
          timestamp: new Date(),
          read: false
        });
      }
    }

    // Notificação de performance mensal
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const clientesDoMes = clientesDoUsuario.filter(c => {
      const data = new Date(c.data + 'T00:00:00');
      return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
    });

    if (clientesDoMes.length > 0) {
      const metaMensal = user.role === "admin" ? 50 : 20; // Meta mensal personalizada
      const progresso = (clientesDoMes.length / metaMensal) * 100;
      
      if (progresso >= 80 && progresso < 100) {
        newNotifications.push({
          id: "near-goal",
          type: "info",
          title: "Meta Próxima!",
          message: `Você está a ${Math.ceil(metaMensal - clientesDoMes.length)} clientes de atingir sua meta mensal.`,
          timestamp: new Date(),
          read: false
        });
      }
    }

    return newNotifications;
  }, [clientesDoUsuario, user]);

  // CORREÇÃO: Remover useEffect desnecessário e usar estado local
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Atualizar notificações locais quando mudarem
  React.useEffect(() => {
    setLocalNotifications(notifications);
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const removeNotification = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const notification = localNotifications.find(n => n.id === id);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info": return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "border-green-200 bg-green-50 dark:bg-green-900/20";
      case "warning": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20";
      case "error": return "border-red-200 bg-red-50 dark:bg-red-900/20";
      case "info": return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                Marcar todas como lidas
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {localNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {localNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-all duration-200 hover:shadow-md ${
                      notification.read ? "opacity-60" : ""
                    } ${getTypeStyles(notification.type)}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString("pt-BR", { 
                                  hour: "2-digit", 
                                  minute: "2-digit" 
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                notification.action?.onClick();
                                markAsRead(notification.id);
                              }}
                              className="mt-2 text-xs"
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 