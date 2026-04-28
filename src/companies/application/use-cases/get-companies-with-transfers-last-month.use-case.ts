import { Inject, Injectable } from '@nestjs/common';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company.repository';
import {
  TRANSFER_REPOSITORY,
  TransferRepository,
} from '../../../transfers/domain/ports/transfer.repository';
import { Company } from '../../domain/entities/company.entity';
import { DateRange } from '../../../shared/domain/date-range';

/**
 * Caso de uso: obtener empresas que realizaron transferencias en el último mes.
 *
 * Estrategia (dos pasos explícitos, sin joins mágicos):
 *  1. Buscar transferencias del rango.
 *  2. Extraer ids únicos de empresas.
 *  3. Cargar esas empresas desde el repositorio de empresas.
 *
 * Esto respeta la regla DDD de comunicación entre agregados por id,
 * y deja al motor de persistencia decidir cómo optimizar (índices,
 * caches, batch fetch, etc.) sin filtrar la decisión al dominio.
 */
@Injectable()
export class GetCompaniesWithTransfersLastMonthUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(TRANSFER_REPOSITORY)
    private readonly transferRepository: TransferRepository,
  ) {}

  public async execute(referenceDate?: Date): Promise<Company[]> {
    const { from, to } = DateRange.lastMonth(referenceDate);

    const transfers = await this.transferRepository.findBetween(from, to);
    if (transfers.length === 0) return [];

    const uniqueCompanyIds = Array.from(
      new Set(transfers.map((t) => t.getCompanyId())),
    );

    return this.companyRepository.findByIds(uniqueCompanyIds);
  }
}
