// src/app/features/sala/components/sala-botoes-acao/sala-botoes-acao.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-sala-botoes-acao',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sala-botoes-acao.component.html',
})
export class SalaBotoesAcaoComponent {
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

  modalNovaRodadaAberto = false;

  constructor(private sanitizer: DomSanitizer) {}

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

  get iconeRevelarVotos(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get iconeReiniciarVotacao(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get iconeNovaRodada(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get iconeEncerrarSala(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
