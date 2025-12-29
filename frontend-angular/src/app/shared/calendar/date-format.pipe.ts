import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    }
    // Puedes agregar más formatos si quieres
    return value.toString();
  }
}
