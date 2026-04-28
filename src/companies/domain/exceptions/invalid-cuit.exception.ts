import { DomainException } from '../../../shared/domain/domain.exception';

export class InvalidCuitException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
