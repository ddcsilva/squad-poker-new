import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cartao-poker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cartao-poker.component.html',
})
export class CartaoPokerComponent {
  @Input() valor!: string;
  @Input() selecionado = false;
  @Input() desabilitado = false;
  @Output() selecionar = new EventEmitter<string>();
}
