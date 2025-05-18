import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controles-moderacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controles-moderacao.component.html',
})
export class ControlesModeracaoComponent {
  @Input() votosRevelados: boolean = false;
  @Input() descricaoNovaRodada: string = '';
  @Input() processando: boolean = false;
  @Input() temEmpate: boolean = false;
  @Input() participantesQueVotaram: number = 0;

  @Output() revelarVotos = new EventEmitter<void>();
  @Output() reiniciarVotacao = new EventEmitter<void>();
  @Output() descricaoMudou = new EventEmitter<string>();
  @Output() criarNovaRodada = new EventEmitter<void>();

  aoRevelarVotos(): void {
    this.revelarVotos.emit();
  }

  aoReiniciarVotacao(): void {
    this.reiniciarVotacao.emit();
  }

  aoDescricaoMudada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.descricaoMudou.emit(input.value);
  }

  aoCriarNovaRodada(): void {
    if (this.descricaoNovaRodada && !this.processando) {
      this.criarNovaRodada.emit();
    }
  }

  obterClassesBotaoNovaRodada(): object {
    return {
      'bg-poker-blue hover:bg-blue-700': !this.temEmpate && !this.processando,
      'bg-yellow-500 hover:bg-yellow-600': this.temEmpate && !this.processando,
      'bg-gray-300 opacity-70': this.processando,
      'cursor-not-allowed': this.processando || !this.descricaoNovaRodada,
    };
  }
}
