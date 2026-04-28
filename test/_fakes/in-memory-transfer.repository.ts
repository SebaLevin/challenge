import { TransferRepository } from '../../src/transfers/domain/ports/transfer.repository';
import { Transfer } from '../../src/transfers/domain/entities/transfer.entity';

export class InMemoryTransferRepository implements TransferRepository {
  private storage: Map<string, Transfer> = new Map();

  public async save(transfer: Transfer): Promise<void> {
    this.storage.set(transfer.getId(), transfer);
  }

  public async findBetween(from: Date, to: Date): Promise<Transfer[]> {
    return Array.from(this.storage.values()).filter((t) =>
      t.occurredBetween(from, to),
    );
  }

  public count(): number {
    return this.storage.size;
  }
}
