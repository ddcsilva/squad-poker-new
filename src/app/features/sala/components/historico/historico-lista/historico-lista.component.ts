import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-historico-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-lista.component.html',
})
export class HistoricoListaComponent {
  @Input() historicoRodadas: HistoricoRodada[] = [];
  @Input() exportandoPDF: boolean = false;

  @Output() selecionarRodada = new EventEmitter<HistoricoRodada>();
  @Output() exportarHistorico = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  trackByRodadaNumero(index: number, rodada: HistoricoRodada): number {
    return rodada.numero;
  }

  get iconeDownload(): SafeHtml {
    const svg = `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get iconeCarregando(): SafeHtml {
    const svg = `<svg
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
