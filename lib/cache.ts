// Sistema de cache otimizado em memória
class OptimizedCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 200; // Aumentado para mais itens
  private cleanupInterval: NodeJS.Timeout;
  private accessCount = new Map<string, number>(); // Contador de acessos para LRU

  constructor() {
    // Limpar cache expirado a cada 2 minutos (mais frequente)
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanup();
      } catch (error) {
        console.error("❌ Erro no cleanup do cache:", error);
      }
    }, 2 * 60 * 1000);
  }

  // Obter item do cache
  get(key: string): any | null {
    try {
      const item = this.cache.get(key);
      
      if (!item) return null;
      
      // Verificar se expirou
      if (Date.now() > item.timestamp + item.ttl) {
        this.cache.delete(key);
        this.accessCount.delete(key);
        return null;
      }
      
      // Incrementar contador de acessos (LRU)
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
      
      return item.data;
    } catch (error) {
      console.error("❌ Erro ao obter item do cache:", error);
      return null;
    }
  }

  // Definir item no cache
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    try {
      // Se cache está cheio, remover item menos usado (LRU)
      if (this.cache.size >= this.maxSize) {
        this.evictLRU();
      }
      
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      
      // Inicializar contador de acessos
      this.accessCount.set(key, 1);
    } catch (error) {
      console.error("❌ Erro ao definir item no cache:", error);
    }
  }

  // Remover item específico
  delete(key: string): boolean {
    try {
      this.accessCount.delete(key);
      return this.cache.delete(key);
    } catch (error) {
      console.error("❌ Erro ao remover item do cache:", error);
      return false;
    }
  }

  // Limpar todo o cache
  clear(): void {
    try {
      this.cache.clear();
      this.accessCount.clear();
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
    }
  }

  // Limpar itens expirados
  private cleanup(): void {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, item] of this.cache.entries()) {
        if (now > item.timestamp + item.ttl) {
          this.cache.delete(key);
          this.accessCount.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Cache cleanup: ${cleaned} itens expirados removidos`);
      }
    } catch (error) {
      console.error("❌ Erro no cleanup do cache:", error);
    }
  }

  // Evict Least Recently Used (LRU)
  private evictLRU(): void {
    try {
      let leastUsedKey = '';
      let leastUsedCount = Infinity;
      
      for (const [key, count] of this.accessCount.entries()) {
        if (count < leastUsedCount) {
          leastUsedCount = count;
          leastUsedKey = key;
        }
      }
      
      if (leastUsedKey) {
        this.cache.delete(leastUsedKey);
        this.accessCount.delete(leastUsedKey);
        console.log(`🗑️ Cache LRU eviction: ${leastUsedKey}`);
      }
    } catch (error) {
      console.error("❌ Erro no eviction LRU do cache:", error);
    }
  }

  // Obter estatísticas do cache
  getStats() {
    try {
      return {
        size: this.cache.size,
        maxSize: this.maxSize,
        accessCount: this.accessCount.size
      };
    } catch (error) {
      console.error("❌ Erro ao obter estatísticas do cache:", error);
      return { size: 0, maxSize: this.maxSize, accessCount: 0 };
    }
  }

  // Destruir o cache (para cleanup)
  destroy() {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      this.clear();
    } catch (error) {
      console.error("❌ Erro ao destruir cache:", error);
    }
  }
}

// Instância global do cache
const cache = new OptimizedCache();

// Funções de interface para o cache
export function getCache(key: string): any | null {
  return cache.get(key);
}

export function setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, data, ttl);
}

export function deleteCache(key: string): boolean {
  return cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}

export function getCacheStats() {
  return cache.getStats();
}

// Cleanup quando o processo terminar
process.on('beforeExit', () => {
  cache.destroy();
});

process.on('SIGINT', () => {
  cache.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cache.destroy();
  process.exit(0);
});
