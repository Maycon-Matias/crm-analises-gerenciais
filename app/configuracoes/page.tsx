"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trash2,
  Plus,
  Settings,
  Upload,
  RotateCcw,
  FileText,
  Database,
  Shield,
  Info,
  CheckCircle,
  Download,
  Save,
  History,
  Users,
  Building,
  Bell,
  Palette,
  Lock,
  Activity,
  Target,
  DollarSign,
} from "lucide-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { ProtectedLayout } from "@/components/protected-layout";
import { useConfig } from "@/hooks/use-config";
import { useAuth } from "@/hooks/use-auth";
import { useSistema } from "@/hooks/use-sistema";
import { ThemeToggle } from "@/components/theme-toggle";
import { CSVImportWizard } from "@/components/csv-import-wizard";
import { useToast } from "@/components/ui/use-toast";
import { WebhookManager } from "@/components/webhook-manager";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    logs,
    backups,
    criarBackup,
    restaurarBackup,
    limparLogs,
    exportarLogs,
    adicionarNotificacao,
  } = useSistema();

  // Estados para configurações
  const [configSistema, setConfigSistema] = useState({
    backupAutomatico: true,
    notificacoesEmail: false,
    temaEscuro: false,
    logsDetalhados: true,
  });

  const [configNegocio, setConfigNegocio] = useState({
    comissaoPadrao: 2.5,
    metaMensalPadrao: 50000,
    statusPadrao: "pendente",
    diasVencimento: 30,
  });

  const [backupNome, setBackupNome] = useState("");
  const [backupDescricao, setBackupDescricao] = useState("");

  const handleCriarBackup = () => {
    if (!backupNome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o backup",
        variant: "destructive",
      });
      return;
    }
    criarBackup(backupNome, backupDescricao);
    setBackupNome("");
    setBackupDescricao("");
    toast({
      title: "Backup criado!",
      description: "Backup salvo com sucesso",
    });
  };

  const handleRestaurarBackup = (backupId: string) => {
    restaurarBackup(backupId);
    toast({
      title: "Backup restaurado!",
      description: "Configurações restauradas com sucesso",
    });
  };

  return (
    <ProtectedLayout adminOnly>
      <SidebarLayout>
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" />
                Configurações do Sistema
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie configurações do sistema e usuários
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={exportarLogs}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Usuários Ativos
                    </p>
                    <p className="text-2xl font-bold text-blue-600">6</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Backups
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {backups.length}
                    </p>
                  </div>
                  <Save className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Logs Hoje
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {logs.filter(log => 
                        new Date(log.timestamp + 'T00:00:00').toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sistema
                    </p>
                    <p className="text-2xl font-bold text-purple-600">Online</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 h-12">
              <TabsTrigger value="geral" className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="negocio" className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Negócio</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Webhooks</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2 text-sm">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Backup</span>
              </TabsTrigger>
              <TabsTrigger value="importacao" className="flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importação</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações do Sistema */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações do Sistema
                    </CardTitle>
                    <CardDescription>
                      Configurações básicas do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Backup Automático</Label>
                        <p className="text-sm text-muted-foreground">
                          Criar backup automático diário
                        </p>
                      </div>
                      <Switch
                        checked={configSistema.backupAutomatico}
                        onCheckedChange={(checked) =>
                          setConfigSistema(prev => ({ ...prev, backupAutomatico: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar notificações por email
                        </p>
                      </div>
                      <Switch
                        checked={configSistema.notificacoesEmail}
                        onCheckedChange={(checked) =>
                          setConfigSistema(prev => ({ ...prev, notificacoesEmail: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Logs Detalhados</Label>
                        <p className="text-sm text-muted-foreground">
                          Registrar logs detalhados do sistema
                        </p>
                      </div>
                      <Switch
                        checked={configSistema.logsDetalhados}
                        onCheckedChange={(checked) =>
                          setConfigSistema(prev => ({ ...prev, logsDetalhados: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Segurança
                    </CardTitle>
                    <CardDescription>
                      Configurações de segurança do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Timeout de Sessão (minutos)</Label>
                      <Input
                        type="number"
                        defaultValue={30}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label>Máximo de Tentativas de Login</Label>
                      <Input
                        type="number"
                        defaultValue={5}
                        className="mt-1"
                        placeholder="5"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Usuários */}
            <TabsContent value="usuarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie usuários e permissões do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Usuários Ativos</h3>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { id: "1", nome: "Maycon", email: "admin@poracred.com", role: "admin", status: "ativo" },
                        { id: "2", nome: "Amanda", email: "amanda@poracred.com", role: "user", status: "ativo" },
                        { id: "3", nome: "Adriana", email: "adriana@poracred.com", role: "user", status: "ativo" },
                        { id: "4", nome: "Lais", email: "lais@poracred.com", role: "user", status: "ativo" },
                        { id: "5", nome: "Ana", email: "ana@poracred.com", role: "user", status: "ativo" },
                        { id: "6", nome: "Mariele", email: "mariele@poracred.com", role: "user", status: "ativo" },
                      ].map((usuario) => (
                        <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {usuario.nome.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{usuario.nome}</p>
                              <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={usuario.role === "admin" ? "default" : "secondary"}>
                              {usuario.role === "admin" ? "Administrador" : "Vendedor"}
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              {usuario.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Negócio */}
            <TabsContent value="negocio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações de Comissões */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Configurações de Comissões
                    </CardTitle>
                    <CardDescription>
                      Configure comissões e regras de negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Comissão Padrão (%)</Label>
                      <Input
                        type="number"
                        value={configNegocio.comissaoPadrao}
                        onChange={(e) =>
                          setConfigNegocio(prev => ({ 
                            ...prev, 
                            comissaoPadrao: parseFloat(e.target.value) 
                          }))
                        }
                        className="mt-1"
                        placeholder="2.5"
                      />
                    </div>
                    <div>
                      <Label>Meta Mensal Padrão (R$)</Label>
                      <Input
                        type="number"
                        value={configNegocio.metaMensalPadrao}
                        onChange={(e) =>
                          setConfigNegocio(prev => ({ 
                            ...prev, 
                            metaMensalPadrao: parseFloat(e.target.value) 
                          }))
                        }
                        className="mt-1"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label>Status Padrão de Cliente</Label>
                      <Select
                        value={configNegocio.statusPadrao}
                        onValueChange={(value) =>
                          setConfigNegocio(prev => ({ ...prev, statusPadrao: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações de Metas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Configurações de Metas
                    </CardTitle>
                    <CardDescription>
                      Configure metas e objetivos do negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Dias para Vencimento</Label>
                      <Input
                        type="number"
                        value={configNegocio.diasVencimento}
                        onChange={(e) =>
                          setConfigNegocio(prev => ({ 
                            ...prev, 
                            diasVencimento: parseInt(e.target.value) 
                          }))
                        }
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notificações de Metas</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="meta-75" />
                          <Label htmlFor="meta-75">Alerta a 75% da meta</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="meta-90" defaultChecked />
                          <Label htmlFor="meta-90">Alerta a 90% da meta</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="meta-100" defaultChecked />
                          <Label htmlFor="meta-100">Alerta ao atingir meta</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Backup */}
            <TabsContent value="backup" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Criar Backup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Criar Backup
                    </CardTitle>
                    <CardDescription>
                      Crie um backup manual do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nome do Backup</Label>
                      <Input
                        value={backupNome}
                        onChange={(e) => setBackupNome(e.target.value)}
                        placeholder="Ex: Backup Mensal - Janeiro 2024"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Descrição (opcional)</Label>
                      <Textarea
                        value={backupDescricao}
                        onChange={(e) => setBackupDescricao(e.target.value)}
                        placeholder="Descreva o conteúdo deste backup..."
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleCriarBackup} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Criar Backup
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Backups */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Backups Disponíveis ({backups.length})
                    </CardTitle>
                    <CardDescription>
                      Restaure backups anteriores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      {backups.length > 0 ? (
                        <div className="space-y-3">
                          {backups.map((backup) => (
                            <div
                              key={backup.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{backup.nome}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {backup.descricao}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {new Date(backup.criadoEm + 'T00:00:00').toLocaleDateString("pt-BR")}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      por {backup.criadoPor}
                                    </Badge>
                                  </div>
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4 mr-1" />
                                      Restaurar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirmar Restauração</DialogTitle>
                                      <DialogDescription>
                                        Tem certeza que deseja restaurar o backup "{backup.nome}"? 
                                        Isso substituirá todas as configurações atuais.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline">Cancelar</Button>
                                      <Button
                                        onClick={() => handleRestaurarBackup(backup.id)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Restaurar
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Save className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Nenhum backup criado ainda
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Webhooks */}
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Gerenciamento de Webhooks
                  </CardTitle>
                  <CardDescription>
                    Configure webhooks para integração com sistemas externos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WebhookManager />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Importação */}
            <TabsContent value="importacao" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Importação de Dados
                  </CardTitle>
                  <CardDescription>
                    Importe dados de clientes via CSV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CSVImportWizard
                    onImport={async (dados) => {
                      const essenciais = [
                        "cliente", "produto", "banco", "fonte", 
                        "valor", "data", "mes", "usuarios"
                      ];
                      const dadosEssenciais = dados.map((item) => {
                        const obj: Record<string, any> = {};
                        essenciais.forEach((campo) => {
                          obj[campo] = item[campo] || "";
                        });
                        return obj;
                      });
                      try {
                        const res = await fetch("/api/clientes/importar", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ clientes: dadosEssenciais })
                        });
                        if (res.ok) {
                          toast({
                            title: "Importação concluída!",
                            description: `${dadosEssenciais.length} clientes importados com sucesso.`,
                            variant: "default"
                          });
                        } else {
                          toast({
                            title: "Erro ao importar",
                            description: "Verifique o formato dos dados e tente novamente.",
                            variant: "destructive"
                          });
                        }
                      } catch (e) {
                        toast({
                          title: "Erro inesperado",
                          description: "Não foi possível importar os clientes.",
                          variant: "destructive"
                        });
                      }
                    }}
                    onCancel={() => {}}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarLayout>
    </ProtectedLayout>
  );
}
