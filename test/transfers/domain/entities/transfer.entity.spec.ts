import { Transfer } from '../../../../src/transfers/domain/entities/transfer.entity';
import { Money } from '../../../../src/shared/domain/value-objects/money.vo';

const baseProps = () => ({
  id: 'transfer-1',
  companyId: 'company-1',
  amount: Money.create(1500, 'ARS'),
  debitAccount: '0001-0000-0001',
  creditAccount: '0002-0000-0002',
  transferDate: new Date('2026-04-15T00:00:00Z'),
});

describe('Transfer', () => {
  describe('create', () => {
    it('crea una Transfer válida', () => {
      const transfer = Transfer.create(baseProps());
      expect(transfer.getId()).toBe('transfer-1');
      expect(transfer.getCompanyId()).toBe('company-1');
      expect(transfer.getAmount().getAmount()).toBe(1500);
    });

    it('rechaza Transfer sin companyId', () => {
      expect(() => Transfer.create({ ...baseProps(), companyId: '' })).toThrow(
        /company/i,
      );
    });

    it('rechaza misma cuenta de débito y crédito', () => {
      expect(() =>
        Transfer.create({
          ...baseProps(),
          debitAccount: 'A',
          creditAccount: 'A',
        }),
      ).toThrow(/differ/i);
    });

    it('rechaza fecha de transferencia inválida', () => {
      expect(() =>
        Transfer.create({ ...baseProps(), transferDate: new Date('invalid') }),
      ).toThrow(/date/i);
    });
  });

  describe('occurredBetween', () => {
    it('retorna true cuando la fecha está dentro del rango', () => {
      const transfer = Transfer.create({
        ...baseProps(),
        transferDate: new Date('2026-04-15T00:00:00Z'),
      });
      const from = new Date('2026-04-01T00:00:00Z');
      const to = new Date('2026-04-30T00:00:00Z');
      expect(transfer.occurredBetween(from, to)).toBe(true);
    });

    it('retorna false cuando está fuera del rango', () => {
      const transfer = Transfer.create({
        ...baseProps(),
        transferDate: new Date('2025-12-15T00:00:00Z'),
      });
      const from = new Date('2026-04-01T00:00:00Z');
      const to = new Date('2026-04-30T00:00:00Z');
      expect(transfer.occurredBetween(from, to)).toBe(false);
    });
  });
});
