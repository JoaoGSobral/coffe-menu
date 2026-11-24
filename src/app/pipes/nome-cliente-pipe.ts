import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nomeCliente',
  standalone: true
})
export class NomeClientePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return 'Comanda: (não informado)';
    return `Comando: ${value.toUpperCase()}`; // coloca em caixa alta
  }
}
