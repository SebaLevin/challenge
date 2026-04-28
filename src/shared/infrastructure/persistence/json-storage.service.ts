import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Servicio de persistencia JSON file-based.
 *
 * Características:
 *  - Lock por archivo para serializar lecturas/escrituras concurrentes
 *    dentro del mismo proceso (suficiente para una API single-instance).
 *  - Escritura atómica: escribe a un archivo temporal y hace rename,
 *    evitando archivos corruptos si el proceso muere a mitad de un write.
 *  - Crea el archivo con un valor por defecto si no existe.
 *
 * Limitaciones (documentadas en README):
 *  - No es seguro entre múltiples procesos. Para producción real
 *    se reemplaza este adapter por uno de DB sin tocar el dominio.
 */
@Injectable()
export class JsonStorage {
  private locks: Map<string, Promise<void>> = new Map();

  public async read<T>(filePath: string, defaultValue: T): Promise<T> {
    return this.withLock(filePath, async () => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as T;
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          await this.ensureDir(filePath);
          await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
          return defaultValue;
        }
        throw err;
      }
    });
  }

  public async write<T>(filePath: string, data: T): Promise<void> {
    return this.withLock(filePath, async () => {
      await this.ensureDir(filePath);
      const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2));
      await fs.rename(tmp, filePath);
    });
  }

  private async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((res) => (release = res));
    this.locks.set(key, previous.then(() => current));

    try {
      await previous;
      return await fn();
    } finally {
      release();
      if (this.locks.get(key) === previous.then(() => current)) {
        this.locks.delete(key);
      }
    }
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }
}
