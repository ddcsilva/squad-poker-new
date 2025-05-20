import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { ControlesModeracaoComponent } from '../controles-moderacao/controles-moderacao.component';

@Component({
  selector: 'app-sala-resultados-area',
  standalone: true,
  imports: [CommonModule, ResultadoVotacaoComponent, ControlesModeracaoComponent],
  templateUrl: './sala-resultados-area.component.html',
})
export class SalaResultadosAreaComponent {
  @Input() jogadores: Usuario[] = [];
  @Input() nomeDono: string = '';
  @Input() ehModerador: boolean = false;
  @Input() pontuacaoFinal: string = '';
  @Input() temEmpate: boolean = false;
  @Input() valorMaisVotado: string = '';
  @Input() contagemMaisVotado: number = 0;
  @Input() totalVotosValidos: number = 0;
  @Input() valoresEmpatados: string[] = [];
  @Input() votosRevelados: boolean = true;
  @Input() descricaoNovaRodada: string = '';
  @Input() processando: boolean = false;
  @Input() participantesQueVotaram: number = 0;

  @Output() pontuacaoFinalMudou = new EventEmitter<string>();
  @Output() revelarVotos = new EventEmitter<void>();
  @Output() reiniciarVotacao = new EventEmitter<void>();
  @Output() descricaoMudou = new EventEmitter<string>();
  @Output() criarNovaRodada = new EventEmitter<void>();
  @Output() encerrarSala = new EventEmitter<void>();
}
