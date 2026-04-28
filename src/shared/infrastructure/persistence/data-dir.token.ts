/**
 * Token de inyección para el directorio donde viven los archivos JSON.
 *
 * Inyectarlo (en lugar de hardcodearlo) facilita los tests de integración
 * (apuntando a un directorio temporal) y permite configurarlo por env var.
 */
export const DATA_DIR = Symbol('DATA_DIR');
