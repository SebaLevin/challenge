/**
 * Excepción base para errores de dominio.
 * Las capas superiores (adapters HTTP) deberán mapearlas a HTTP status codes apropiados.
 */
export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
