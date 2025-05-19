import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../core/models/sala.model';
import { trigger, transition, style, animate } from '@angular/animations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TemplateExportacaoComponent } from '../template-exportacao/template-exportacao.component';

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

  constructor(private datePipe: DatePipe) {}

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

      // Criar PDF no formato A4
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;

      // Cabeçalho do documento
      pdf.setFillColor(245, 245, 255);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Título principal
      pdf.setTextColor(63, 81, 181); // poker-blue
      pdf.setFontSize(24);
      pdf.text('♠️ Squad Poker', 14, 20);
      pdf.setFontSize(16);
      pdf.text('Histórico de Rodadas', 14, 30);

      // Data de exportação
      pdf.setTextColor(100, 100, 100); // Cinza
      pdf.setFontSize(10);
      const dataHoje = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm') || '';
      pdf.text(`Exportado em ${dataHoje}`, pageWidth - 14, 20, { align: 'right' });

      // Espaço após o cabeçalho
      let yPos = 50;

      // Para cada rodada
      for (const rodada of this.historicoRodadas) {
        // Título da rodada com linha decorativa
        pdf.setDrawColor(63, 81, 181);
        pdf.setLineWidth(0.5);
        pdf.line(14, yPos, pageWidth - 14, yPos);
        yPos += 5;

        // Número e descrição da rodada
        pdf.setTextColor(63, 81, 181);
        pdf.setFontSize(14);
        pdf.text(`Rodada ${rodada.numero}`, 14, yPos);
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(rodada.descricao, 45, yPos);

        // Data da rodada
        const dataRodada = this.datePipe.transform(rodada.timestamp, 'dd/MM/yyyy HH:mm') || '';
        pdf.setFontSize(10);
        pdf.text(dataRodada, pageWidth - 14, yPos, { align: 'right' });
        yPos += 10;

        // Pontuação final em destaque
        if (rodada.pontuacaoFinal) {
          pdf.setFillColor(240, 247, 255);
          pdf.rect(14, yPos, 40, 15, 'F');
          pdf.setTextColor(63, 81, 181);
          pdf.setFontSize(14);
          pdf.text(`${rodada.pontuacaoFinal}`, 34, yPos + 10, { align: 'center' });
          pdf.setFontSize(8);
          pdf.text('PONTUAÇÃO', 34, yPos + 5, { align: 'center' });
          pdf.text('FINAL', 34, yPos + 15, { align: 'center' });
        }
        yPos += 25;

        // Tabela de participantes
        const participantes = Object.entries(rodada.votos).map(([id, jogador]) => [
          jogador.nome + (jogador.nome === this.nomeDono ? ' 👑' : ''),
          jogador.valor || '-',
          'Jogador',
        ]);

        // @ts-ignore - o tipo do jspdf-autotable não está definido
        autoTable(pdf, {
          startY: yPos,
          head: [['Participante', 'Voto', 'Tipo']],
          body: participantes,
          theme: 'striped',
          headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 10,
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40 },
          },
          margin: { left: 14, right: 14 },
          alternateRowStyles: {
            fillColor: [245, 245, 255],
          },
        });

        // Atualizar posição Y após a tabela
        // @ts-ignore - o tipo do jspdf-autotable não está definido
        yPos = pdf.lastAutoTable.finalY + 20;

        // Adicionar nova página se necessário
        if (yPos > pdf.internal.pageSize.height - 40) {
          pdf.addPage();
          yPos = 20;
        }
      }

      // Rodapé
      // @ts-ignore - o tipo do jspdf não inclui alguns métodos internos
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });
      }

      // Salvar o PDF
      const dataFormatada = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || 'export';
      pdf.save(`squad-poker-historico-${dataFormatada}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar histórico completo:', error);
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
}
