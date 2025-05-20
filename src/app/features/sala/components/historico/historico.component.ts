import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../core/models/sala.model';
import { trigger, transition, style, animate } from '@angular/animations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TemplateExportacaoComponent } from '../template-exportacao/template-exportacao.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(private datePipe: DatePipe, private sanitizer: DomSanitizer) {}

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
          // CORREÇÃO 2: Verificar se templateExportacao está definido
          if (!this.templateExportacao?.templateContainer) {
            console.error('Template de exportação não encontrado no DOM');
            return;
          }

          const element = this.templateExportacao.templateContainer.nativeElement;

          const options: any = {
            backgroundColor: 'white',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
          };

          const canvas = await html2canvas(element, options);
          const dataUrl = canvas.toDataURL('image/png');

          // CORREÇÃO 3: Usar o método seguro para formatar a data
          const rodada = this.rodadaSelecionada!;
          const dataFormatada = this.formatarData(rodada.timestamp);
          const nomeArquivo = `poker-rodada-${rodada.numero}-${dataFormatada}.png`;

          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = nomeArquivo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Erro durante a captura do template:', error);
        } finally {
          this.templateVisivel = false;
          this.exportandoPNG = false;
        }
      }, 200); // Aumentado para garantir tempo de renderização
    } catch (error) {
      console.error('Erro ao exportar rodada:', error);
      this.templateVisivel = false;
      this.exportandoPNG = false;
    }
  }

  formatarData(data: Date | undefined): string {
    if (!data) return 'export';
    return this.datePipe.transform(data, 'yyyy-MM-dd') || 'export';
  }

  async exportarHistoricoCompleto(): Promise<void> {
    if (this.historicoRodadas.length === 0) return;

    try {
      this.exportandoPDF = true;

      // Cores do tema com tipagem explícita como tuplas
      const coresTema = {
        azulPrincipal: [63, 81, 181] as [number, number, number], // #3f51b5 - poker-blue
        azulClaro: [232, 234, 246] as [number, number, number], // #e8eaf6 - fundo claro
        azulMedio: [197, 202, 233] as [number, number, number], // #c5cae9 - destaque médio
        brancoAzulado: [245, 247, 255] as [number, number, number], // #f5f7ff - linhas alternadas
        cinzaEscuro: [66, 66, 66] as [number, number, number], // #424242 - texto principal
        cinzaMedio: [117, 117, 117] as [number, number, number], // #757575 - texto secundário
      };

      // Criar PDF no formato A4
      const pdf = new jsPDF();
      pdf.setFont('helvetica', 'normal');

      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      // ===== CABEÇALHO =====
      pdf.setFillColor(...coresTema.azulPrincipal);
      pdf.rect(0, 0, pageWidth, 30, 'F');

      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('Squad Poker', pageWidth / 2, 14, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Histórico de Rodadas', pageWidth / 2, 24, { align: 'center' });

      // Data de exportação
      pdf.setFontSize(8);
      const dataHoje = this.datePipe.transform(new Date(), 'dd/MM/yyyy') || '';
      pdf.text(`Exportado em ${dataHoje}`, pageWidth - margin, 24, { align: 'right' });

      let yPos = 40;

      // ===== RODADAS =====
      for (let i = 0; i < this.historicoRodadas.length; i++) {
        const rodada = this.historicoRodadas[i];
        const numParticipantes = Object.keys(rodada.votos || {}).length;
        const alturaEstimadaRodada = 50 + numParticipantes * 8;

        // Nova página se necessário
        if (yPos + alturaEstimadaRodada > pageHeight - 25) {
          pdf.addPage();

          // Mini-cabeçalho na nova página
          pdf.setFillColor(...coresTema.azulPrincipal);
          pdf.rect(0, 0, pageWidth, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.text('Squad Poker - Histórico de Rodadas', pageWidth / 2, 10, { align: 'center' });

          yPos = 25;
        }

        // Separador de rodadas (linha fina)
        if (i > 0) {
          pdf.setDrawColor(...coresTema.azulClaro);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPos - 10, pageWidth - margin, yPos - 10);
        }

        // Cabeçalho da rodada
        pdf.setTextColor(...coresTema.azulPrincipal);
        pdf.setFontSize(12);
        pdf.text(`Rodada ${rodada.numero}`, margin, yPos);

        // Data da rodada
        const dataRodada = this.datePipe.transform(rodada.timestamp, 'dd/MM/yyyy') || '';
        pdf.setFontSize(8);
        pdf.setTextColor(...coresTema.cinzaMedio);
        pdf.text(dataRodada, pageWidth - margin, yPos, { align: 'right' });

        yPos += 6;

        // Descrição da rodada
        pdf.setTextColor(...coresTema.cinzaEscuro);
        pdf.setFontSize(10);
        pdf.text(rodada.descricao, margin, yPos);

        yPos += 10;

        // Pontuação final
        if (rodada.pontuacaoFinal) {
          pdf.setTextColor(...coresTema.azulPrincipal);
          pdf.setFontSize(10);
          pdf.text('Pontuação Final:', margin, yPos);
          pdf.setFontSize(12);
          pdf.setFontSize(12);
          pdf.text(rodada.pontuacaoFinal, margin + 80, yPos, { align: 'center' });
        }

        yPos += 12;

        // Tabela de participantes com design minimalista
        const participantes = Object.entries(rodada.votos || {}).map(([id, jogador]) => {
          const nome = jogador.nome;
          const isOwner = jogador.nome === this.nomeDono;
          return [isOwner ? `${nome} (Dono)` : nome, jogador.valor || '-'];
        });

        autoTable(pdf, {
          startY: yPos,
          head: [['Participante', 'Voto']],
          body: participantes,
          theme: 'plain',
          headStyles: {
            fillColor: coresTema.azulPrincipal,
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left',
          },
          bodyStyles: {
            fontSize: 9,
            textColor: coresTema.cinzaEscuro,
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'center' },
          },
          styles: {
            cellPadding: 4,
            font: 'helvetica',
          },
          margin: { left: margin, right: margin },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
        });

        // @ts-ignore
        yPos = pdf.lastAutoTable.finalY + 20;
      }

      // Rodapé discreto
      // @ts-ignore
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(...coresTema.cinzaMedio);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Squad Poker', margin, pageHeight - 10);
      }

      // Salvar o PDF
      const dataFormatada = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || 'export';
      pdf.save(`squad-poker-historico-${dataFormatada}.pdf`);
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
