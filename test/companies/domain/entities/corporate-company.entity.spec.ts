import { CorporateCompany } from '../../../../src/companies/domain/entities/corporate-company.entity';
import { Cuit } from '../../../../src/companies/domain/value-objects/cuit.vo';
import { CompanyType } from '../../../../src/companies/domain/value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../../../../src/companies/domain/exceptions/invalid-company-data.exception';

const baseProps = () => ({
  id: 'test-id',
  cuit: Cuit.create('30-50001091-2'),
  businessName: 'Megacorp',
  adhesionDate: new Date('2026-04-01T00:00:00Z'),
  fiscalId: 'AR-30500010912',
  legalRepresentative: 'María González',
});

describe('CorporateCompany', () => {
  describe('create', () => {
    it('crea una Corporate válida', () => {
      const company = CorporateCompany.create(baseProps());
      expect(company.getType()).toBe(CompanyType.CORPORATE);
      expect(company.getFiscalId()).toBe('AR-30500010912');
      expect(company.getLegalRepresentative()).toBe('María González');
    });

    it('rechaza fiscalId muy corto', () => {
      expect(() =>
        CorporateCompany.create({ ...baseProps(), fiscalId: 'AR' }),
      ).toThrow(InvalidCompanyDataException);
    });

    it('rechaza representante legal muy corto', () => {
      expect(() =>
        CorporateCompany.create({ ...baseProps(), legalRepresentative: 'X' }),
      ).toThrow(InvalidCompanyDataException);
    });

    it('trimea espacios del fiscalId y legalRepresentative', () => {
      const company = CorporateCompany.create({
        ...baseProps(),
        fiscalId: '  AR-30500010912  ',
        legalRepresentative: '  María González  ',
      });
      expect(company.getFiscalId()).toBe('AR-30500010912');
      expect(company.getLegalRepresentative()).toBe('María González');
    });
  });
});
