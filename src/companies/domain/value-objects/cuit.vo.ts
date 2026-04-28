import { InvalidCuitException } from '../../domain/exceptions/invalid-cuit.exception';

/**
 * Value Object que representa un CUIT argentino.
 * Encapsula la validación del formato y dígito verificador.
 *
 * Formato: XX-XXXXXXXX-X (11 dígitos)
 */
export class Cuit {
  private static readonly CUIT_LENGTH = 11;
  private static readonly MULTIPLIERS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  private constructor(private readonly value: string) {}

  public static create(value: string): Cuit {
    const sanitized = Cuit.sanitize(value);
    Cuit.validate(sanitized);
    return new Cuit(sanitized);
  }

  private static sanitize(value: string): string {
    return value.replace(/[-\s]/g, '');
  }

  private static validate(value: string): void {
    if (!/^\d{11}$/.test(value)) {
      throw new InvalidCuitException(
        `CUIT must be 11 digits, received: "${value}"`,
      );
    }

    if (!Cuit.isChecksumValid(value)) {
      throw new InvalidCuitException(
        `CUIT "${value}" has an invalid check digit`,
      );
    }
  }

  private static isChecksumValid(value: string): boolean {
    const digits = value.split('').map(Number);
    const checkDigit = digits[10];

    const sum = Cuit.MULTIPLIERS.reduce(
      (acc, mult, i) => acc + mult * digits[i],
      0,
    );

    const mod = sum % 11;
    const expected = mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod;

    return expected === checkDigit;
  }

  public getValue(): string {
    return this.value;
  }

  public getFormatted(): string {
    return `${this.value.slice(0, 2)}-${this.value.slice(2, 10)}-${this.value.slice(10)}`;
  }

  public equals(other: Cuit): boolean {
    return this.value === other.value;
  }
}
