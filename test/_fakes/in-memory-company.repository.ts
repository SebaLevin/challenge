import { CompanyRepository } from '../../src/companies/domain/ports/company.repository';
import { Company } from '../../src/companies/domain/entities/company.entity';
import { Cuit } from '../../src/companies/domain/value-objects/cuit.vo';

/**
 * Fake in-memory del CompanyRepository para tests.
 *
 * Implementa el mismo puerto que JsonCompanyRepository, así los use cases
 * no se enteran de la diferencia. Este es el premio práctico de la
 * inversión de dependencias: tests rápidos, deterministas y sin I/O.
 */
export class InMemoryCompanyRepository implements CompanyRepository {
  private storage: Map<string, Company> = new Map();

  public async save(company: Company): Promise<void> {
    this.storage.set(company.getId(), company);
  }

  public async findByCuit(cuit: Cuit): Promise<Company | null> {
    for (const company of this.storage.values()) {
      if (company.getCuit().equals(cuit)) return company;
    }
    return null;
  }

  public async findAdheredBetween(from: Date, to: Date): Promise<Company[]> {
    return Array.from(this.storage.values()).filter((c) =>
      c.wasAdheredBetween(from, to),
    );
  }

  public async findByIds(ids: string[]): Promise<Company[]> {
    const idSet = new Set(ids);
    return Array.from(this.storage.values()).filter((c) => idSet.has(c.getId()));
  }

  public count(): number {
    return this.storage.size;
  }
}
