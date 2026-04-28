import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../../domain/entities/company.entity';
import { PymeCompany } from '../../../domain/entities/pyme-company.entity';
import { CorporateCompany } from '../../../domain/entities/corporate-company.entity';
import { CompanyType } from '../../../domain/value-objects/company-type.vo';

/**
 * DTO de salida para Company.
 *
 * Estable e independiente del modelo de dominio: si el dominio cambia
 * cómo guarda los campos internamente, este DTO mantiene el contrato
 * con los clientes HTTP.
 */
export class CompanyResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.PYME })
  type!: CompanyType;

  @ApiProperty({ example: '30-71598293-4' })
  cuit!: string;

  @ApiProperty({ example: 'ACME S.A.' })
  businessName!: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  adhesionDate!: string;

  @ApiProperty({ required: false, example: 50000000 })
  annualRevenue?: number;

  @ApiProperty({ required: false, example: 25 })
  employeeCount?: number;

  @ApiProperty({ required: false, example: 'AR-30715982934' })
  fiscalId?: string;

  @ApiProperty({ required: false, example: 'María González' })
  legalRepresentative?: string;

  public static fromDomain(company: Company): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = company.getId();
    dto.type = company.getType();
    dto.cuit = company.getCuit().getFormatted();
    dto.businessName = company.getBusinessName();
    dto.adhesionDate = company.getAdhesionDate().toISOString();

    if (company instanceof PymeCompany) {
      dto.annualRevenue = company.getAnnualRevenue();
      dto.employeeCount = company.getEmployeeCount();
    } else if (company instanceof CorporateCompany) {
      dto.fiscalId = company.getFiscalId();
      dto.legalRepresentative = company.getLegalRepresentative();
    }

    return dto;
  }
}
