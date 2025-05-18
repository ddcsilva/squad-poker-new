import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartaoPokerComponent } from '../../../../shared/components/cartao-poker/cartao-poker.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cartao-votacao',
  standalone: true,
  imports: [CommonModule, CartaoPokerComponent],
  templateUrl: './cartao-votacao.component.html',
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
    if (this.ehVotacaoAtiva() && this.ehParticipante()) {
      this.selecionarCarta.emit(valor);
    }
  }

  ehParticipante(): boolean {
    return this.tipoUsuario === 'participante';
  }

  ehVotacaoAtiva(): boolean {
    return !this.votacaoEncerrada;
  }

  calcularPorcentagemVotacao(): number {
    if (this.totalParticipantes === 0) return 0;
    return (this.participantesQueVotaram / this.totalParticipantes) * 100;
  }

  obterClasseBarraProgresso(): string {
    const porcentagem = this.calcularPorcentagemVotacao();

    if (porcentagem === 100) return 'bg-green-500';
    if (porcentagem >= 75) return 'bg-green-400';
    if (porcentagem >= 50) return 'bg-poker-blue';
    if (porcentagem >= 25) return 'bg-yellow-400';
    return 'bg-yellow-300';
  }

  obterStatusTextoVotacao(): string {
    const porcentagem = this.calcularPorcentagemVotacao();
    const faltam = this.totalParticipantes - this.participantesQueVotaram;

    if (porcentagem === 100) return 'Todos votaram! Pronto para revelar.';
    if (porcentagem >= 75) return `Apenas ${faltam} participante${faltam !== 1 ? 's' : ''} ainda não votou.`;
    if (porcentagem >= 50) return 'Metade dos participantes já votou.';
    if (porcentagem > 0) return 'Votação em andamento...';
    return 'Aguardando votos dos participantes.';
  }
}
