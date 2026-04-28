import { DomainException } from '../../../shared/domain/domain.exception';

export class CompanyAlreadyExistsException extends DomainException {
  constructor(cuit: string) {
    super(`A company with CUIT "${cuit}" is already registered`);
  }
}
