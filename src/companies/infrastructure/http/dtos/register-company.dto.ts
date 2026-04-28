import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';
import { CompanyType } from '../../../domain/value-objects/company-type.vo';

/**
 * DTO para registrar una empresa.
 *
 * Diseño: un único DTO con discriminator `type`. Los campos específicos
 * de cada subtipo se validan condicionalmente con @ValidateIf.
 *
 * Alternativa considerada: dos endpoints separados (POST /companies/pyme,
 * POST /companies/corporate). Descartada porque el challenge especifica
 * un único endpoint de adhesión con dos variantes.
 */
export class RegisterCompanyDto {
  @ApiProperty({
    enum: CompanyType,
    description: 'Tipo de empresa',
    example: CompanyType.PYME,
  })
  @IsEnum(CompanyType)
  type!: CompanyType;

  @ApiProperty({
    description: 'CUIT de la empresa (con o sin guiones)',
    example: '30-71598293-4',
  })
  @IsString()
  @Length(11, 13)
  cuit!: string;

  @ApiProperty({
    description: 'Razón social',
    example: 'ACME S.A.',
  })
  @IsString()
  @Length(2, 200)
  businessName!: string;

  // ---- Pyme-specific ----

  @ApiProperty({
    required: false,
    description: 'Facturación anual en ARS (sólo para empresas Pyme)',
    example: 50000000,
  })
  @ValidateIf((o: RegisterCompanyDto) => o.type === CompanyType.PYME)
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @ApiProperty({
    required: false,
    description: 'Cantidad de empleados (sólo para empresas Pyme)',
    example: 25,
  })
  @ValidateIf((o: RegisterCompanyDto) => o.type === CompanyType.PYME)
  @IsInt()
  @Min(1)
  employeeCount?: number;

  // ---- Corporate-specific ----

  @ApiProperty({
    required: false,
    description: 'Identificador fiscal extendido (sólo para Corporate)',
    example: 'AR-30715982934',
  })
  @ValidateIf((o: RegisterCompanyDto) => o.type === CompanyType.CORPORATE)
  @IsString()
  @Length(3, 50)
  fiscalId?: string;

  @ApiProperty({
    required: false,
    description: 'Nombre del representante legal (sólo para Corporate)',
    example: 'María González',
  })
  @ValidateIf((o: RegisterCompanyDto) => o.type === CompanyType.CORPORATE)
  @IsString()
  @Length(2, 200)
  legalRepresentative?: string;

  @ApiProperty({
    required: false,
    description:
      'Fecha de adhesión (ISO 8601). Si se omite, se toma la fecha actual.',
    example: '2026-04-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  adhesionDate?: string;
}
