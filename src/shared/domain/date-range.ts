/**
 * Calcula el rango [from, to] correspondiente a "el último mes"
 * relativo a una fecha de referencia (default: ahora).
 *
 * Definición: los últimos 30 días (rolling window) hasta la fecha de referencia,
 * inclusive en ambos extremos.
 *
 * Decisión: elegimos rolling window sobre "mes calendario" porque es más
 * predecible y útil para reporting (no depende del día del mes).
 * Esta decisión se documenta en el README.
 */
export class DateRange {
  public static lastMonth(reference: Date = new Date()): {
    from: Date;
    to: Date;
  } {
    const to = new Date(reference);
    const from = new Date(reference);
    from.setDate(from.getDate() - 30);
    return { from, to };
  }
}
