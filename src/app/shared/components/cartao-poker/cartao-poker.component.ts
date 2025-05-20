import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(private sanitizer: DomSanitizer) {}

  get iconeSelecionado(): SafeHtml {
    const svg = `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3 w-3 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
