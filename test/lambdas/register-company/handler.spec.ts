import { runHandler } from '../../../src/lambdas/register-company/handler';
import { RegisterCompanyUseCase } from '../../../src/companies/application/use-cases/register-company.use-case';
import { CompanyType } from '../../../src/companies/domain/value-objects/company-type.vo';
import { InMemoryCompanyRepository } from '../../_fakes/in-memory-company.repository';

describe('Lambda register-company handler', () => {
  let repo: InMemoryCompanyRepository;
  let useCase: RegisterCompanyUseCase;

  beforeEach(() => {
    repo = new InMemoryCompanyRepository();
    useCase = new RegisterCompanyUseCase(repo);
  });

  const eventOf = (body: unknown) => ({
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

  it('responde 201 cuando registra una Pyme correctamente', async () => {
    const result = await runHandler(
      eventOf({
        type: CompanyType.PYME,
        cuit: '30-71234567-1',
        businessName: 'ACME PyME',
        annualRevenue: 1_000_000,
        employeeCount: 5,
      }),
      useCase,
    );

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.type).toBe(CompanyType.PYME);
    expect(body.cuit).toBe('30-71234567-1');
    expect(body.annualRevenue).toBe(1_000_000);
    expect(body.id).toBeDefined();
    expect(repo.count()).toBe(1);
  });

  it('responde 201 cuando registra una Corporate correctamente', async () => {
    const result = await runHandler(
      eventOf({
        type: CompanyType.CORPORATE,
        cuit: '30-50001091-2',
        businessName: 'Megacorp',
        fiscalId: 'AR-30500010912',
        legalRepresentative: 'María González',
      }),
      useCase,
    );

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.fiscalId).toBe('AR-30500010912');
    expect(body.legalRepresentative).toBe('María González');
  });

  it('responde 400 cuando el CUIT es inválido', async () => {
    const result = await runHandler(
      eventOf({
        type: CompanyType.PYME,
        cuit: '11111111111',
        businessName: 'CUIT trucho',
        annualRevenue: 1_000_000,
        employeeCount: 5,
      }),
      useCase,
    );

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('InvalidCuitException');
  });

  it('responde 409 cuando el CUIT ya está registrado', async () => {
    const payload = {
      type: CompanyType.PYME,
      cuit: '30-71234567-1',
      businessName: 'ACME',
      annualRevenue: 1_000_000,
      employeeCount: 5,
    };

    const first = await runHandler(eventOf(payload), useCase);
    expect(first.statusCode).toBe(201);

    const second = await runHandler(eventOf(payload), useCase);
    expect(second.statusCode).toBe(409);
    const body = JSON.parse(second.body);
    expect(body.error).toBe('CompanyAlreadyExistsException');
  });

  it('responde 400 cuando el body está vacío', async () => {
    const result = await runHandler({ body: null }, useCase);
    expect(result.statusCode).toBe(400);
  });

  it('responde 400 cuando el body no es JSON válido', async () => {
    const result = await runHandler(eventOf('not-a-json'), useCase);
    expect(result.statusCode).toBe(400);
  });

  it('responde 400 cuando faltan campos requeridos', async () => {
    const result = await runHandler(
      eventOf({ type: CompanyType.PYME, cuit: '30-71234567-1' }),
      useCase,
    );
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('Missing');
  });
});
