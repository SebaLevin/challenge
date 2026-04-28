import { Cuit } from '../../../../src/companies/domain/value-objects/cuit.vo';
import { InvalidCuitException } from '../../../../src/companies/domain/exceptions/invalid-cuit.exception';

describe('Cuit', () => {
  describe('create', () => {
    it('crea un CUIT válido a partir de un string sin guiones', () => {
      const cuit = Cuit.create('30712345671');
      expect(cuit.getValue()).toBe('30712345671');
    });

    it('crea un CUIT válido a partir de un string con guiones', () => {
      const cuit = Cuit.create('30-71234567-1');
      expect(cuit.getValue()).toBe('30712345671');
    });

    it('normaliza el formato eliminando guiones y espacios', () => {
      const cuit = Cuit.create('30 71234567 1');
      expect(cuit.getValue()).toBe('30712345671');
    });

    it('rechaza un CUIT con menos de 11 dígitos', () => {
      expect(() => Cuit.create('123456789')).toThrow(InvalidCuitException);
    });

    it('rechaza un CUIT con caracteres no numéricos', () => {
      expect(() => Cuit.create('3071234567A')).toThrow(InvalidCuitException);
    });

    it('rechaza un CUIT con dígito verificador inválido', () => {
      // 11111111111 tiene 11 dígitos pero el checksum no coincide
      expect(() => Cuit.create('11111111111')).toThrow(InvalidCuitException);
    });
  });

  describe('getFormatted', () => {
    it('devuelve el CUIT con guiones canónicos', () => {
      const cuit = Cuit.create('30712345671');
      expect(cuit.getFormatted()).toBe('30-71234567-1');
    });
  });

  describe('equals', () => {
    it('dos CUITs con el mismo valor son iguales (igualdad por valor)', () => {
      const a = Cuit.create('30-71234567-1');
      const b = Cuit.create('30712345671');
      expect(a.equals(b)).toBe(true);
    });

    it('dos CUITs con valores distintos no son iguales', () => {
      const a = Cuit.create('30-71234567-1');
      const b = Cuit.create('30-71598293-1');
      expect(a.equals(b)).toBe(false);
    });
  });
});
