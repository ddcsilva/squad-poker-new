import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../core/models/sala.model';
import { trigger, transition, style, animate } from '@angular/animations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TemplateExportacaoComponent } from '../template-exportacao/template-exportacao.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ExportacaoService } from '../../../../core/services/exportacao.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, DatePipe, TemplateExportacaoComponent],
  providers: [DatePipe],
  templateUrl: './historico.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))]),
    ]),
  ],
})
export class HistoricoComponent {
  @Input() historicoRodadas: HistoricoRodada[] = [];
  @Input() nomeDono: string = '';
  @Input() rodadaSelecionada: HistoricoRodada | null = null;
  @Input() codigoSala: string = '';

  // Referência para capturar o elemento DOM da rodada
  @ViewChild(TemplateExportacaoComponent) templateExportacao!: TemplateExportacaoComponent;

  @Output() selecionarRodada = new EventEmitter<HistoricoRodada>();
  @Output() voltarParaLista = new EventEmitter<void>();
  @Output() exportarRodada = new EventEmitter<void>();

  // Estados para controle de exportação
  exportandoPNG = false;
  exportandoPDF = false;
  templateVisivel = false;

  constructor(
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private exportacaoService: ExportacaoService
  ) {}

  trackByRodadaNumero(index: number, rodada: HistoricoRodada): number {
    return rodada.numero;
  }

  trackById(index: number, jogadorId: string): string {
    return jogadorId;
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  getJogadoresIds(rodada: HistoricoRodada): string[] {
    if (!rodada.votos) return [];
    return Object.keys(rodada.votos);
  }

  aoSelecionarRodada(rodada: HistoricoRodada): void {
    this.selecionarRodada.emit(rodada);
  }

  aoVoltarParaLista(): void {
    this.voltarParaLista.emit();
  }

  get dataRodadaSelecionada(): Date {
    return this.rodadaSelecionada?.timestamp ?? new Date();
  }

  async aoExportarRodada(): Promise<void> {
    if (!this.rodadaSelecionada) return;

    try {
      this.exportandoPNG = true;
      this.templateVisivel = true;

      // Aguardar o próximo ciclo de renderização
      setTimeout(async () => {
        try {
          // Verificar se o template está disponível
          if (!this.templateExportacao?.templateContainer) {
            console.error('Template de exportação não encontrado no DOM');
            return;
          }

          const element = this.templateExportacao.templateContainer.nativeElement;

          // Usar o serviço para exportar
          await this.exportacaoService.exportarElementoParaPNG(
            element,
            'poker-rodada',
            this.rodadaSelecionada!.numero,
            this.rodadaSelecionada!.timestamp
          );
        } catch (error) {
          console.error('Erro durante a exportação:', error);
        } finally {
          this.templateVisivel = false;
          this.exportandoPNG = false;
        }
      }, 200); // Tempo para garantir renderização
    } catch (error) {
      console.error('Erro ao preparar exportação:', error);
      this.templateVisivel = false;
      this.exportandoPNG = false;
    }
  }

  async exportarHistoricoCompleto(): Promise<void> {
    if (this.historicoRodadas.length === 0) return;

    try {
      this.exportandoPDF = true;

      await this.exportacaoService.exportarHistoricoParaPDF(this.historicoRodadas, this.nomeDono);
    } catch (error) {
      console.error('Erro ao exportar historico completo:', error);
    } finally {
      this.exportandoPDF = false;
    }
  }

  mapearParticipantesParaTemplate() {
    if (!this.rodadaSelecionada?.votos) return [];

    const participantes = [];

    for (const jogadorId of Object.keys(this.rodadaSelecionada.votos)) {
      const jogador = this.rodadaSelecionada.votos[jogadorId];
      participantes.push({
        id: jogadorId,
        nome: jogador.nome,
        voto: jogador.valor,
        cor: jogador.cor,
        tipo: 'participante' as const, // Correção usando "as const" para tipo literal
      });
    }

    return participantes;
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
