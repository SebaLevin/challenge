# Lambda: register-company

Lambda function de AWS para registrar la adhesión de una empresa (Pyme o
Corporate). Equivalente funcional al endpoint `POST /companies` de la API
NestJS, pero diseñada para correr en infraestructura serverless.

> **Nota:** este código es entregable **teórico** del challenge. No se ejecuta
> ni se despliega — el objetivo es mostrar el diseño funcional, el código
> fuente, y cómo se integraría con el resto del sistema.

---

## 🎯 Decisión de diseño clave: reutilización del dominio

La Lambda **NO duplica lógica de negocio**. Usa exactamente:

- `RegisterCompanyUseCase` (capa de aplicación)
- `CompanyFactory`, `Cuit`, `PymeCompany`, `CorporateCompany` (dominio)
- Las mismas excepciones de dominio (`InvalidCuitException`, `CompanyAlreadyExistsException`, `InvalidCompanyDataException`)

Lo único nuevo es:

1. **El handler** (`handler.ts`): adapter de entrada que traduce entre el
   evento de API Gateway y el use case.
2. **El adapter de persistencia** (`dynamo-company.repository.ts`):
   implementación del puerto `CompanyRepository` para DynamoDB.

Ese es el premio práctico de la arquitectura hexagonal: dominio único, dos
transportes (HTTP de NestJS + AWS Lambda), cero duplicación.

---

## 📥 Input esperado (API Gateway proxy event)

### Empresa Pyme

```json
{
  "body": "{\"type\":\"PYME\",\"cuit\":\"30-71234567-1\",\"businessName\":\"ACME PyME S.A.\",\"annualRevenue\":50000000,\"employeeCount\":25}",
  "headers": {
    "Content-Type": "application/json"
  },
  "requestContext": {
    "requestId": "abc-123"
  }
}
```

Body parseado:

```json
{
  "type": "PYME",
  "cuit": "30-71234567-1",
  "businessName": "ACME PyME S.A.",
  "annualRevenue": 50000000,
  "employeeCount": 25,
  "adhesionDate": "2026-04-28T10:00:00.000Z"
}
```

`adhesionDate` es opcional. Si se omite, se usa la fecha actual.

### Empresa Corporate

```json
{
  "type": "CORPORATE",
  "cuit": "30-50001091-2",
  "businessName": "Megacorp International",
  "fiscalId": "AR-30500010912",
  "legalRepresentative": "María González"
}
```

---

## 📤 Output esperado

### 201 Created — Adhesión exitosa

```json
{
  "statusCode": 201,
  "headers": { "Content-Type": "application/json" },
  "body": "{\"id\":\"550e8400-e29b-41d4-a716-446655440000\",\"type\":\"PYME\",\"cuit\":\"30-71234567-1\",\"businessName\":\"ACME PyME S.A.\",\"adhesionDate\":\"2026-04-28T10:00:00.000Z\",\"annualRevenue\":50000000,\"employeeCount\":25}"
}
```

### 400 Bad Request — Datos inválidos

Se devuelve cuando el CUIT no pasa la validación de checksum, faltan campos
requeridos, o algún campo viola las invariantes del dominio (nombre muy
corto, facturación negativa, etc.).

```json
{
  "statusCode": 400,
  "body": "{\"statusCode\":400,\"error\":\"InvalidCuitException\",\"message\":\"CUIT \\\"11111111111\\\" has an invalid check digit\"}"
}
```

### 409 Conflict — CUIT ya registrado

```json
{
  "statusCode": 409,
  "body": "{\"statusCode\":409,\"error\":\"CompanyAlreadyExistsException\",\"message\":\"A company with CUIT \\\"30-71234567-1\\\" is already registered\"}"
}
```

### 500 Internal Server Error — Error inesperado

Se devuelve para excepciones no-de-dominio (fallos de DynamoDB, problemas
de red, etc.). El detalle interno NO se expone al cliente; se loguea para
CloudWatch.

---

## 🏗️ Diagrama de integración

```
                    ┌─────────────────┐
                    │  API Gateway    │
                    │  HTTP API       │
                    │  POST /companies│
                    └────────┬────────┘
                             │ proxy integration
                             ▼
                    ┌─────────────────┐
                    │  Lambda         │
                    │  register-      │
                    │  company        │◄─── IAM role: Dynamo R/W
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  DynamoDB       │
                    │  companies      │
                    │  PK: cuit       │
                    └─────────────────┘
```

### Tabla DynamoDB sugerida

