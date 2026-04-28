import { Money } from '../../../../src/shared/domain/value-objects/money.vo';

describe('Money', () => {
  describe('create', () => {
    it('crea un Money desde un monto en unidades', () => {
      const m = Money.create(100.5, 'ARS');
      expect(m.getAmount()).toBe(100.5);
      expect(m.getCents()).toBe(10050);
      expect(m.getCurrency()).toBe('ARS');
    });

    it('normaliza la moneda a mayúsculas', () => {
      const m = Money.create(50, 'usd');
      expect(m.getCurrency()).toBe('USD');
    });

    it('default currency es ARS', () => {
      const m = Money.create(100);
      expect(m.getCurrency()).toBe('ARS');
    });

    it('redondea correctamente para evitar errores de floating point', () => {
      // 0.1 + 0.2 en JS es 0.30000000000000004
      const m = Money.create(0.1 + 0.2);
      expect(m.getCents()).toBe(30);
      expect(m.getAmount()).toBe(0.3);
    });

    it('rechaza montos negativos', () => {
      expect(() => Money.create(-10)).toThrow();
    });

    it('rechaza montos no finitos', () => {
      expect(() => Money.create(NaN)).toThrow();
      expect(() => Money.create(Infinity)).toThrow();
    });
  });

  describe('fromCents', () => {
    it('crea un Money desde centavos', () => {
      const m = Money.fromCents(15050, 'ARS');
      expect(m.getCents()).toBe(15050);
      expect(m.getAmount()).toBe(150.5);
    });
  });

  describe('add', () => {
    it('suma dos Money de la misma moneda', () => {
      const a = Money.create(100, 'ARS');
      const b = Money.create(50.25, 'ARS');
      const result = a.add(b);
      expect(result.getCents()).toBe(15025);
    });

    it('rechaza sumar montos de monedas distintas', () => {
      const ars = Money.create(100, 'ARS');
      const usd = Money.create(50, 'USD');
      expect(() => ars.add(usd)).toThrow(/currency/i);
    });

    it('la suma es inmutable: no muta los operandos', () => {
      const a = Money.create(100, 'ARS');
      const b = Money.create(50, 'ARS');
      a.add(b);
      expect(a.getCents()).toBe(10000);
      expect(b.getCents()).toBe(5000);
    });
  });

  describe('equals', () => {
    it('dos Money con mismo monto y moneda son iguales', () => {
      const a = Money.create(100, 'ARS');
      const b = Money.create(100, 'ARS');
      expect(a.equals(b)).toBe(true);
    });

    it('mismo monto pero distinta moneda no son iguales', () => {
      const a = Money.create(100, 'ARS');
      const b = Money.create(100, 'USD');
      expect(a.equals(b)).toBe(false);
    });
  });
});
