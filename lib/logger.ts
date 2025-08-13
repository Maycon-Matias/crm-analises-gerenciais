import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private logFile: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.logFile = process.env.LOG_FILE || 'logs/crm.log';
    
    // Criar diretório de logs se não existir
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private formatLogEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    
    let context = '';
    if (entry.context) context += ` | Context: ${entry.context}`;
    if (entry.userId) context += ` | User: ${entry.userId}`;
    if (entry.action) context += ` | Action: ${entry.action}`;
    if (entry.resource) context += ` | Resource: ${entry.resource}`;
    
    let metadata = '';
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      metadata = ` | Metadata: ${JSON.stringify(entry.metadata)}`;
    }
    
    let error = '';
    if (entry.error) {
      error = ` | Error: ${entry.error.message} | Stack: ${entry.error.stack}`;
    }
    
    return `${base}${context}${metadata}${error}`;
  }

  private async writeToFile(logEntry: string): Promise<void> {
    try {
      // Verificar tamanho do arquivo
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxFileSize) {
          this.rotateLogFiles();
        }
      }
      
      // Escrever no arquivo
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  private rotateLogFiles(): void {
    try {
      for (let i = this.maxFiles - 1; i > 0; i--) {
        const oldFile = `${this.logFile}.${i}`;
        const newFile = `${this.logFile}.${i + 1}`;
        
        if (fs.existsSync(oldFile)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldFile); // Remover arquivo mais antigo
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
      
      // Renomear arquivo atual
      fs.renameSync(this.logFile, `${this.logFile}.1`);
    } catch (error) {
      console.error('Erro ao rotacionar arquivos de log:', error);
    }
  }

  private async log(level: LogLevel, message: string, options: Partial<LogEntry> = {}): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    };

    const formattedEntry = this.formatLogEntry(entry);
    
    // Console para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.FATAL]: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      console.log(`${colors[level]}${formattedEntry}${reset}`);
    }

    // Arquivo para produção
    await this.writeToFile(formattedEntry);
  }

  // Métodos públicos
  async debug(message: string, options?: Partial<LogEntry>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, options);
  }

  async info(message: string, options?: Partial<LogEntry>): Promise<void> {
    await this.log(LogLevel.INFO, message, options);
  }

  async warn(message: string, options?: Partial<LogEntry>): Promise<void> {
    await this.log(LogLevel.WARN, message, options);
  }

  async error(message: string, options?: Partial<LogEntry>): Promise<void> {
    await this.log(LogLevel.ERROR, message, options);
  }

  async fatal(message: string, options?: Partial<LogEntry>): Promise<void> {
    await this.log(LogLevel.FATAL, message, options);
  }

  // Métodos específicos para auditoria
  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.info(`User action: ${action}`, {
      userId,
      action,
      resource,
      metadata: details
    });
  }

  async logSecurityEvent(
    event: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.warn(`Security event: ${event}`, {
      userId,
      action: 'security',
      resource: 'system',
      metadata: details
    });
  }

  async logDatabaseOperation(
    operation: string,
    collection: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.debug(`Database operation: ${operation}`, {
      action: operation,
      resource: collection,
      metadata: details
    });
  }

  async logWebhookEvent(
    event: string,
    target: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.info(`Webhook event: ${event}`, {
      action: 'webhook',
      resource: target,
      metadata: details
    });
  }
}

// Instância singleton
export const logger = new Logger();

// Funções de conveniência
export const logInfo = (message: string, options?: Partial<LogEntry>) => logger.info(message, options);
export const logError = (message: string, options?: Partial<LogEntry>) => logger.error(message, options);
export const logWarn = (message: string, options?: Partial<LogEntry>) => logger.warn(message, options);
export const logDebug = (message: string, options?: Partial<LogEntry>) => logger.debug(message, options);
export const logFatal = (message: string, options?: Partial<LogEntry>) => logger.fatal(message, options);
