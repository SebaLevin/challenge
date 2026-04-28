import { Company, CompanyProps } from './company.entity';
import { CompanyType } from '../value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../exceptions/invalid-company-data.exception';

export interface CorporateCompanyProps extends CompanyProps {
  fiscalId: string;
  legalRepresentative: string;
}

/**
 * Empresa Corporativa. Reglas de negocio específicas:
 * - Requiere un identificador fiscal extendido.
 * - Requiere designar un representante legal.
 */
export class CorporateCompany extends Company {
  private readonly fiscalId: string;
  private readonly legalRepresentative: string;

  private constructor(props: CorporateCompanyProps) {
    super(props);
    this.fiscalId = props.fiscalId;
    this.legalRepresentative = props.legalRepresentative;
  }

  public static create(props: CorporateCompanyProps): CorporateCompany {
    CorporateCompany.assertCorporateFields(
      props.fiscalId,
      props.legalRepresentative,
    );
    return new CorporateCompany({
      ...props,
      fiscalId: props.fiscalId.trim(),
      legalRepresentative: props.legalRepresentative.trim(),
    });
  }

  private static assertCorporateFields(
    fiscalId: string,
    legalRepresentative: string,
  ): void {
    const trimmedFiscalId = fiscalId?.trim() ?? '';
    if (trimmedFiscalId.length < 3) {
      throw new InvalidCompanyDataException(
        'Fiscal ID must be at least 3 characters long',
      );
    }

    const trimmedRep = legalRepresentative?.trim() ?? '';
    if (trimmedRep.length < 2) {
      throw new InvalidCompanyDataException(
        'Legal representative name must be at least 2 characters long',
      );
    }
  }

  public getType(): CompanyType {
    return CompanyType.CORPORATE;
  }

  public getFiscalId(): string {
    return this.fiscalId;
  }

  public getLegalRepresentative(): string {
    return this.legalRepresentative;
  }
}
