import { DomainException } from '../../../shared/domain/domain.exception';

export class InvalidCompanyDataException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
