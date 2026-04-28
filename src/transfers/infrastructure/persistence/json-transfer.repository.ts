import { Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import { TransferRepository } from '../../domain/ports/transfer.repository';
import { Transfer } from '../../domain/entities/transfer.entity';
import { JsonStorage } from '../../../shared/infrastructure/persistence/json-storage.service';
import { TransferMapper, TransferRecord } from './transfer.mapper';
import { DATA_DIR } from '../../../shared/infrastructure/persistence/data-dir.token';

@Injectable()
export class JsonTransferRepository implements TransferRepository {
  private readonly filePath: string;

  constructor(
    private readonly storage: JsonStorage,
    @Inject(DATA_DIR) dataDir: string,
  ) {
    this.filePath = path.join(dataDir, 'transfers.json');
  }

  public async save(transfer: Transfer): Promise<void> {
    const records = await this.readAll();
    const record = TransferMapper.toRecord(transfer);
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) records[idx] = record;
    else records.push(record);
    await this.storage.write(this.filePath, records);
  }

  public async findBetween(from: Date, to: Date): Promise<Transfer[]> {
    const records = await this.readAll();
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return records
      .filter((r) => {
        const t = new Date(r.transferDate).getTime();
        return t >= fromTime && t <= toTime;
      })
      .map((r) => TransferMapper.toDomain(r));
  }

  private async readAll(): Promise<TransferRecord[]> {
    return this.storage.read<TransferRecord[]>(this.filePath, []);
  }
}
