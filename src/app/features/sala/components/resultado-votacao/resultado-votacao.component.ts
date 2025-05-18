import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-resultado-votacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado-votacao.component.html',
})
export class ResultadoVotacaoComponent {
  @Input() jogadores: Usuario[] = [];
  @Input() nomeDono: string = '';
  @Input() ehModerador: boolean = false;
  @Input() pontuacaoFinal: string = '';
  @Input() temEmpate: boolean = false;
  @Input() valorMaisVotado: string = '-';
  @Input() contagemMaisVotado: number = 0;
  @Input() totalVotosValidos: number = 0;
  @Input() valoresEmpatados: string[] = [];

  @Output() pontuacaoFinalMudou = new EventEmitter<string>();

  trackById(index: number, jogador: Usuario): string {
    return jogador.id;
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  obterClasseContainerResultado(): string {
    if (this.temEmpate) {
      return 'bg-yellow-50 border-yellow-100';
    }
    return 'bg-green-50 border-green-100';
  }

  obterClasseCartaVotada(jogador: Usuario): object {
    if (!jogador.voto) return {};

    return {
      'bg-yellow-50': this.temEmpate && this.valoresEmpatados.includes(jogador.voto),
      'border-yellow-500': this.temEmpate && this.valoresEmpatados.includes(jogador.voto),
      'bg-green-50': !this.temEmpate && jogador.voto === this.valorMaisVotado,
      'border-green-500': !this.temEmpate && jogador.voto === this.valorMaisVotado,
    };
  }

  calcularPorcentagemMaisVotado(): string {
    if (this.totalVotosValidos === 0) return '0';
    const percentual = (this.contagemMaisVotado / this.totalVotosValidos) * 100;
    return percentual.toFixed(0);
  }

  aoPontuacaoFinalMudada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pontuacaoFinalMudou.emit(input.value);
  }
}
