import { Component, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoRodada } from '../../../../core/models/sala.model';
import { TemplateExportacaoComponent } from '../template-exportacao/template-exportacao.component';
import { ExportacaoService } from '../../../../core/services/exportacao.service';
import { HistoricoListaComponent } from './historico-lista/historico-lista.component';
import { HistoricoDetalhesComponent } from './historico-detalhes/historico-detalhes.component';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, TemplateExportacaoComponent, HistoricoListaComponent, HistoricoDetalhesComponent],
  templateUrl: './historico.component.html',
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

  // Estados para controle de exportação
  exportandoPNG = signal(false);
  exportandoPDF = signal(false);
  templateVisivel = signal(false);

  constructor(private exportacaoService: ExportacaoService) {}

  // Getter para evitar new Date() no template
  get dataRodadaSelecionada(): Date {
    return this.rodadaSelecionada?.timestamp || new Date();
  }

  async aoExportarRodada(): Promise<void> {
    if (!this.rodadaSelecionada) return;

    try {
      this.exportandoPNG.set(true);
      this.templateVisivel.set(true);

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
          this.templateVisivel.set(false);
          this.exportandoPNG.set(false);
        }
      }, 200); // Tempo para garantir renderização
    } catch (error) {
      console.error('Erro ao preparar exportação:', error);
      this.templateVisivel.set(false);
      this.exportandoPNG.set(false);
    }
  }

  async exportarHistoricoCompleto(): Promise<void> {
    if (this.historicoRodadas.length === 0) return;

    try {
      this.exportandoPDF.set(true);

      await this.exportacaoService.exportarHistoricoParaPDF(this.historicoRodadas, this.nomeDono);
    } catch (error) {
      console.error('Erro ao exportar historico completo:', error);
    } finally {
      this.exportandoPDF.set(false);
    }
  }

  // Método para mapear dados para o template de exportação
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
        tipo: 'participante' as const,
      });
    }

    return participantes;
  }
}
