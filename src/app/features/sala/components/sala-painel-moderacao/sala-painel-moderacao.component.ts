import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalaBotoesAcaoComponent } from '../sala-botoes-acao/sala-botoes-acao.component';

@Component({
  selector: 'app-sala-painel-moderacao',
  standalone: true,
  imports: [CommonModule, SalaBotoesAcaoComponent],
  templateUrl: './sala-painel-moderacao.component.html',
})
export class SalaPainelModeracaoComponent {
  @Input() ehModerador: boolean = false;
  @Input() votosRevelados: boolean = false;
  @Input() descricaoNovaRodada: string = '';
  @Input() processando: boolean = false;
  @Input() temEmpate: boolean = false;
  @Input() participantesQueVotaram: number = 0;

  @Output() revelarVotos = new EventEmitter<void>();
  @Output() reiniciarVotacao = new EventEmitter<void>();
  @Output() descricaoMudou = new EventEmitter<string>();
  @Output() criarNovaRodada = new EventEmitter<void>();
  @Output() encerrarSala = new EventEmitter<void>();
}
