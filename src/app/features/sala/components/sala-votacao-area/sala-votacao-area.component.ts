import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { CartaoVotacaoComponent } from '../cartao-votacao/cartao-votacao.compoment';
import { StatusVotacaoComponent } from '../status-votacao/status-votacao.component';

@Component({
  selector: 'app-sala-votacao-area',
  standalone: true,
  imports: [CommonModule, CartaoVotacaoComponent, StatusVotacaoComponent],
  templateUrl: './sala-votacao-area.component.html',
})
export class SalaVotacaoAreaComponent {
  @Input() numeroRodada: number = 1;
  @Input() usuarioAtual: Usuario | null = null;
  @Input() votosRevelados: boolean = false;
  @Input() cartasDisponiveis: string[] = [];
  @Input() cartaSelecionada: string | null = null;
  @Input() tipoUsuario: 'participante' | 'espectador' = 'participante';
  @Input() participantesQueVotaram: number = 0;
  @Input() totalParticipantes: number = 0;

  @Output() votar = new EventEmitter<string>();
}
