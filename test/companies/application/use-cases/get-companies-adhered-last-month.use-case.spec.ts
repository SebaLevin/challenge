import { GetCompaniesAdheredLastMonthUseCase } from '../../../../src/companies/application/use-cases/get-companies-adhered-last-month.use-case';
import { CompanyFactory } from '../../../../src/companies/domain/factories/company.factory';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { InMemoryCompanyRepository } from '../../../_fakes/in-memory-company.repository';

const days = (n: number) => 1000 * 60 * 60 * 24 * n;

describe('GetCompaniesAdheredLastMonthUseCase', () => {
  let repo: InMemoryCompanyRepository;
  let useCase: GetCompaniesAdheredLastMonthUseCase;
  const referenceDate = new Date('2026-04-30T00:00:00Z');

  beforeEach(async () => {
    repo = new InMemoryCompanyRepository();
    useCase = new GetCompaniesAdheredLastMonthUseCase(repo);

    // 3 empresas: 2 dentro del último mes, 1 fuera
    await repo.save(
      CompanyFactory.create({
        type: CompanyType.PYME,
        cuit: '30-71234567-1',
        businessName: 'Reciente 1',
        adhesionDate: new Date(referenceDate.getTime() - days(5)),
        annualRevenue: 1_000_000,
        employeeCount: 5,
      }),
    );

    await repo.save(
      CompanyFactory.create({
        type: CompanyType.PYME,
        cuit: '30-70887654-9',
        businessName: 'Reciente 2',
        adhesionDate: new Date(referenceDate.getTime() - days(20)),
        annualRevenue: 2_000_000,
        employeeCount: 8,
      }),
    );

    await repo.save(
      CompanyFactory.create({
        type: CompanyType.CORPORATE,
        cuit: '30-50001091-2',
        businessName: 'Antigua',
        adhesionDate: new Date(referenceDate.getTime() - days(120)),
        fiscalId: 'AR-30500010912',
        legalRepresentative: 'Juan Pérez',
      }),
    );
  });

  it('retorna sólo las empresas adheridas en los últimos 30 días', async () => {
    const result = await useCase.execute(referenceDate);
    expect(result).toHaveLength(2);
    const names = result.map((c) => c.getBusinessName()).sort();
    expect(names).toEqual(['Reciente 1', 'Reciente 2']);
  });

  it('retorna array vacío cuando no hay empresas en el rango', async () => {
    const futureRef = new Date('2027-01-01T00:00:00Z');
    const result = await useCase.execute(futureRef);
    expect(result).toEqual([]);
  });
});
