import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartaoPokerComponent } from '../../../../shared/components/cartao-poker/cartao-poker.component';

@Component({
  selector: 'app-cartao-votacao',
  standalone: true,
  imports: [CommonModule, CartaoPokerComponent],
  templateUrl: './cartao-votacao.component.html',
})
export class CartaoVotacaoComponent {
  @Input() cartasDisponiveis: string[] = [];
  @Input() valorSelecionado: string | null = null;
  @Input() tipoUsuario: 'participante' | 'espectador' = 'participante';
  @Input() votacaoEncerrada: boolean = false;
  @Input() participantesQueVotaram: number = 0;
  @Input() totalParticipantes: number = 0;

  @Output() selecionarCarta = new EventEmitter<string>();

  trackByCarta(index: number, carta: string): string {
    return carta;
  }

  aoSelecionarCarta(valor: string): void {
    if (!this.votacaoEncerrada && this.tipoUsuario === 'participante') {
      this.selecionarCarta.emit(valor);
    }
  }

  calcularPorcentagemVotacao(): number {
    if (this.totalParticipantes === 0) return 0;
    return (this.participantesQueVotaram / this.totalParticipantes) * 100;
  }
}
