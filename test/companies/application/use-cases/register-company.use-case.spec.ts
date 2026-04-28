import { RegisterCompanyUseCase } from '../../../../src/companies/application/use-cases/register-company.use-case';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { CompanyAlreadyExistsException } from '../../../../src/companies/domain/exceptions/company-already-exists.exception';
import { InvalidCuitException } from '../../../../src/companies/domain/exceptions/invalid-cuit.exception';
import { InMemoryCompanyRepository } from '../../../_fakes/in-memory-company.repository';

describe('RegisterCompanyUseCase', () => {
  let repo: InMemoryCompanyRepository;
  let useCase: RegisterCompanyUseCase;

  beforeEach(() => {
    repo = new InMemoryCompanyRepository();
    useCase = new RegisterCompanyUseCase(repo);
  });

  it('registra una nueva PymeCompany', async () => {
    const company = await useCase.execute({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME PyME',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });

    expect(company.getBusinessName()).toBe('ACME PyME');
    expect(repo.count()).toBe(1);
  });

  it('registra una nueva CorporateCompany', async () => {
    const company = await useCase.execute({
      type: CompanyType.CORPORATE,
      cuit: '30-50001091-2',
      businessName: 'Megacorp',
      fiscalId: 'AR-30500010912',
      legalRepresentative: 'María González',
    });

    expect(company.getType()).toBe(CompanyType.CORPORATE);
    expect(repo.count()).toBe(1);
  });

  it('rechaza registrar una empresa con CUIT ya existente', async () => {
    await useCase.execute({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });

    await expect(
      useCase.execute({
        type: CompanyType.PYME,
        cuit: '30712345671', // mismo CUIT, formato distinto
        businessName: 'Otro intento',
        annualRevenue: 2_000_000,
        employeeCount: 10,
      }),
    ).rejects.toThrow(CompanyAlreadyExistsException);

    expect(repo.count()).toBe(1);
  });

  it('rechaza CUITs inválidos antes de tocar el repositorio', async () => {
    await expect(
      useCase.execute({
        type: CompanyType.PYME,
        cuit: '11111111111',
        businessName: 'CUIT trucho',
        annualRevenue: 1_000_000,
        employeeCount: 5,
      }),
    ).rejects.toThrow(InvalidCuitException);

    expect(repo.count()).toBe(0);
  });
});
