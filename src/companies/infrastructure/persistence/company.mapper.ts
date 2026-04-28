import { Company } from '../../domain/entities/company.entity';
import { PymeCompany } from '../../domain/entities/pyme-company.entity';
import { CorporateCompany } from '../../domain/entities/corporate-company.entity';
import { CompanyType } from '../../domain/value-objects/company-type.vo';
import { Cuit } from '../../domain/value-objects/cuit.vo';
import { InvalidCompanyDataException } from '../../domain/exceptions/invalid-company-data.exception';

/**
 * Estructura plana en disco. NO es la entidad de dominio.
 * Usamos un discriminator `type` para reconstruir el subtipo correcto.
 */
export interface CompanyRecord {
  id: string;
  type: CompanyType;
  cuit: string;
  businessName: string;
  adhesionDate: string; // ISO 8601
  // Pyme
  annualRevenue?: number;
  employeeCount?: number;
  // Corporate
  fiscalId?: string;
  legalRepresentative?: string;
}

/**
 * Mapper bidireccional entre la entidad de dominio y su representación
 * persistida. Aísla cualquier detalle de serialización del dominio.
 */
export class CompanyMapper {
  public static toRecord(company: Company): CompanyRecord {
    const base: CompanyRecord = {
      id: company.getId(),
      type: company.getType(),
      cuit: company.getCuit().getValue(),
      businessName: company.getBusinessName(),
      adhesionDate: company.getAdhesionDate().toISOString(),
    };

    if (company instanceof PymeCompany) {
      return {
        ...base,
        annualRevenue: company.getAnnualRevenue(),
        employeeCount: company.getEmployeeCount(),
      };
    }

    if (company instanceof CorporateCompany) {
      return {
        ...base,
        fiscalId: company.getFiscalId(),
        legalRepresentative: company.getLegalRepresentative(),
      };
    }

    throw new InvalidCompanyDataException(
      `Cannot serialize unknown company type: ${company.getType()}`,
    );
  }

  public static toDomain(record: CompanyRecord): Company {
    const cuit = Cuit.create(record.cuit);
    const adhesionDate = new Date(record.adhesionDate);
    const base = {
      id: record.id,
      cuit,
      businessName: record.businessName,
      adhesionDate,
    };

    switch (record.type) {
      case CompanyType.PYME:
        return PymeCompany.create({
          ...base,
          annualRevenue: record.annualRevenue as number,
          employeeCount: record.employeeCount as number,
        });
      case CompanyType.CORPORATE:
        return CorporateCompany.create({
          ...base,
          fiscalId: record.fiscalId as string,
          legalRepresentative: record.legalRepresentative as string,
        });
      default:
        throw new InvalidCompanyDataException(
          `Cannot deserialize unknown company type: ${record.type}`,
        );
    }
  }
}
