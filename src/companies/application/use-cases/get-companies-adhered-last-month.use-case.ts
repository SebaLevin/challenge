import { Inject, Injectable } from '@nestjs/common';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company.repository';
import { Company } from '../../domain/entities/company.entity';
import { DateRange } from '../../../shared/domain/date-range';

/**
 * Caso de uso: obtener empresas adheridas en el último mes.
 *
 * Recibe opcionalmente una fecha de referencia para facilitar testing
 * y permitir consultas históricas.
 */
@Injectable()
export class GetCompaniesAdheredLastMonthUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  public async execute(referenceDate?: Date): Promise<Company[]> {
    const { from, to } = DateRange.lastMonth(referenceDate);
    return this.companyRepository.findAdheredBetween(from, to);
  }
}
