import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appAutoFormat]'
})
export class AutoFormatDirective {
  @Input() pattern: string = 'XXX-XXXXX-XX'; // Patrón por defecto

  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target;
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;

    // Formatear el valor
    const formattedValue = this.formatValue(oldValue);

    // Actualizar el valor del form control
    if (this.control?.control) {
      this.control.control.setValue(formattedValue, { emitEvent: false });
    }

    // Calcular nueva posición del cursor
    const newCursorPosition = this.getCursorPosition(oldValue, formattedValue, cursorPosition);

    // Establecer nueva posición del cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }

  private formatValue(value: string): string {
    // Remover todo lo que no sea número
    const numbers = value.replace(/\D/g, '');

    // Aplicar formato XXX-XXXXX-XX
    let formatted = numbers;

    if (numbers.length > 3) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
    }

    if (numbers.length > 8) {
      formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 8) + '-' + numbers.slice(8, 10);
    }

    // Limitar a 12 caracteres (10 números + 2 guiones)
    return formatted.slice(0, 12);
  }

  private getCursorPosition(oldValue: string, newValue: string, oldCursorPos: number): number {
    const oldDashesBeforeCursor = (oldValue.slice(0, oldCursorPos).match(/-/g) || []).length;
    const newDashesBeforeCursor = (newValue.slice(0, oldCursorPos).match(/-/g) || []).length;

    let newCursorPos = oldCursorPos + (newDashesBeforeCursor - oldDashesBeforeCursor);

    return Math.max(0, Math.min(newCursorPos, newValue.length));
  }
}
