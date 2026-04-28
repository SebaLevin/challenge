import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../shared/domain/domain.exception';
import { InvalidCuitException } from '../../companies/domain/exceptions/invalid-cuit.exception';
import { InvalidCompanyDataException } from '../../companies/domain/exceptions/invalid-company-data.exception';
import { CompanyAlreadyExistsException } from '../../companies/domain/exceptions/company-already-exists.exception';

/**
 * Mapea excepciones de dominio a respuestas HTTP.
 *
 * El dominio NO conoce status codes. Acá vive la única traducción
 * dominio → HTTP del sistema. Si mañana exponemos los mismos casos
 * de uso por gRPC o GraphQL, escribimos un filter equivalente sin
 * tocar el dominio.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  public catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.mapToHttpStatus(exception);

    this.logger.warn(
      `${exception.constructor.name}: ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      error: exception.constructor.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }

  private mapToHttpStatus(exception: DomainException): number {
    if (exception instanceof CompanyAlreadyExistsException) {
      return HttpStatus.CONFLICT; // 409
    }
    if (
      exception instanceof InvalidCuitException ||
      exception instanceof InvalidCompanyDataException
    ) {
      return HttpStatus.BAD_REQUEST; // 400
    }
    return HttpStatus.UNPROCESSABLE_ENTITY; // 422 default
  }
}
