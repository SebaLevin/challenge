import { Company, CompanyProps } from './company.entity';
import { CompanyType } from '../value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../exceptions/invalid-company-data.exception';

export interface PymeCompanyProps extends CompanyProps {
  annualRevenue: number;
  employeeCount: number;
}

/**
 * Empresa Pyme. Reglas de negocio específicas:
 * - Facturación anual y cantidad de empleados dentro de rangos PyME.
 *
 * Los umbrales están inspirados en la clasificación argentina (Res. SEPYME),
 * pero se mantienen configurables a nivel constante para facilitar ajustes.
 */
export class PymeCompany extends Company {
  private static readonly MAX_EMPLOYEES = 250;
  private static readonly MAX_ANNUAL_REVENUE = 2_000_000_000; // ARS

  private readonly annualRevenue: number;
  private readonly employeeCount: number;

  private constructor(props: PymeCompanyProps) {
    super(props);
    this.annualRevenue = props.annualRevenue;
    this.employeeCount = props.employeeCount;
  }

  public static create(props: PymeCompanyProps): PymeCompany {
    PymeCompany.assertPymeThresholds(
      props.annualRevenue,
      props.employeeCount,
    );
    return new PymeCompany(props);
  }

  private static assertPymeThresholds(
    annualRevenue: number,
    employeeCount: number,
  ): void {
    if (!Number.isFinite(annualRevenue) || annualRevenue < 0) {
      throw new InvalidCompanyDataException(
        'Annual revenue must be a non-negative number',
      );
    }
    if (!Number.isInteger(employeeCount) || employeeCount < 1) {
      throw new InvalidCompanyDataException(
        'Employee count must be a positive integer',
      );
    }
    if (annualRevenue > PymeCompany.MAX_ANNUAL_REVENUE) {
      throw new InvalidCompanyDataException(
        `Annual revenue exceeds PyME threshold (${PymeCompany.MAX_ANNUAL_REVENUE})`,
      );
    }
    if (employeeCount > PymeCompany.MAX_EMPLOYEES) {
      throw new InvalidCompanyDataException(
        `Employee count exceeds PyME threshold (${PymeCompany.MAX_EMPLOYEES})`,
      );
    }
  }

  public getType(): CompanyType {
    return CompanyType.PYME;
  }

  public getAnnualRevenue(): number {
    return this.annualRevenue;
  }

  public getEmployeeCount(): number {
    return this.employeeCount;
  }
}