| Atributo              | Tipo   | Descripción                              |
|-----------------------|--------|------------------------------------------|
| `cuit` (PK)           | String | Partition key — garantiza unicidad       |
| `id`                  | String | UUID v4 generado por la factory          |
| `type`                | String | `PYME` o `CORPORATE` (discriminator)     |
| `businessName`        | String | Razón social                             |
| `adhesionDate`        | String | ISO 8601                                 |
| `annualRevenue`       | Number | Sólo Pyme                                |
| `employeeCount`       | Number | Sólo Pyme                                |
| `fiscalId`            | String | Sólo Corporate                           |
| `legalRepresentative` | String | Sólo Corporate                           |

**Ventajas de usar `cuit` como PK:**

- Garantiza unicidad **a nivel de DB** (nunca habrá dos empresas con el
  mismo CUIT, incluso ante condiciones de carrera).
- Lookups por CUIT en O(1) con consumo mínimo de RCUs.
- `PutCommand` con `ConditionExpression: 'attribute_not_exists(cuit)'`
  hace la inserción idempotente: si ya existe, falla con
  `ConditionalCheckFailedException`, que mapeamos a 409.

### Por qué API Gateway HTTP API y no REST API

- **Más barato** (~70% menos por request).
- **Menor latencia** (cold start ~100ms más rápido).
- Soporta proxy integration con Lambda directamente.
- Para un caso simple como este (POST + JSON), las features avanzadas de
  REST API no aportan valor.

---

## 🔄 Variantes de integración

### Variante 1: invocación sincrónica (recomendada)

API Gateway → Lambda → DynamoDB

Es la opción default. El cliente recibe la respuesta directamente con el
resultado de la adhesión. Simple, pocas piezas, fácil de monitorear.

**Cuándo conviene:** flujos donde el cliente necesita confirmación inmediata
del registro (UI de onboarding, formularios de adhesión).

### Variante 2: invocación asincrónica con SQS

API Gateway → Lambda (validación) → SQS → Lambda (worker) → DynamoDB

Útil si:

- Se esperan **picos de carga** (ej: campañas de adhesión masiva).
- Hay **integraciones posteriores** que disparan a partir del registro
  (envío de email, notificación a sistemas externos, scoring crediticio).

En este modelo, la primera Lambda valida y responde 202 Accepted; la
segunda Lambda procesa en background. La cola actúa como buffer y permite
reintentos automáticos con DLQ.

**Trade-off:** el cliente no ve el resultado final inmediatamente —
necesita un endpoint de consulta separado o un sistema de notificación
push (WebSocket, polling, SSE).

### Variante 3: Step Functions para flujos complejos

Si el registro de empresa dispara un workflow más amplio (ej: validación
contra AFIP, generación de contrato, envío al área de Compliance), Step
Functions orquesta el flujo declarativamente y hace el estado visible en
la consola de AWS.

---

## 🔒 Consideraciones de seguridad

1. **IAM role mínimo** para la Lambda:
   - `dynamodb:PutItem` y `dynamodb:GetItem` sólo sobre la tabla `companies`.
   - `logs:CreateLogStream`, `logs:PutLogEvents` para CloudWatch.

2. **API Gateway con autenticación**: en producción, agregar un authorizer
   (Cognito, Lambda authorizer, API key) para que sólo clientes autorizados
   puedan registrar empresas.

3. **Rate limiting**: configurar throttling en API Gateway para mitigar
   abuso (ej: 100 req/s por API key).

4. **Validación de CUIT en el dominio**: la Lambda valida el dígito
   verificador antes de tocar DynamoDB, evitando consumir capacidad por
   payloads inválidos.

---

## 🧪 Testing

El handler está testeado en `test/lambdas/register-company/handler.spec.ts`
usando el `InMemoryCompanyRepository` (mismo fake que la API).

```bash
npm test -- handler.spec
```

Los tests cubren:

- 201 para Pyme y Corporate válidas
- 400 para CUIT inválido
- 400 para body vacío o JSON malformado
- 400 para campos faltantes
- 409 para CUIT duplicado

---

## 📦 Despliegue (referencia, no se ejecuta en el challenge)

Para desplegar la Lambda en una cuenta real se usaría:

```yaml
# serverless.yml (referencia)
service: register-company

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    COMPANIES_TABLE_NAME: ${self:custom.tableName}

functions:
  registerCompany:
    handler: dist/lambdas/register-company/handler.handler
    events:
      - httpApi:
          path: /companies
          method: post
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:PutItem
          - dynamodb:GetItem
        Resource: !GetAtt CompaniesTable.Arn

resources:
  Resources:
    CompaniesTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.tableName}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: cuit
            AttributeType: S
        KeySchema:
          - AttributeName: cuit
            KeyType: HASH
```

Build:

```bash
npm run build
# El handler queda en dist/lambdas/register-company/handler.js
```
