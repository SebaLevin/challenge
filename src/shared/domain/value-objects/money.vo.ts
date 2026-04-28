/**
 * Value Object que representa un monto con su moneda.
 * Evita errores de precisión usando enteros (centavos) internamente
 * y encapsula operaciones aritméticas seguras.
 */
export class Money {
  private constructor(
    private readonly amountInCents: number,
    private readonly currency: string,
  ) {}

  public static create(amount: number, currency = 'ARS'): Money {
    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    if (amount < 0) {
      throw new Error(`Amount cannot be negative: ${amount}`);
    }
    const cents = Math.round(amount * 100);
    return new Money(cents, currency.toUpperCase());
  }

  public static fromCents(cents: number, currency = 'ARS'): Money {
    return new Money(cents, currency.toUpperCase());
  }

  public getAmount(): number {
    return this.amountInCents / 100;
  }

  public getCents(): number {
    return this.amountInCents;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  public equals(other: Money): boolean {
    return (
      this.amountInCents === other.amountInCents &&
      this.currency === other.currency
    );
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
