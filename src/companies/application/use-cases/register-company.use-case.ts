import { Inject, Injectable } from '@nestjs/common';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company.repository';
import { Company } from '../../domain/entities/company.entity';
import {
  CompanyFactory,
  CreateCompanyInput,
} from '../../domain/factories/company.factory';
import { CompanyAlreadyExistsException } from '../../domain/exceptions/company-already-exists.exception';

/**
 * Caso de uso: registrar la adhesión de una nueva empresa.
 *
 * Orquesta: validación de unicidad por CUIT + creación polimórfica
 * (Pyme/Corporate) vía factory + persistencia.
 *
 * Notar que este use-case NO conoce las clases concretas PymeCompany
 * ni CorporateCompany — sólo trabaja con la abstracción Company.
 */
@Injectable()
export class RegisterCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  public async execute(input: CreateCompanyInput): Promise<Company> {
    const company = CompanyFactory.create(input);

    const existing = await this.companyRepository.findByCuit(company.getCuit());
    if (existing !== null) {
      throw new CompanyAlreadyExistsException(
        company.getCuit().getFormatted(),
      );
    }

    await this.companyRepository.save(company);
    return company;
  }
}
