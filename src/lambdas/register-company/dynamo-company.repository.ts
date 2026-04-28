import { CompanyRepository } from '../../companies/domain/ports/company.repository';
import { Company } from '../../companies/domain/entities/company.entity';
import { Cuit } from '../../companies/domain/value-objects/cuit.vo';
import {
  CompanyMapper,
  CompanyRecord,
} from '../../companies/infrastructure/persistence/company.mapper';

/**
 * Adapter de persistencia DynamoDB para el contexto Lambda.
 *
 * IMPORTANTE: Esta implementación es ILUSTRATIVA del diseño que se usaría
 * en AWS. El challenge no requiere desplegarla. El código del SDK real está
 * comentado para mantener el paquete liviano y no añadir dependencias
 * innecesarias.
 *
 * Tabla DynamoDB sugerida:
 *  - PK (partition key): cuit  → permite findByCuit en O(1)
 *  - Atributos: id, type, businessName, adhesionDate, ...campos específicos
 *  - GSI sobre adhesionDate para findAdheredBetween si se necesitara
 *    desde Lambda (este caso de uso lo usa la API NestJS).
 *
 * Implementa el mismo puerto CompanyRepository que JsonCompanyRepository.
 * Ese es el premio de la arquitectura hexagonal: el use-case
 * RegisterCompanyUseCase NO se entera de qué motor de persistencia hay debajo.
 */
export class DynamoCompanyRepository implements CompanyRepository {
  constructor(
    // En implementación real:
    // private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  public async save(company: Company): Promise<void> {
    const record = CompanyMapper.toRecord(company);
    void record; // silenciar unused — usado en bloque comentado abajo
    void this.tableName;

    /* Implementación real con AWS SDK v3:
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: record,
      // ConditionExpression para garantizar idempotencia:
      ConditionExpression: 'attribute_not_exists(cuit)',
    }));
    */

    // Skeleton: en este challenge no ejecutamos contra Dynamo real.
    return Promise.resolve();
  }

  public async findByCuit(cuit: Cuit): Promise<Company | null> {
    void cuit;

    /* Implementación real:
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { cuit: cuit.getValue() },
    }));
    if (!result.Item) return null;
    return CompanyMapper.toDomain(result.Item as CompanyRecord);
    */

    return Promise.resolve(null);
  }

  public async findAdheredBetween(_from: Date, _to: Date): Promise<Company[]> {
    // No usado por la Lambda de adhesión, pero el contrato lo exige.
    return Promise.resolve([]);
  }

  public async findByIds(_ids: string[]): Promise<Company[]> {
    return Promise.resolve([]);
  }
}

// Re-export para que el handler pueda tipar el record si lo necesita.
export type { CompanyRecord };
