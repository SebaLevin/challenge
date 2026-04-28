import { Global, Module } from '@nestjs/common';
import * as path from 'path';
import { JsonStorage } from './persistence/json-storage.service';
import { DATA_DIR } from './persistence/data-dir.token';

/**
 * Módulo compartido global. Provee el JsonStorage y el DATA_DIR
 * configurable por env var.
 */
@Global()
@Module({
  providers: [
    JsonStorage,
    {
      provide: DATA_DIR,
      useFactory: () =>
        process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data'),
    },
  ],
  exports: [JsonStorage, DATA_DIR],
})
export class SharedModule {}
