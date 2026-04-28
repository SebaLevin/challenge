/**
 * Script de seed: genera datos de ejemplo en data/companies.json y data/transfers.json
 *
 * Uso: npm run seed
 *
 * Crea empresas con distintas fechas de adhesión (algunas dentro del último mes,
 * otras viejas) y transferencias en distintas fechas, para que los 3 endpoints
 * devuelvan resultados interesantes desde el primer arranque.
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const DATA_DIR = path.resolve(process.cwd(), 'data');

const now = Date.now();
const days = (n: number) => 1000 * 60 * 60 * 24 * n;

const companies = [
  {
    id: uuid(),
    type: 'PYME',
    cuit: '30715982934',
    businessName: 'ACME PyME S.A.',
    adhesionDate: new Date(now - days(5)).toISOString(), // último mes
    annualRevenue: 50_000_000,
    employeeCount: 25,
  },
  {
    id: uuid(),
    type: 'PYME',
    cuit: '30708876549',
    businessName: 'Pequeños Gigantes SRL',
    adhesionDate: new Date(now - days(20)).toISOString(), // último mes
    annualRevenue: 12_000_000,
    employeeCount: 8,
  },
  {
    id: uuid(),
    type: 'CORPORATE',
    cuit: '30500010912',
    businessName: 'Megacorp International',
    adhesionDate: new Date(now - days(10)).toISOString(), // último mes
    fiscalId: 'AR-30500010912',
    legalRepresentative: 'María González',
  },
  {
    id: uuid(),
    type: 'CORPORATE',
    cuit: '30616733914',
    businessName: 'Old Holdings Ltd',
    adhesionDate: new Date(now - days(120)).toISOString(), // viejo
    fiscalId: 'AR-30616733914',
    legalRepresentative: 'Juan Pérez',
  },
];

const transfers = [
  {
    id: uuid(),
    companyId: companies[0].id, // ACME PyME — transfirió en el último mes
    amountCents: 1_500_000,
    currency: 'ARS',
    debitAccount: '0001-0000-0001',
    creditAccount: '0002-0000-0002',
    transferDate: new Date(now - days(2)).toISOString(),
  },
  {
    id: uuid(),
    companyId: companies[2].id, // Megacorp — transfirió en el último mes
    amountCents: 250_000_000,
    currency: 'ARS',
    debitAccount: '0003-0000-0003',
    creditAccount: '0004-0000-0004',
    transferDate: new Date(now - days(8)).toISOString(),
  },
  {
    id: uuid(),
    companyId: companies[3].id, // Old Holdings — transferencia VIEJA, no debe aparecer
    amountCents: 1_000_000,
    currency: 'ARS',
    debitAccount: '0005-0000-0005',
    creditAccount: '0006-0000-0006',
    transferDate: new Date(now - days(90)).toISOString(),
  },
];

async function main(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, 'companies.json'),
    JSON.stringify(companies, null, 2),
  );
  await fs.writeFile(
    path.join(DATA_DIR, 'transfers.json'),
    JSON.stringify(transfers, null, 2),
  );
  // eslint-disable-next-line no-console
  console.log(
    `✅ Seed OK: ${companies.length} empresas, ${transfers.length} transferencias en ${DATA_DIR}`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
