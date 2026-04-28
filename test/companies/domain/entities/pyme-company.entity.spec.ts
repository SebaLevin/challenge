import { PymeCompany } from '../../../../src/companies/domain/entities/pyme-company.entity';
import { Cuit } from '../../../../src/companies/domain/value-objects/cuit.vo';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../../../../src/companies/domain/exceptions/invalid-company-data.exception';

const baseProps = () => ({
  id: 'test-id',
  cuit: Cuit.create('30-71234567-1'),
  businessName: 'ACME PyME',
  adhesionDate: new Date('2026-04-01T00:00:00Z'),
  annualRevenue: 50_000_000,
  employeeCount: 25,
});

describe('PymeCompany', () => {
  describe('create', () => {
    it('crea una Pyme válida', () => {
      const company = PymeCompany.create(baseProps());
      expect(company.getType()).toBe(CompanyType.PYME);
      expect(company.getBusinessName()).toBe('ACME PyME');
      expect(company.getAnnualRevenue()).toBe(50_000_000);
      expect(company.getEmployeeCount()).toBe(25);
    });

    it('rechaza facturación negativa', () => {
      expect(() =>
        PymeCompany.create({ ...baseProps(), annualRevenue: -100 }),
      ).toThrow(InvalidCompanyDataException);
    });

    it('rechaza employeeCount no-entero', () => {
      expect(() =>
        PymeCompany.create({ ...baseProps(), employeeCount: 1.5 }),
      ).toThrow(InvalidCompanyDataException);
    });

    it('rechaza empresa que excede umbral PyME de empleados', () => {
      expect(() =>
        PymeCompany.create({ ...baseProps(), employeeCount: 500 }),
      ).toThrow(/PyME threshold/);
    });

    it('rechaza empresa que excede umbral PyME de facturación', () => {
      expect(() =>
        PymeCompany.create({
          ...baseProps(),
          annualRevenue: 5_000_000_000,
        }),
      ).toThrow(/PyME threshold/);
    });

    it('rechaza nombre de empresa muy corto', () => {
      expect(() =>
        PymeCompany.create({ ...baseProps(), businessName: 'A' }),
      ).toThrow(InvalidCompanyDataException);
    });

    it('rechaza fecha de adhesión en el futuro', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      expect(() =>
        PymeCompany.create({ ...baseProps(), adhesionDate: futureDate }),
      ).toThrow(/future/);
    });
  });

  describe('wasAdheredBetween', () => {
    it('retorna true cuando la fecha de adhesión está dentro del rango', () => {
      const company = PymeCompany.create({
        ...baseProps(),
        adhesionDate: new Date('2026-04-15T00:00:00Z'),
      });
      const from = new Date('2026-04-01T00:00:00Z');
      const to = new Date('2026-04-30T00:00:00Z');
      expect(company.wasAdheredBetween(from, to)).toBe(true);
    });

    it('retorna false cuando la fecha de adhesión está fuera del rango', () => {
      const company = PymeCompany.create({
        ...baseProps(),
        adhesionDate: new Date('2026-01-15T00:00:00Z'),
      });
      const from = new Date('2026-04-01T00:00:00Z');
      const to = new Date('2026-04-30T00:00:00Z');
      expect(company.wasAdheredBetween(from, to)).toBe(false);
    });
  });
});
