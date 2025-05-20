import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-historico-detalhes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-detalhes.component.html',
})
export class HistoricoDetalhesComponent {
  @Input() rodada!: HistoricoRodada;
  @Input() nomeDono: string = '';
  @Input() exportandoPNG: boolean = false;

  @Output() voltar = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  getJogadoresIds(rodada: HistoricoRodada): string[] {
    if (!rodada.votos) return [];
    return Object.keys(rodada.votos);
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  trackById(index: number, jogadorId: string): string {
    return jogadorId;
  }

  get iconeVoltar(): SafeHtml {
    const svg = `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
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

  get iconeCrown(): SafeHtml {
    const svg = `<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="h-4 w-4 text-amber-500 fill-current">
      <path d="M4 17L2 7l6 5 4-8 4 8 6-5-2 10H4zm0 2h16v2H4v-2z" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
