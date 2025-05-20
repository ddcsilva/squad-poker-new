import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
  selector: 'app-cartao-poker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cartao-poker.component.html',
})
export class CartaoPokerComponent {
  private iconesService = inject(IconesService);

  @Input() valor!: string;
  @Input() selecionado = false;
  @Input() desabilitado = false;
  @Output() selecionar = new EventEmitter<string>();

  get iconeSelecionado(): SafeHtml {
    return this.iconesService.iconeSelecionado;
  }
}
