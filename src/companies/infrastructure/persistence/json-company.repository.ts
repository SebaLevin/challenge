import { Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import { CompanyRepository } from '../../domain/ports/company.repository';
import { Company } from '../../domain/entities/company.entity';
import { Cuit } from '../../domain/value-objects/cuit.vo';
import { JsonStorage } from '../../../shared/infrastructure/persistence/json-storage.service';
import { CompanyMapper, CompanyRecord } from './company.mapper';
import { DATA_DIR } from '../../../shared/infrastructure/persistence/data-dir.token';

/**
 * Adapter de persistencia para CompanyRepository sobre archivo JSON.
 *
 * Este es un adapter de OUTPUT en términos hexagonales: implementa el
 * puerto que el dominio definió. Si mañana migramos a Postgres,
 * sólo escribimos un PostgresCompanyRepository que implemente la misma
 * interface, sin tocar use-cases ni dominio.
 */
@Injectable()
export class JsonCompanyRepository implements CompanyRepository {
  private readonly filePath: string;

  constructor(
    private readonly storage: JsonStorage,
    @Inject(DATA_DIR) dataDir: string,
  ) {
    this.filePath = path.join(dataDir, 'companies.json');
  }

  public async save(company: Company): Promise<void> {
    const records = await this.readAll();
    const record = CompanyMapper.toRecord(company);
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    await this.storage.write(this.filePath, records);
  }

  public async findByCuit(cuit: Cuit): Promise<Company | null> {
    const records = await this.readAll();
    const match = records.find((r) => r.cuit === cuit.getValue());
    return match ? CompanyMapper.toDomain(match) : null;
  }

  public async findAdheredBetween(from: Date, to: Date): Promise<Company[]> {
    const records = await this.readAll();
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return records
      .filter((r) => {
        const t = new Date(r.adhesionDate).getTime();
        return t >= fromTime && t <= toTime;
      })
      .map((r) => CompanyMapper.toDomain(r));
  }

  public async findByIds(ids: string[]): Promise<Company[]> {
    if (ids.length === 0) return [];
    const idSet = new Set(ids);
    const records = await this.readAll();
    return records
      .filter((r) => idSet.has(r.id))
      .map((r) => CompanyMapper.toDomain(r));
  }

  private async readAll(): Promise<CompanyRecord[]> {
    return this.storage.read<CompanyRecord[]>(this.filePath, []);
  }
}
