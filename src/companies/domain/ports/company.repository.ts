import { Company } from '../entities/company.entity';
import { Cuit } from '../value-objects/cuit.vo';

/**
 * Puerto (interface) que define el contrato de persistencia para empresas.
 *
 * El dominio depende de esta abstracción; los adapters concretos
 * (JSON file, in-memory, SQL, etc.) viven en la capa de infraestructura.
 * Esto es lo que permite testear el dominio y los casos de uso sin
 * tocar archivos ni bases de datos.
 */
export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');

export interface CompanyRepository {
  save(company: Company): Promise<void>;
  findByCuit(cuit: Cuit): Promise<Company | null>;
  findAdheredBetween(from: Date, to: Date): Promise<Company[]>;
  findByIds(ids: string[]): Promise<Company[]>;
}
