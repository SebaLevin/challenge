import { Module } from '@nestjs/common';
import { CompanyController } from './infrastructure/http/company.controller';
import { COMPANY_REPOSITORY } from './domain/ports/company.repository';
import { JsonCompanyRepository } from './infrastructure/persistence/json-company.repository';
import { RegisterCompanyUseCase } from './application/use-cases/register-company.use-case';
import { GetCompaniesAdheredLastMonthUseCase } from './application/use-cases/get-companies-adhered-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from './application/use-cases/get-companies-with-transfers-last-month.use-case';
import { TransfersModule } from '../transfers/transfers.module';

/**
 * Módulo de Empresas.
 *
 * Wiring:
 *  - El token COMPANY_REPOSITORY (interface) se asocia a JsonCompanyRepository (implementación).
 *  - Use cases declarados como providers para que NestJS los inyecte en el controller.
 *  - Importa TransfersModule para acceder al TRANSFER_REPOSITORY desde
 *    GetCompaniesWithTransfersLastMonthUseCase.
 */
@Module({
  imports: [TransfersModule],
  controllers: [CompanyController],
  providers: [
    RegisterCompanyUseCase,
    GetCompaniesAdheredLastMonthUseCase,
    GetCompaniesWithTransfersLastMonthUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useClass: JsonCompanyRepository,
    },
  ],
})
export class CompaniesModule {}
