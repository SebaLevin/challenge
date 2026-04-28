import { CompanyFactory } from '../../../../src/companies/domain/factories/company.factory';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { PymeCompany } from '../../../../src/companies/domain/entities/pyme-company.entity';
import { CorporateCompany } from '../../../../src/companies/domain/entities/corporate-company.entity';
import { InvalidCompanyDataException } from '../../../../src/companies/domain/exceptions/invalid-company-data.exception';

describe('CompanyFactory', () => {
  it('crea una PymeCompany cuando el type es PYME', () => {
    const company = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME PyME',
      annualRevenue: 50_000_000,
      employeeCount: 25,
    });
    expect(company).toBeInstanceOf(PymeCompany);
    expect(company.getType()).toBe(CompanyType.PYME);
  });

  it('crea una CorporateCompany cuando el type es CORPORATE', () => {
    const company = CompanyFactory.create({
      type: CompanyType.CORPORATE,
      cuit: '30-50001091-2',
      businessName: 'Megacorp',
      fiscalId: 'AR-30500010912',
      legalRepresentative: 'María González',
    });
    expect(company).toBeInstanceOf(CorporateCompany);
    expect(company.getType()).toBe(CompanyType.CORPORATE);
  });

  it('genera un id único en cada creación', () => {
    const a = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME 1',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });
    const b = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-70887654-9',
      businessName: 'ACME 2',
      annualRevenue: 2_000_000,
      employeeCount: 10,
    });
    expect(a.getId()).not.toBe(b.getId());
  });

  it('aplica fecha de adhesión actual cuando no se especifica', () => {
    const before = Date.now();
    const company = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });
    const after = Date.now();
    const adhesionTime = company.getAdhesionDate().getTime();
    expect(adhesionTime).toBeGreaterThanOrEqual(before);
    expect(adhesionTime).toBeLessThanOrEqual(after);
  });

  it('respeta la fecha de adhesión cuando se especifica', () => {
    const customDate = new Date('2026-01-15T00:00:00Z');
    const company = CompanyFactory.create({
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME',
      adhesionDate: customDate,
      annualRevenue: 1_000_000,
      employeeCount: 5,
    });
    expect(company.getAdhesionDate().toISOString()).toBe(
      customDate.toISOString(),
    );
  });

  it('rechaza un CompanyType desconocido', () => {
    expect(() =>
      CompanyFactory.create({
        type: 'UNKNOWN' as CompanyType,
        cuit: '30-71234567-1',
        businessName: 'ACME',
      }),
    ).toThrow(InvalidCompanyDataException);
  });
});
