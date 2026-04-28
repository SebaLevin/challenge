import { v4 as uuid } from 'uuid';
import { Company } from '../entities/company.entity';
import { PymeCompany } from '../entities/pyme-company.entity';
import { CorporateCompany } from '../entities/corporate-company.entity';
import { Cuit } from '../value-objects/cuit.vo';
import { CompanyType } from '../value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../exceptions/invalid-company-data.exception';

export interface CreateCompanyInput {
  type: CompanyType;
  cuit: string;
  businessName: string;
  adhesionDate?: Date;
  // Pyme-specific
  annualRevenue?: number;
  employeeCount?: number;
  // Corporate-specific
  fiscalId?: string;
  legalRepresentative?: string;
}

/**
 * Factory que encapsula la creación polimórfica de empresas.
 *
 * Centraliza:
 * - Generación de id.
 * - Asignación de fecha de adhesión por defecto.
 * - Instanciación del subtipo correcto según CompanyType.
 *
 * Los use-cases no deben conocer las clases concretas Pyme/Corporate,
 * sólo la abstracción Company y esta factory.
 */
export class CompanyFactory {
  public static create(input: CreateCompanyInput): Company {
    const id = uuid();
    const cuit = Cuit.create(input.cuit);
    const adhesionDate = input.adhesionDate ?? new Date();
    const base = {
      id,
      cuit,
      businessName: input.businessName,
      adhesionDate,
    };

    switch (input.type) {
      case CompanyType.PYME:
        return PymeCompany.create({
          ...base,
          annualRevenue: input.annualRevenue as number,
          employeeCount: input.employeeCount as number,
        });
      case CompanyType.CORPORATE:
        return CorporateCompany.create({
          ...base,
          fiscalId: input.fiscalId as string,
          legalRepresentative: input.legalRepresentative as string,
        });
      default:
        throw new InvalidCompanyDataException(
          `Unknown company type: ${input.type}`,
        );
    }
  }
}
