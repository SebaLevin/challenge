import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterCompanyDto } from './dtos/register-company.dto';
import { CompanyResponseDto } from './dtos/company-response.dto';
import { RegisterCompanyUseCase } from '../../application/use-cases/register-company.use-case';
import { GetCompaniesAdheredLastMonthUseCase } from '../../application/use-cases/get-companies-adhered-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../application/use-cases/get-companies-with-transfers-last-month.use-case';

/**
 * Adapter HTTP de entrada.
 *
 * Responsabilidades del controller:
 *  1. Recibir/validar la forma del request (delegado a class-validator vía DTO).
 *  2. Invocar al use-case correspondiente.
 *  3. Mapear el resultado a un DTO de salida.
 *
 * NO contiene lógica de negocio. Si tenés un `if` con reglas de negocio
 * acá, va al dominio o al use-case.
 */
@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly registerCompany: RegisterCompanyUseCase,
    private readonly getCompaniesAdheredLastMonth: GetCompaniesAdheredLastMonthUseCase,
    private readonly getCompaniesWithTransfersLastMonth: GetCompaniesWithTransfersLastMonthUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar la adhesión de una nueva empresa' })
  @ApiResponse({
    status: 201,
    type: CompanyResponseDto,
    description: 'Empresa registrada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'CUIT ya registrado' })
  public async register(
    @Body() dto: RegisterCompanyDto,
  ): Promise<CompanyResponseDto> {
    const company = await this.registerCompany.execute({
      type: dto.type,
      cuit: dto.cuit,
      businessName: dto.businessName,
      adhesionDate: dto.adhesionDate ? new Date(dto.adhesionDate) : undefined,
      annualRevenue: dto.annualRevenue,
      employeeCount: dto.employeeCount,
      fiscalId: dto.fiscalId,
      legalRepresentative: dto.legalRepresentative,
    });
    return CompanyResponseDto.fromDomain(company);
  }

  @Get('adhered-last-month')
  @ApiOperation({
    summary: 'Empresas que se adhirieron en el último mes (últimos 30 días)',
  })
  @ApiQuery({
    name: 'referenceDate',
    required: false,
    description:
      'Fecha de referencia (ISO 8601). Si se omite, se toma la fecha actual.',
  })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  public async listAdheredLastMonth(
    @Query('referenceDate') referenceDate?: string,
  ): Promise<CompanyResponseDto[]> {
    const ref = referenceDate ? new Date(referenceDate) : undefined;
    const companies = await this.getCompaniesAdheredLastMonth.execute(ref);
    return companies.map((c) => CompanyResponseDto.fromDomain(c));
  }

  @Get('with-transfers-last-month')
  @ApiOperation({
    summary:
      'Empresas que realizaron transferencias en el último mes (últimos 30 días)',
  })
  @ApiQuery({
    name: 'referenceDate',
    required: false,
    description:
      'Fecha de referencia (ISO 8601). Si se omite, se toma la fecha actual.',
  })
  @ApiResponse({ status: 200, type: [CompanyResponseDto] })
  public async listWithTransfersLastMonth(
    @Query('referenceDate') referenceDate?: string,
  ): Promise<CompanyResponseDto[]> {
    const ref = referenceDate ? new Date(referenceDate) : undefined;
    const companies = await this.getCompaniesWithTransfersLastMonth.execute(ref);
    return companies.map((c) => CompanyResponseDto.fromDomain(c));
  }
}
