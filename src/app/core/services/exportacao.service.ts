import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HistoricoRodada } from '../models/sala.model';

@Injectable({
  providedIn: 'root',
})
export class ExportacaoService {
  constructor(private datePipe: DatePipe) {}

  /**
   * Exporta um elemento DOM para uma imagem PNG
   * @param element Elemento DOM a ser exportado como imagem
   * @param nomeArquivo Nome base do arquivo (sem extensão)
   * @param rodadaNumero Número da rodada para incluir no nome do arquivo
   * @param timestamp Data/hora para incluir no nome do arquivo
   * @returns Promise que resolve quando a exportação for concluída
   */
  async exportarElementoParaPNG(
    element: HTMLElement,
    nomeArquivo: string = 'poker-rodada',
    rodadaNumero?: number,
    timestamp?: Date
  ): Promise<void> {
    try {
      // Configurações do html2canvas
      const options: any = {
        backgroundColor: 'white',
        scale: 2, // Melhor qualidade em telas de alta resolução
        logging: false,
        useCORS: true,
        allowTaint: true,
      };

      // Converter o elemento DOM para canvas
      const canvas = await html2canvas(element, options);

      // Obter a imagem como URL de dados
      const dataUrl = canvas.toDataURL('image/png');

      // Formatar o nome do arquivo
      let nomeArquivoCompleto = nomeArquivo;

      // Adicionar número da rodada se fornecido
      if (rodadaNumero !== undefined) {
        nomeArquivoCompleto += `-${rodadaNumero}`;
      }

      // Adicionar timestamp formatado se fornecido
      if (timestamp) {
        const dataFormatada = this.formatarData(timestamp);
        nomeArquivoCompleto += `-${dataFormatada}`;
      }

      // Adicionar extensão
      nomeArquivoCompleto += '.png';

      // Criar link para download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = nomeArquivoCompleto;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao exportar para PNG:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Exporta o histórico de rodadas para um arquivo PDF
   * @param historicoRodadas Lista de rodadas a serem incluídas no PDF
   * @param nomeDono Nome do dono da sala (para indicar nos relatórios)
   * @param nomeArquivo Nome base para o arquivo (sem extensão)
   * @returns Promise que resolve quando a exportação for concluída
   */
  async exportarHistoricoParaPDF(
    historicoRodadas: HistoricoRodada[],
    nomeDono: string,
    nomeArquivo: string = 'squad-poker-historico'
  ): Promise<void> {
    if (historicoRodadas.length === 0) {
      return Promise.reject(new Error('Não há rodadas para exportar'));
    }

    try {
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
      for (let i = 0; i < historicoRodadas.length; i++) {
        const rodada = historicoRodadas[i];
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
          pdf.text(rodada.pontuacaoFinal, margin + 80, yPos, { align: 'center' });
        }

        yPos += 12;

        // Tabela de participantes com design minimalista
        const participantes = Object.entries(rodada.votos || {}).map(([id, jogador]) => {
          const nome = jogador.nome;
          const isOwner = jogador.nome === nomeDono;
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

        // Atualizar posição Y após a tabela
        // @ts-ignore - Precisamos acessar uma propriedade não tipada
        yPos = pdf.lastAutoTable.finalY + 20;
      }

      // Rodapé discreto em todas as páginas
      // @ts-ignore - Acessando propriedade interna do jsPDF
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
      pdf.save(`${nomeArquivo}-${dataFormatada}.pdf`);

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao exportar histórico para PDF:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Formata uma data para uso em nomes de arquivo
   * @param data Data a ser formatada
   * @returns String no formato YYYY-MM-DD
   */
  private formatarData(data: Date | undefined): string {
    if (!data) return 'export';
    return this.datePipe.transform(data, 'yyyy-MM-dd') || 'export';
  }
}
