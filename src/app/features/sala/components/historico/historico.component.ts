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

      // Definir fonte padrão (mais compatível)
      pdf.setFont('helvetica', 'normal');

      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margemLateral = 14;
      const larguraUtil = pageWidth - margemLateral * 2;

      // ===== CABEÇALHO DO DOCUMENTO =====
      // Fundo do cabeçalho
      pdf.setFillColor(...coresTema.azulPrincipal);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Título sem símbolos Unicode
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      // Removemos o símbolo e usamos apenas texto
      pdf.text('Squad Poker', margemLateral, 20);

      pdf.setFontSize(16);
      pdf.text('Historico de Rodadas', margemLateral, 32);

      // Data de exportação
      pdf.setFontSize(10);
      const dataHoje = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm') || '';
      pdf.text(`Exportado em ${dataHoje}`, pageWidth - margemLateral, 20, { align: 'right' });

      // Iniciar posição Y após o cabeçalho
      let yPos = 50;

      // ===== RODADAS =====
      // Para cada rodada
      for (let i = 0; i < this.historicoRodadas.length; i++) {
        const rodada = this.historicoRodadas[i];

        // Verificar se a próxima rodada caberá na página atual
        const numParticipantes = Object.keys(rodada.votos || {}).length;
        const alturaEstimadaRodada = 120 + numParticipantes * 12;

        // Se não couber, adicionar nova página
        if (yPos + alturaEstimadaRodada > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;

          // Adicionar um cabeçalho simples na nova página - sem símbolos
          pdf.setFillColor(...coresTema.azulPrincipal);
          pdf.rect(0, 0, pageWidth, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.text('Squad Poker - Historico de Rodadas (continuacao)', margemLateral, 10);
        }

        // === TÍTULO E INFO DA RODADA ===
        // Título da rodada com linha decorativa
        pdf.setDrawColor(...coresTema.azulPrincipal);
        pdf.setLineWidth(0.5);
        pdf.line(margemLateral, yPos, pageWidth - margemLateral, yPos);
        yPos += 5;

        // Número e descrição da rodada
        pdf.setTextColor(...coresTema.azulPrincipal);
        pdf.setFontSize(14);
        pdf.text(`Rodada ${rodada.numero}`, margemLateral, yPos);
        pdf.setFontSize(12);
        pdf.setTextColor(...coresTema.cinzaEscuro);
        pdf.text(rodada.descricao, 45, yPos);

        // Data da rodada
        const dataRodada = this.datePipe.transform(rodada.timestamp, 'dd/MM/yyyy HH:mm') || '';
        pdf.setFontSize(10);
        pdf.text(dataRodada, pageWidth - margemLateral, yPos, { align: 'right' });
        yPos += 10;

        // === PONTUAÇÃO FINAL ===
        // Destacar pontuação final em um cartão visual
        if (rodada.pontuacaoFinal) {
          pdf.setFillColor(...coresTema.azulClaro);
          pdf.rect(margemLateral, yPos, 40, 15, 'F');

          pdf.setTextColor(...coresTema.azulPrincipal);
          pdf.setFontSize(14);
          pdf.text(`${rodada.pontuacaoFinal}`, 34, yPos + 10, { align: 'center' });

          pdf.setFontSize(8);
          pdf.text('PONTUACAO', 34, yPos + 5, { align: 'center' });
          pdf.text('FINAL', 34, yPos + 15, { align: 'center' });
        }
        yPos += 25;

        // === TABELA DE PARTICIPANTES ===
        // Preparar os dados para a tabela - simplifique textos para evitar problemas de codificação
        const participantes = Object.entries(rodada.votos || {}).map(([id, jogador]) => {
          // Evitar caracteres especiais
          const nome = jogador.nome;
          const isOwner = jogador.nome === this.nomeDono;

          // Determinar o tipo de jogador correto
          // Aqui precisamos verificar o tipo real do participante
          // assumindo que temos acesso a essa informação
          const tipoParticipante = 'Jogador'; // ou 'Espectador' se aplicável

          return [isOwner ? `${nome} (Dono)` : nome, jogador.valor || '-', tipoParticipante];
        });

        // Configurar e desenhar a tabela
        autoTable(pdf, {
          startY: yPos,
          head: [['Participante', 'Voto', 'Tipo']],
          body: participantes,
          theme: 'striped',
          headStyles: {
            fillColor: coresTema.azulPrincipal,
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 10,
          },
          styles: {
            font: 'helvetica',
            fontStyle: 'normal',
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40 },
          },
          margin: { left: margemLateral, right: margemLateral },
          alternateRowStyles: {
            fillColor: coresTema.brancoAzulado,
          },
        });

        // Atualizar posição Y após a tabela
        // @ts-ignore - o tipo do jspdf-autotable não está definido
        yPos = pdf.lastAutoTable.finalY + 20;

        // Adicionar nova página se necessário
        if (yPos > pageHeight - 40 && i < this.historicoRodadas.length - 1) {
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
        pdf.setTextColor(...coresTema.cinzaMedio);
        pdf.text(`Pagina ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Squad Poker - Planning Poker Simplificado', margemLateral, pageHeight - 10);
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
}
