# Companies & Transfers API

API REST para gestión de empresas (Pyme y Corporate) y consulta de
transferencias, construida con **NestJS** y **arquitectura hexagonal**.

Incluye también el diseño de una **AWS Lambda** equivalente que reutiliza
el mismo dominio (entregable teórico, no se despliega).

---

## 📋 Tabla de contenidos

- [Requerimientos cumplidos](#-requerimientos-cumplidos)
- [Stack técnico](#-stack-técnico)
- [Cómo correr el proyecto](#-cómo-correr-el-proyecto)
- [Endpoints disponibles](#-endpoints-disponibles)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Arquitectura: por qué hexagonal](#-arquitectura-por-qué-hexagonal)
- [Decisiones de diseño](#-decisiones-de-diseño)
- [Testing](#-testing)
- [Lambda AWS](#-lambda-aws)
- [Trade-offs y limitaciones reconocidas](#-trade-offs-y-limitaciones-reconocidas)

---

## ✅ Requerimientos cumplidos

| Requisito                                              | Estado |
|--------------------------------------------------------|--------|
| Endpoint: empresas con transferencias en el último mes | ✅     |
| Endpoint: empresas adheridas en el último mes          | ✅     |
| Endpoint: registrar adhesión (Pyme + Corporate)        | ✅     |
| API en NestJS standalone                               | ✅     |
| Sin Docker                                             | ✅     |
| Persistencia en archivo JSON                           | ✅     |
| Arquitectura hexagonal                                 | ✅     |
| POO con herencia y polimorfismo (Pyme/Corporate)       | ✅     |
| Tests unitarios                                        | ✅     |
| Diseño de Lambda AWS (código + integración)            | ✅     |
| Documentación Swagger                                  | ✅     |
| Seed con datos de ejemplo                              | ✅     |

---

## 🧰 Stack técnico

- **Runtime:** Node.js 20+
- **Framework:** NestJS 10
- **Lenguaje:** TypeScript 5.3 con `strict: true`
- **Validación:** class-validator + class-transformer
- **Documentación API:** Swagger / OpenAPI 3
- **Testing:** Jest + ts-jest
- **Persistencia:** JSON file con escritura atómica + lock por archivo

---

## 🚀 Cómo correr el proyecto

### Pre-requisitos

- Node.js 20 o superior
- npm 10 o superior

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Configurar variables de entorno
cp .env.example .env
# Edita .env si querés cambiar el puerto o el directorio de datos.
# El proyecto funciona con los defaults sin necesidad de crear .env.

# 3. Generar datos de ejemplo (4 empresas + 3 transferencias)
npm run seed

# 4. Levantar la API en modo desarrollo (con hot-reload)
npm run start:dev
```

La API queda disponible en:

- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/docs

### Variables de entorno (opcionales)

| Variable     | Default       | Descripción                                |
|--------------|---------------|--------------------------------------------|
| `PORT`       | `3000`        | Puerto del servidor HTTP                   |
| `DATA_DIR`   | `./data`      | Directorio donde viven los archivos JSON   |

### Otros comandos útiles

```bash
npm run build          # Compila TypeScript a dist/
npm run start          # Ejecuta el build (production-like)
npm test               # Corre todos los tests unitarios
npm run test:cov       # Tests con reporte de coverage
npm run test:watch     # Tests en modo watch
npm run lint           # ESLint con autofix
npm run format         # Prettier
```

---

## 📡 Endpoints disponibles

### `POST /companies` — Registrar adhesión de empresa

**Pyme:**

```bash
curl -X POST http://localhost:3000/companies \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PYME",
    "cuit": "30-71234567-1",
    "businessName": "ACME PyME S.A.",
    "annualRevenue": 50000000,
    "employeeCount": 25
  }'
```

**Corporate:**

```bash
curl -X POST http://localhost:3000/companies \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CORPORATE",
    "cuit": "30-50001091-2",
    "businessName": "Megacorp International",
    "fiscalId": "AR-30500010912",
    "legalRepresentative": "María González"
  }'
```

**Respuestas:**

- `201 Created` — Empresa registrada
- `400 Bad Request` — Datos inválidos (CUIT mal formado, checksum inválido, campos faltantes)
- `409 Conflict` — Ya existe una empresa con ese CUIT

### `GET /companies/adhered-last-month` — Empresas adheridas en el último mes

```bash
curl http://localhost:3000/companies/adhered-last-month
```

Acepta `?referenceDate=2026-04-30T00:00:00Z` para consultar rangos
históricos (útil para testing y reporting).

### `GET /companies/with-transfers-last-month` — Empresas con transferencias en el último mes

```bash
curl http://localhost:3000/companies/with-transfers-last-month
```

Devuelve las empresas (sin duplicados) que tienen al menos una
transferencia en los últimos 30 días.

---

## 🗂️ Estructura del proyecto

```
src/
├── companies/                          # Bounded context: Empresas
│   ├── domain/                         # Capa de dominio (sin dependencias externas)
│   │   ├── entities/
│   │   │   ├── company.entity.ts       # Clase abstracta base
│   │   │   ├── pyme-company.entity.ts
│   │   │   └── corporate-company.entity.ts
│   │   ├── value-objects/
│   │   │   ├── cuit.vo.ts              # Con validación de checksum
│   │   │   └── company-type.vo.ts
│   │   ├── factories/
│   │   │   └── company.factory.ts      # Creación polimórfica
│   │   ├── exceptions/
│   │   └── ports/
│   │       └── company.repository.ts   # Interface (puerto)
│   ├── application/                    # Capa de aplicación (use cases)
│   │   └── use-cases/
│   │       ├── register-company.use-case.ts
│   │       ├── get-companies-adhered-last-month.use-case.ts
│   │       └── get-companies-with-transfers-last-month.use-case.ts
│   ├── infrastructure/                 # Capa de infraestructura (adapters)
│   │   ├── http/
│   │   │   ├── company.controller.ts
│   │   │   └── dtos/
│   │   └── persistence/
│   │       ├── json-company.repository.ts  # Adapter JSON (implementa el puerto)
│   │       └── company.mapper.ts            # Domain ↔ JSON
│   └── companies.module.ts
│
├── transfers/                          # Bounded context: Transferencias
│   ├── domain/
│   │   ├── entities/transfer.entity.ts
│   │   └── ports/transfer.repository.ts
│   ├── infrastructure/
│   │   └── persistence/
│   └── transfers.module.ts
│
├── shared/                             # Cross-cutting (lo verdaderamente común)
│   ├── domain/
│   │   ├── domain.exception.ts         # Base de excepciones de dominio
│   │   ├── date-range.ts               # Helper de "último mes"
│   │   └── value-objects/
│   │       └── money.vo.ts             # Aritmética en centavos
│   └── infrastructure/
│       ├── domain-exception.filter.ts  # Mapea DomainException → HTTP
│       ├── shared.module.ts
│       └── persistence/
│           ├── json-storage.service.ts # Lock + escritura atómica
│           └── data-dir.token.ts
│
├── lambdas/                            # Entregable AWS (no se despliega)
│   └── register-company/
│       ├── handler.ts                  # Reusa RegisterCompanyUseCase
│       ├── dynamo-company.repository.ts
│       └── README.md                   # Diseño de integración detallado
│
├── app.module.ts
└── main.ts                             # Bootstrap + Swagger + global pipes/filters

test/                                   # Tests unitarios espejando src/
├── _fakes/                             # In-memory repos compartidos por los tests
└── ...

scripts/
└── seed.ts                             # Genera data/companies.json y data/transfers.json
```

**Estructura por feature, no por capa técnica.** Cada bounded context
(`companies/`, `transfers/`) es independiente y reproduce internamente las
3 capas: `domain`, `application`, `infrastructure`. Esto facilita:

- Borrar un módulo entero sin tocar el resto
- Eventualmente extraerlo a un microservicio
- Trabajo en paralelo entre equipos sin conflictos de merge

---

## 🏛️ Arquitectura: por qué hexagonal

La regla de oro: **las dependencias siempre apuntan hacia adentro**.

```
        ┌──────────────────────────────────────────────┐
        │            INFRASTRUCTURE                    │
        │  (Adapters: HTTP, JSON storage, Lambda)      │
        │                                              │
        │   ┌─────────────────────────────────────┐    │
        │   │           APPLICATION               │    │
        │   │           (Use Cases)               │    │
        │   │                                     │    │
        │   │    ┌───────────────────────────┐    │    │
        │   │    │         DOMAIN            │    │    │
        │   │    │  Entities · VOs · Ports   │    │    │
        │   │    │  (TypeScript puro)        │    │    │
        │   │    └───────────────────────────┘    │    │
        │   └─────────────────────────────────────┘    │
        └──────────────────────────────────────────────┘
```

**Domain** no importa nada de NestJS, ni de archivos, ni de AWS. Sólo
TypeScript puro. Eso lo hace ejecutable en cualquier contexto:

- En la API NestJS (vía `JsonCompanyRepository` + `CompanyController`)
- En la Lambda AWS (vía `DynamoCompanyRepository` + `handler`)
- En tests (vía `InMemoryCompanyRepository`)

**Sin tocar una sola línea del dominio**, podemos servir el mismo modelo
de negocio desde tres entornos distintos. Ese es el ROI real de la
arquitectura hexagonal en este challenge.

---

## 🎯 Decisiones de diseño

### 1. Herencia con clase abstracta para Pyme/Corporate

Las dos variantes de empresa **difieren en datos y en reglas de
validación** (Pyme tiene umbrales de empleados/facturación; Corporate
exige fiscalId y representante legal). Modelarlas como un único objeto
con campos opcionales y un `type: string` distribuiría los `if (type === 'PYME')`
por todo el sistema.

Con clase abstracta + subclases:

- Cada subclase encapsula sus invariantes en su propio `static create()`
- El polimorfismo permite que use-cases y mappers operen sobre `Company`
  sin saber el subtipo concreto
- Agregar una `MicroempresaCompany` en el futuro requiere solo crear la
  clase y registrarla en la factory — **Open/Closed Principle**

### 2. Value Objects con constructor privado

`Cuit`, `Money` se construyen vía `static create()`, no con `new`. Esto
garantiza que **es matemáticamente imposible que exista un objeto en
estado inválido** en todo el sistema. La validación corre una vez, en la
construcción, y todo el código posterior puede asumir invariantes.

### 3. CUIT con validación real de dígito verificador

`Cuit.create()` no solo chequea formato (`/^\d{11}$/`), sino que **valida
el algoritmo del checksum argentino** (multiplicadores `[5,4,3,2,7,6,5,4,3,2]`,
módulo 11). Esto rechaza CUITs sintácticamente válidos pero matemáticamente
imposibles, y elimina una clase entera de bugs de datos sucios.

### 4. Money en centavos (entero) internamente

Para evitar errores de floating-point típicos de fintech (`0.1 + 0.2 !== 0.3`),
`Money` guarda el monto como entero en centavos y solo divide por 100 al
exponer el valor. Patrón estándar usado por Stripe, MercadoPago, etc.

### 5. Symbols como tokens de inyección

Los puertos se inyectan vía `Symbol` (`COMPANY_REPOSITORY`, `TRANSFER_REPOSITORY`,
`DATA_DIR`) en lugar de strings. Beneficios:

- Imposible que colisionen con otros tokens
- Refactor-friendly (TypeScript trackea los imports)
- Explícito: el lector sabe inmediatamente que es un token de DI

### 6. Comunicación entre agregados por id (no por referencia)

`Transfer` referencia `companyId: string`, no `company: Company`. Esto
respeta la regla DDD de mantener agregados pequeños y evita:

- N+1 queries
- Lazy loading hell
- Transacciones que tocan múltiples agregados

El use case `GetCompaniesWithTransfersLastMonthUseCase` carga
explícitamente las transferencias primero, extrae los ids únicos, y carga
las empresas en una segunda query. Predecible y testeable.

### 7. Excepciones de dominio mapeadas en infrastructure

El dominio tira `InvalidCuitException`, `CompanyAlreadyExistsException`,
etc. — **nunca** `BadRequestException` de NestJS. La traducción a HTTP
status codes vive en un único lugar: `DomainExceptionFilter`.

Beneficio práctico: la **misma** lógica de mapeo de errores se reescribió
para la Lambda en 15 líneas (función `mapError` en `handler.ts`),
reutilizando todas las excepciones de dominio.

### 8. Persistencia JSON con escritura atómica + lock

`JsonStorage` implementa:

- **Lock por archivo** (`Map<string, Promise>`): serializa lecturas/escrituras
  concurrentes dentro del proceso, evitando corrupción
- **Escritura atómica**: escribe a `companies.json.{pid}.{ts}.tmp` y luego
  hace `rename`. El rename a nivel de filesystem es atómico — el archivo
  nunca queda en estado intermedio incluso si el proceso muere

Esto convierte un JSON file en un store **predecible** para una API
single-instance. Las limitaciones se documentan en la sección de
trade-offs.

### 9. Mappers explícitos entre dominio y persistencia

`CompanyMapper.toRecord()` / `toDomain()` aíslan el formato de
persistencia del modelo de dominio. Beneficios:

- El dominio nunca tiene que conocer JSON ni nombres de columna
- Cambiar el schema de persistencia solo requiere tocar el mapper
- Al cargar desde JSON, los datos pasan por las mismas validaciones que
  los datos creados a mano (vía `Cuit.create()`, `PymeCompany.create()`),
  garantizando que **no puede haber datos inválidos en memoria** ni
  siquiera si alguien edita el JSON a mano

### 10. "Último mes" = rolling window de 30 días

Decisión documentada explícitamente en `DateRange.lastMonth()`. Se eligió
sobre "mes calendario" porque:

- Es predecible (no depende del día del mes)
- Es más útil para reporting y dashboards
- Es testeable con cualquier fecha de referencia

---

## 🧪 Testing

```bash
npm test               # corre todos los specs (~50 tests)
npm run test:cov       # con reporte de coverage
npm run test:watch     # modo watch
```

**Estrategia de testing:**

| Capa            | Tipo de test           | Velocidad | Tipo de doble |
|-----------------|------------------------|-----------|---------------|
| Domain          | Unit puro              | < 1ms     | Ninguno       |
| Application     | Unit con repos fakes   | < 5ms     | Fakes (in-memory repos) |
| Infrastructure  | (cubierto por unit + smoke manual) | — | — |

**Por qué fakes y no mocks:** los `InMemoryCompanyRepository` y
`InMemoryTransferRepository` (en `test/_fakes/`) implementan **el mismo
puerto** que los adapters reales. Esto:

- Garantiza que los use-cases se prueban contra el contrato real, no
  contra suposiciones de un mock
- Hace los tests más legibles (no hay setup de `mock.expects(...).returns(...)`)
- Detecta drift entre el puerto y los adapters (cualquier cambio en la
  interface rompe los fakes y obliga a actualizarlos)

**Cobertura de tests incluida:**

- Value Objects: `Cuit` (incluye casos de checksum válido/inválido) y
  `Money` (incluye el caso de floating-point `0.1 + 0.2`)
- Entidades: `PymeCompany`, `CorporateCompany`, `Transfer` (validaciones
  e invariantes)
- Factory: `CompanyFactory` (instanciación polimórfica, ids únicos)
- Use cases: los 3, con repos in-memory
- Lambda handler: 7 escenarios cubriendo happy paths y errores

---

## ☁️ Lambda AWS

El entregable teórico de AWS vive en `src/lambdas/register-company/` con
su propio README detallado:

- **Código:** `handler.ts` reutiliza `RegisterCompanyUseCase` y todas las
  excepciones del dominio. Cero duplicación.
- **Adapter:** `DynamoCompanyRepository` implementa el mismo puerto
  `CompanyRepository` que el adapter JSON.
- **Tests:** `test/lambdas/register-company/handler.spec.ts` cubre 201,
  400, 409 con `InMemoryCompanyRepository`.
- **Diseño de integración:** [`src/lambdas/register-company/README.md`](src/lambdas/register-company/README.md)
  documenta input/output JSON, diagrama API Gateway → Lambda → DynamoDB,
  schema de tabla con `cuit` como PK para idempotencia, variantes
  sync/SQS/Step Functions, y consideraciones de seguridad/IAM.

---

## ⚠️ Trade-offs y limitaciones reconocidas

Diseño honesto: estas son las decisiones que **no son ideales para
producción** pero son apropiadas para el alcance del challenge.

### 1. JSON file como persistencia

**Limitación:** seguro entre requests del mismo proceso, NO entre
múltiples procesos (ej: PM2 cluster mode, múltiples pods). Dos procesos
escribiendo simultáneamente pueden perder datos.

**Por qué está bien acá:** el challenge explícitamente lo permite y la
API se especifica como single-instance. La arquitectura hexagonal
permite migrar a Postgres/DynamoDB en producción **escribiendo solo un
nuevo adapter**, sin tocar dominio ni use cases.

### 2. Lookup de CUIT en O(n)

**Limitación:** `JsonCompanyRepository.findByCuit()` lee todo el archivo
y filtra. Para 10k empresas degrada notablemente.

**Por qué está bien acá:** el dataset esperado es chico. Para escalar,
el adapter SQL/Dynamo soluciona el problema (índice por CUIT).

### 3. Sin autenticación

**Limitación:** la API no tiene auth. Cualquiera puede registrar
empresas o consultar listados.

**Por qué está bien acá:** fuera de scope del challenge. En producción se
agregaría JWT con un guard global y los endpoints `GET` podrían exigir
roles distintos a los `POST`.

### 4. Lambda no se ejecuta

**Limitación:** el `DynamoCompanyRepository` es un skeleton; el código
del SDK real está comentado.

**Por qué está bien acá:** explícitamente teórico según el enunciado del
challenge. El handler está fully-tested con un repo in-memory y el
README documenta todo el diseño de integración.

### 5. Sin observabilidad (logs estructurados, métricas, tracing)

**Limitación:** solo el `Logger` default de NestJS y `console.log` en la
Lambda.

**Por qué está bien acá:** fuera de scope. En producción se agregaría
pino/winston con structured logging, OpenTelemetry para tracing, y
CloudWatch metrics para la Lambda.

---

## 👤 Autor

Sebastián Levin — Backend/Fullstack Engineer

Challenge técnico desarrollado en abril de 2026.
