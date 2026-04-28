import { Money } from '../../../shared/domain/value-objects/money.vo';

export interface TransferProps {
  id: string;
  companyId: string;
  amount: Money;
  debitAccount: string;
  creditAccount: string;
  transferDate: Date;
}

/**
 * Entidad Transferencia.
 *
 * Representa una transferencia bancaria originada por una empresa.
 * Se mantiene como agregado independiente del agregado Company
 * (comunicación por ids, no por referencias directas), lo que mantiene
 * los agregados pequeños y facilita particionar la persistencia.
 */
export class Transfer {
  private readonly id: string;
  private readonly companyId: string;
  private readonly amount: Money;
  private readonly debitAccount: string;
  private readonly creditAccount: string;
  private readonly transferDate: Date;

  private constructor(props: TransferProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.amount = props.amount;
    this.debitAccount = props.debitAccount;
    this.creditAccount = props.creditAccount;
    this.transferDate = props.transferDate;
  }

  public static create(props: TransferProps): Transfer {
    if (!props.companyId) {
      throw new Error('Transfer must belong to a company');
    }
    if (!props.debitAccount || !props.creditAccount) {
      throw new Error('Debit and credit accounts are required');
    }
    if (props.debitAccount === props.creditAccount) {
      throw new Error('Debit and credit accounts must differ');
    }
    if (!(props.transferDate instanceof Date) || Number.isNaN(props.transferDate.getTime())) {
      throw new Error('Invalid transfer date');
    }
    return new Transfer(props);
  }

  public getId(): string {
    return this.id;
  }

  public getCompanyId(): string {
    return this.companyId;
  }

  public getAmount(): Money {
    return this.amount;
  }

  public getDebitAccount(): string {
    return this.debitAccount;
  }

  public getCreditAccount(): string {
    return this.creditAccount;
  }

  public getTransferDate(): Date {
    return new Date(this.transferDate);
  }

  public occurredBetween(from: Date, to: Date): boolean {
    const t = this.transferDate.getTime();
    return t >= from.getTime() && t <= to.getTime();
  }
}
