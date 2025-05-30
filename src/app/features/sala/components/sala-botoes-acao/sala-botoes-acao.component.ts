import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
  selector: 'app-sala-botoes-acao',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sala-botoes-acao.component.html',
})
export class SalaBotoesAcaoComponent {
  private iconesService = inject(IconesService);

  @Input() votosRevelados: boolean = false;
  @Input() descricaoNovaRodada: string = '';
  @Input() processando: boolean = false;
  @Input() temEmpate: boolean = false;
  @Input() participantesQueVotaram: number = 0;
  @Input() totalParticipantes: number = 0; // 🆕 Novo input adicionado

  @Output() revelarVotos = new EventEmitter<void>();
  @Output() reiniciarVotacao = new EventEmitter<void>();
  @Output() descricaoMudou = new EventEmitter<string>();
  @Output() criarNovaRodada = new EventEmitter<void>();
  @Output() encerrarSala = new EventEmitter<void>();

  modalNovaRodadaAberto = false;

  // 🆕 Getter para verificar se pode revelar votos
  get podeRevelarVotos(): boolean {
    return this.participantesQueVotaram === this.totalParticipantes && this.totalParticipantes > 0;
  }

  // 🆕 Getter para o texto dinâmico do botão
  get textoRevelarVotos(): string {
    if (this.totalParticipantes === 0) {
      return 'Aguardando participantes';
    }

    if (this.podeRevelarVotos) {
      return 'Revelar Votos';
    }

    return `Aguardando votos`;
  }

  // 🆕 Getter para classes CSS do botão
  get classesRevelarVotos(): string {
    const baseClasses = 'min-w-[140px] px-3 py-2 rounded-md transition-colors flex items-center justify-center';

    if (this.podeRevelarVotos) {
      return `${baseClasses} bg-poker-blue text-white hover:bg-blue-700 cursor-pointer`;
    } else {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }
  }

  get iconeRevelarVotos(): SafeHtml {
    return this.iconesService.iconeRevelarVotos;
  }

  get iconeReiniciarVotacao(): SafeHtml {
    return this.iconesService.iconeReiniciarVotacao;
  }

  get iconeNovaRodada() {
    return this.iconesService.iconeNovaRodada;
  }

  get iconeEncerrarSala() {
    return this.iconesService.iconeEncerrarSala;
  }

  aoRevelarVotos(): void {
    this.revelarVotos.emit();
  }

  aoReiniciarVotacao(): void {
    this.reiniciarVotacao.emit();
  }

  aoEncerrarSala(): void {
    this.encerrarSala.emit();
  }

  atualizarDescricao(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    this.descricaoNovaRodada = valor;
    this.descricaoMudou.emit(valor);
  }

  abrirModalNovaRodada(): void {
    this.modalNovaRodadaAberto = true;
  }

  fecharModalNovaRodada(): void {
    this.modalNovaRodadaAberto = false;
  }

  confirmarNovaRodada(): void {
    if (this.descricaoNovaRodada) {
      this.criarNovaRodada.emit();
      this.modalNovaRodadaAberto = false;
    }
  }

  obterClassesBotaoNovaRodada(): object {
    return {
      'bg-green-600 hover:bg-green-700': !this.temEmpate && !this.processando,
      'bg-amber-500 hover:bg-amber-600': this.temEmpate && !this.processando,
      'bg-gray-300': this.processando,
      'opacity-70': this.processando,
      'cursor-not-allowed': this.processando,
    };
  }
}
