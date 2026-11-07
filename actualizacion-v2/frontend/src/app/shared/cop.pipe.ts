import { Pipe, PipeTransform } from '@angular/core';

// Formato de pesos colombianos: 189000 → "$ 189.000"
// Usa Intl directamente, así no hay que registrar el locale es-CO en Angular.
const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Pipe({ name: 'cop' })
export class CopPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    return formatter.format(Number(value ?? 0));
  }
}
