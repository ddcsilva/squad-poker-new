import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'codigoTruncado', standalone: true })
export class CodigoTruncadoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    if (value.length <= 10) return value;
    return value.slice(0, 4) + '...' + value.slice(-4);
  }
}
