import { Module } from '@nestjs/common';
import { TRANSFER_REPOSITORY } from './domain/ports/transfer.repository';
import { JsonTransferRepository } from './infrastructure/persistence/json-transfer.repository';

/**
 * Módulo de Transferencias.
 *
 * Cableado clave: provee el TRANSFER_REPOSITORY token con la
 * implementación JSON. CompaniesModule lo importa para usar el
 * repository sin conocer la implementación concreta.
 */
@Module({
  providers: [
    {
      provide: TRANSFER_REPOSITORY,
      useClass: JsonTransferRepository,
    },
  ],
  exports: [TRANSFER_REPOSITORY],
})
export class TransfersModule {}
