import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoricoRodada } from '../../../../core/models/sala.model';
import { trigger, transition, style, animate } from '@angular/animations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, DatePipe],
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

  // Referência para capturar o elemento DOM da rodada
  @ViewChild('rodadaDetalhes') rodadaDetalhes: ElementRef | undefined;

  @Output() selecionarRodada = new EventEmitter<HistoricoRodada>();
  @Output() voltarParaLista = new EventEmitter<void>();
  @Output() exportarRodada = new EventEmitter<void>();

  // Estados para controle de exportação
  exportandoPNG = false;
  exportandoPDF = false;

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

  async aoExportarRodada(): Promise<void> {
    if (!this.rodadaDetalhes || !this.rodadaSelecionada) return;

    try {
      this.exportandoPNG = true;

      // 1. Capturar o elemento DOM
      const element = this.rodadaDetalhes.nativeElement;

      // 2. Converter com html2canvas
      const options: any = {
        background: 'white',
        scale: 2,
        logging: false,
        useCORS: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        allowTaint: true,
        removeContainer: true,
        foreignObjectRendering: false,
      };
      const canvas = await html2canvas(element, options);

      // 3. Converter para PNG
      const dataUrl = canvas.toDataURL('image/png');

      // 4. Criar nome do arquivo
      const dataFormatada = this.datePipe.transform(this.rodadaSelecionada.timestamp, 'yyyy-MM-dd') || 'export';
      const nomeArquivo = `poker-rodada-${this.rodadaSelecionada.numero}-${dataFormatada}.png`;

      // 5. Criar link para download e simular clique
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar rodada:', error);
    } finally {
      this.exportandoPNG = false;
    }
  }

  async exportarHistoricoCompleto(): Promise<void> {
    if (this.historicoRodadas.length === 0) return;

    try {
      this.exportandoPDF = true;

      // Criar PDF
      const pdf = new jsPDF();
      let posY = 20; // Posição Y inicial

      // Título
      pdf.setFontSize(16);
      pdf.text('Histórico de Planning Poker', 105, posY, { align: 'center' });
      posY += 15;

      // Data de exportação
      pdf.setFontSize(10);
      const dataHoje = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm') || '';
      pdf.text(`Exportado em: ${dataHoje}`, 105, posY, { align: 'center' });
      posY += 15;

      // Para cada rodada
      for (let i = 0; i < this.historicoRodadas.length; i++) {
        const rodada = this.historicoRodadas[i];

        // Nova página após a primeira
        if (i > 0) {
          pdf.addPage();
          posY = 20;
        }

        // Renderizar título da rodada
        pdf.setFontSize(14);
        pdf.text(`Rodada ${rodada.numero}: ${rodada.descricao}`, 15, posY);
        posY += 10;

        // Data da rodada
        pdf.setFontSize(10);
        const dataRodada = this.datePipe.transform(rodada.timestamp, 'dd/MM/yyyy HH:mm') || '';
        pdf.text(`Data: ${dataRodada}`, 15, posY);
        posY += 8;

        // Pontuação Final
        pdf.text(`Pontuação Final: ${rodada.pontuacaoFinal || '-'}`, 15, posY);
        posY += 15;

        // Cabeçalho dos votos
        pdf.setFontSize(12);
        pdf.text('Participantes e Votos:', 15, posY);
        posY += 10;

        // Listar participantes e votos
        pdf.setFontSize(10);
        const jogadoresIds = Object.keys(rodada.votos);

        if (jogadoresIds.length === 0) {
          pdf.text('Nenhum voto registrado', 20, posY);
          posY += 8;
        } else {
          for (const jogadorId of jogadoresIds) {
            const jogador = rodada.votos[jogadorId];
            const nome = jogador.nome + (jogador.nome === this.nomeDono ? ' (Dono da Sala)' : '');
            pdf.text(`• ${nome}: ${jogador.valor}`, 20, posY);
            posY += 8;

            // Evitar que o conteúdo saia da página
            if (posY > 270) {
              pdf.addPage();
              posY = 20;
            }
          }
        }
      }

      // Baixar o PDF
      const dataFormatada = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || 'export';
      pdf.save(`squad-poker-historico-${dataFormatada}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar histórico completo:', error);
    } finally {
      this.exportandoPDF = false;
    }
  }
}
