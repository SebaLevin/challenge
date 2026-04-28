import { RegisterCompanyUseCase } from '../../companies/application/use-cases/register-company.use-case';
import { CompanyType } from '../../companies/domain/value-objects/company-type.vo';
import { CompanyAlreadyExistsException } from '../../companies/domain/exceptions/company-already-exists.exception';
import { InvalidCuitException } from '../../companies/domain/exceptions/invalid-cuit.exception';
import { InvalidCompanyDataException } from '../../companies/domain/exceptions/invalid-company-data.exception';
import { DomainException } from '../../shared/domain/domain.exception';
import { Company } from '../../companies/domain/entities/company.entity';
import { PymeCompany } from '../../companies/domain/entities/pyme-company.entity';
import { CorporateCompany } from '../../companies/domain/entities/corporate-company.entity';
import { DynamoCompanyRepository } from './dynamo-company.repository';

/**
 * Lambda: register-company
 *
 * Recibe una solicitud de adhesión (mismo formato que el endpoint POST /companies),
 * valida los datos contra las reglas de dominio, y persiste en DynamoDB.
 *
 * Trigger sugerido: API Gateway HTTP API (proxy integration).
 * Alternativa: invocación directa desde SQS para escenarios asincrónicos
 * (adhesiones masivas o procesamiento desacoplado).
 *
 * Decisiones clave:
 *  - REUTILIZA el dominio del proyecto (entidades, factory, use case).
 *    No hay duplicación de validaciones entre la API NestJS y la Lambda.
 *  - El handler es un adapter de entrada equivalente al CompanyController:
 *    su única responsabilidad es traducir entre el formato del evento de
 *    AWS y el formato del use case.
 *  - El cold-start importa: instanciamos el use case fuera del handler
 *    para que se reuse entre invocaciones tibias (warm starts).
 */

// --- Tipos del contrato API Gateway (subset suficiente para este caso) ---

export interface ApiGatewayProxyEvent {
  body: string | null;
  headers?: Record<string, string | undefined>;
  requestContext?: {
    requestId?: string;
  };
}

export interface ApiGatewayProxyResult {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// --- Composition root (corre una vez por cold start) ---

const TABLE_NAME = process.env.COMPANIES_TABLE_NAME ?? 'companies';
const defaultRepository = new DynamoCompanyRepository(TABLE_NAME);
const defaultUseCase = new RegisterCompanyUseCase(defaultRepository);

// --- Handler ---

/**
 * Handler exportado para AWS Lambda. Usa el use-case "default" cableado
 * contra DynamoDB en cold start.
 */
export async function handler(
  event: ApiGatewayProxyEvent,
): Promise<ApiGatewayProxyResult> {
  return runHandler(event, defaultUseCase);
}

/**
 * Versión inyectable del handler. Se exporta para testing: permite
 * pasarle un use-case con repositorio in-memory sin tocar la lógica
 * de mapeo entre el evento de AWS y el dominio.
 */
export async function runHandler(
  event: ApiGatewayProxyEvent,
  useCase: RegisterCompanyUseCase,
): Promise<ApiGatewayProxyResult> {
  try {
    const input = parseEventBody(event);
    const company = await useCase.execute(input);
    return success(company);
  } catch (err) {
    return mapError(err);
  }
}

// --- Helpers ---

interface RegisterCompanyEventBody {
  type: CompanyType;
  cuit: string;
  businessName: string;
  adhesionDate?: string;
  annualRevenue?: number;
  employeeCount?: number;
  fiscalId?: string;
  legalRepresentative?: string;
}

function parseEventBody(event: ApiGatewayProxyEvent): {
  type: CompanyType;
  cuit: string;
  businessName: string;
  adhesionDate?: Date;
  annualRevenue?: number;
  employeeCount?: number;
  fiscalId?: string;
  legalRepresentative?: string;
} {
  if (!event.body) {
    throw new InvalidCompanyDataException('Request body is required');
  }

  let parsed: RegisterCompanyEventBody;
  try {
    parsed = JSON.parse(event.body) as RegisterCompanyEventBody;
  } catch {
    throw new InvalidCompanyDataException('Request body is not valid JSON');
  }

  if (!parsed.type || !parsed.cuit || !parsed.businessName) {
    throw new InvalidCompanyDataException(
      'Missing required fields: type, cuit, businessName',
    );
  }

  return {
    type: parsed.type,
    cuit: parsed.cuit,
    businessName: parsed.businessName,
    adhesionDate: parsed.adhesionDate ? new Date(parsed.adhesionDate) : undefined,
    annualRevenue: parsed.annualRevenue,
    employeeCount: parsed.employeeCount,
    fiscalId: parsed.fiscalId,
    legalRepresentative: parsed.legalRepresentative,
  };
}

function success(company: Company): ApiGatewayProxyResult {
  const body: Record<string, unknown> = {
    id: company.getId(),
    type: company.getType(),
    cuit: company.getCuit().getFormatted(),
    businessName: company.getBusinessName(),
    adhesionDate: company.getAdhesionDate().toISOString(),
  };

  if (company instanceof PymeCompany) {
    body.annualRevenue = company.getAnnualRevenue();
    body.employeeCount = company.getEmployeeCount();
  } else if (company instanceof CorporateCompany) {
    body.fiscalId = company.getFiscalId();
    body.legalRepresentative = company.getLegalRepresentative();
  }

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function mapError(err: unknown): ApiGatewayProxyResult {
  if (err instanceof DomainException) {
    const status = errorStatusCode(err);
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        statusCode: status,
        error: err.constructor.name,
        message: err.message,
      }),
    };
  }

  // Errores no-de-dominio: log + 500 genérico (no filtrar internals).
  // eslint-disable-next-line no-console
  console.error('Unexpected error in Lambda handler', err);
  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      statusCode: 500,
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
    }),
  };
}

function errorStatusCode(err: DomainException): number {
  if (err instanceof CompanyAlreadyExistsException) return 409;
  if (
    err instanceof InvalidCuitException ||
    err instanceof InvalidCompanyDataException
  ) {
    return 400;
  }
  return 422;
}
