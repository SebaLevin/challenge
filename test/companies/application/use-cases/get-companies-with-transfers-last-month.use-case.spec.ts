import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../../src/companies/application/use-cases/get-companies-with-transfers-last-month.use-case';
import { CompanyFactory } from '../../../../src/companies/domain/factories/company.factory';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { Transfer } from '../../../../src/transfers/domain/entities/transfer.entity';
import { Money } from '../../../../src/shared/domain/value-objects/money.vo';
import { InMemoryCompanyRepository } from '../../../_fakes/in-memory-company.repository';
import { InMemoryTransferRepository } from '../../../_fakes/in-memory-transfer.repository';

const days = (n: number) => 1000 * 60 * 60 * 24 * n;

describe('GetCompaniesWithTransfersLastMonthUseCase', () => {
  let companyRepo: InMemoryCompanyRepository;
  let transferRepo: InMemoryTransferRepository;
  let useCase: GetCompaniesWithTransfersLastMonthUseCase;
  const referenceDate = new Date('2026-04-30T00:00:00Z');

  beforeEach(async () => {
    companyRepo = new InMemoryCompanyRepository();
    transferRepo = new InMemoryTransferRepository();
    useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepo,
      transferRepo,
    );

    // Empresas (todas existen, sus fechas de adhesión no importan acá)
    const acme = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });
    const beta = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-70887654-9',
      businessName: 'Beta',
      annualRevenue: 2_000_000,
      employeeCount: 10,
    });
    const gamma = CompanyFactory.create({
      type: CompanyType.CORPORATE,
      cuit: '30-50001091-2',
      businessName: 'Gamma',
      fiscalId: 'AR-30500010912',
      legalRepresentative: 'Juan Pérez',
    });
    await companyRepo.save(acme);
    await companyRepo.save(beta);
    await companyRepo.save(gamma);

    // Transferencias:
    //  - ACME: 2 dentro del último mes (debe aparecer una sola vez en el resultado)
    //  - Beta: 0 transferencias (no debe aparecer)
    //  - Gamma: 1 transferencia VIEJA (no debe aparecer)
    await transferRepo.save(
      Transfer.create({
        id: 't1',
        companyId: acme.getId(),
        amount: Money.create(1000, 'ARS'),
        debitAccount: 'A',
        creditAccount: 'B',
        transferDate: new Date(referenceDate.getTime() - days(5)),
      }),
    );
    await transferRepo.save(
      Transfer.create({
        id: 't2',
        companyId: acme.getId(),
        amount: Money.create(500, 'ARS'),
        debitAccount: 'A',
        creditAccount: 'C',
        transferDate: new Date(referenceDate.getTime() - days(10)),
      }),
    );
    await transferRepo.save(
      Transfer.create({
        id: 't3',
        companyId: gamma.getId(),
        amount: Money.create(2000, 'ARS'),
        debitAccount: 'X',
        creditAccount: 'Y',
        transferDate: new Date(referenceDate.getTime() - days(90)),
      }),
    );
  });

  it('retorna sólo las empresas con transferencias en el último mes, sin duplicados', async () => {
    const result = await useCase.execute(referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].getBusinessName()).toBe('ACME');
  });

  it('retorna array vacío cuando no hay transferencias en el rango', async () => {
    const futureRef = new Date('2027-01-01T00:00:00Z');
    const result = await useCase.execute(futureRef);
    expect(result).toEqual([]);
  });
});
