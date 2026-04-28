import { Transfer } from '../entities/transfer.entity';

export const TRANSFER_REPOSITORY = Symbol('TRANSFER_REPOSITORY');

export interface TransferRepository {
  save(transfer: Transfer): Promise<void>;
  findBetween(from: Date, to: Date): Promise<Transfer[]>;
}
