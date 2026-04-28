import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './companies/companies.module';
import { TransfersModule } from './transfers/transfers.module';
import { SharedModule } from './shared/infrastructure/shared.module';

@Module({
  imports: [
    // Carga el .env (si existe) y expone las variables vía process.env.
    // isGlobal: true → no hace falta importar ConfigModule en cada módulo.
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    CompaniesModule,
    TransfersModule,
  ],
})
export class AppModule {}
