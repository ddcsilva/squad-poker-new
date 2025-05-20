import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoRodada } from '../../../../../core/models/sala.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../../core/services/icones.service';

@Component({
  selector: 'app-historico-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-lista.component.html',
})
export class HistoricoListaComponent {
  private iconesService = inject(IconesService);

  @Input() historicoRodadas: HistoricoRodada[] = [];
  @Input() exportandoPDF: boolean = false;

  @Output() selecionarRodada = new EventEmitter<HistoricoRodada>();
  @Output() exportarHistorico = new EventEmitter<void>();

  get iconeDownload(): SafeHtml {
    return this.iconesService.iconeDownload;
  }

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

  trackByRodadaNumero(index: number, rodada: HistoricoRodada): number {
    return rodada.numero;
  }
}
