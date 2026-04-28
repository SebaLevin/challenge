import { Cuit } from '../value-objects/cuit.vo';
import { CompanyType } from '../value-objects/company-type.vo';
import { InvalidCompanyDataException } from '../exceptions/invalid-company-data.exception';

export interface CompanyProps {
  id: string;
  cuit: Cuit;
  businessName: string;
  adhesionDate: Date;
}

/**
 * Entidad base abstracta para empresas.
 *
 * Define el contrato común para todos los tipos de empresa (Pyme, Corporate)
 * e impone invariantes de negocio en el constructor. Las subclases aportan
 * reglas y comportamiento específicos a su tipo.
 *
 * Decisión de diseño: usamos herencia en lugar de un discriminator simple
 * porque las reglas de validación y comportamiento difieren entre tipos,
 * lo que aprovecha polimorfismo (Open/Closed Principle).
 */
export abstract class Company {
  protected readonly id: string;
  protected readonly cuit: Cuit;
  protected readonly businessName: string;
  protected readonly adhesionDate: Date;

  protected constructor(props: CompanyProps) {
    this.assertBusinessName(props.businessName);
    this.assertAdhesionDate(props.adhesionDate);

    this.id = props.id;
    this.cuit = props.cuit;
    this.businessName = props.businessName.trim();
    this.adhesionDate = props.adhesionDate;
  }

  private assertBusinessName(name: string): void {
    const trimmed = name?.trim() ?? '';
    if (trimmed.length < 2) {
      throw new InvalidCompanyDataException(
        'Business name must be at least 2 characters long',
      );
    }
    if (trimmed.length > 200) {
      throw new InvalidCompanyDataException(
        'Business name must not exceed 200 characters',
      );
    }
  }

  private assertAdhesionDate(date: Date): void {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidCompanyDataException('Invalid adhesion date');
    }
    if (date.getTime() > Date.now()) {
      throw new InvalidCompanyDataException(
        'Adhesion date cannot be in the future',
      );
    }
  }

  public abstract getType(): CompanyType;

  public getId(): string {
    return this.id;
  }

  public getCuit(): Cuit {
    return this.cuit;
  }

  public getBusinessName(): string {
    return this.businessName;
  }

  public getAdhesionDate(): Date {
    return new Date(this.adhesionDate);
  }

  /**
   * Indica si la empresa se adhirió dentro del rango de fechas dado (inclusive).
   */
  public wasAdheredBetween(from: Date, to: Date): boolean {
    const time = this.adhesionDate.getTime();
    return time >= from.getTime() && time <= to.getTime();
  }
}
