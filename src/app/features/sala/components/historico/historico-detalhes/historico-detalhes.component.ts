import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../../core/services/icones.service';

@Component({
  selector: 'app-historico-detalhes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-detalhes.component.html',
})
export class HistoricoDetalhesComponent {
  private iconesService = inject(IconesService);

  @Input() rodada!: HistoricoRodada;
  @Input() nomeDono: string = '';
  @Input() exportandoPNG: boolean = false;

  @Output() voltar = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<void>();

  get iconeVoltar(): SafeHtml {
    return this.iconesService.iconeVoltar;
  }

  get iconeDownload(): SafeHtml {
    return this.iconesService.iconeDownload;
  }

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

  get iconeCoroa(): SafeHtml {
    return this.iconesService.iconeCoroa;
  }

  obterJogadoresIds(rodada: HistoricoRodada): string[] {
    if (!rodada.votos) return [];
    return Object.keys(rodada.votos);
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  trackById(index: number, jogadorId: string): string {
    return jogadorId;
  }
}
