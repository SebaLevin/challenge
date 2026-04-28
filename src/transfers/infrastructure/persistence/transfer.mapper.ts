import { Transfer } from '../../domain/entities/transfer.entity';
import { Money } from '../../../shared/domain/value-objects/money.vo';

export interface TransferRecord {
  id: string;
  companyId: string;
  amountCents: number;
  currency: string;
  debitAccount: string;
  creditAccount: string;
  transferDate: string; // ISO 8601
}

export class TransferMapper {
  public static toRecord(transfer: Transfer): TransferRecord {
    const money = transfer.getAmount();
    return {
      id: transfer.getId(),
      companyId: transfer.getCompanyId(),
      amountCents: money.getCents(),
      currency: money.getCurrency(),
      debitAccount: transfer.getDebitAccount(),
      creditAccount: transfer.getCreditAccount(),
      transferDate: transfer.getTransferDate().toISOString(),
    };
  }

  public static toDomain(record: TransferRecord): Transfer {
    return Transfer.create({
      id: record.id,
      companyId: record.companyId,
      amount: Money.fromCents(record.amountCents, record.currency),
      debitAccount: record.debitAccount,
      creditAccount: record.creditAccount,
      transferDate: new Date(record.transferDate),
    });
  }
}
