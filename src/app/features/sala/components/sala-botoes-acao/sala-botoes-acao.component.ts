import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
  selector: 'app-sala-botoes-acao',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './sala-botoes-acao.component.html',
})
export class SalaBotoesAcaoComponent implements OnChanges {
  private iconesService = inject(IconesService);
  private liveAnnouncer = inject(LiveAnnouncer);

  @Input() votosRevelados: boolean = false;
  @Input() descricaoNovaRodada: string = '';
  @Input() processando: boolean = false;
  @Input() temEmpate: boolean = false;
  @Input() participantesQueVotaram: number = 0;
  @Input() totalParticipantes: number = 0;

  @Output() revelarVotos = new EventEmitter<void>();
  @Output() reiniciarVotacao = new EventEmitter<void>();
  @Output() descricaoMudou = new EventEmitter<string>();
  @Output() criarNovaRodada = new EventEmitter<void>();
  @Output() encerrarSala = new EventEmitter<void>();

  @ViewChild(ModalComponent) modal!: ModalComponent;

  modalNovaRodadaAberto = false;
  descricaoAnterior = '';
  validacaoMensagem = '';

  // Estados de validação
  get ehValido(): boolean {
    return this.descricaoNovaRodada.trim().length >= 3;
  }

  get podeCriar(): boolean {
    return this.ehValido && !this.processando;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.modalNovaRodadaAberto) {
      return;
    }

    switch (event.key) {
      case 'Enter':
        this.handleEnterKey(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
    }
  }

  private handleEnterKey(event: KeyboardEvent): void {
    // Só submete se não estiver em um botão (evita duplo submit)
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      return;
    }

    if (this.podeCriar) {
      event.preventDefault();
      this.confirmarNovaRodada();
    } else {
      // Anunciar por que não pode submeter
      this.anunciarProblemaValidacao();
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.cancelarELimparFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modalNovaRodadaAberto'] && this.modalNovaRodadaAberto) {
      // Aguardar renderização e configurar foco inicial
      setTimeout(() => {
        this.configurarFocoInicial();
      }, 150);
    }
  }

  private configurarFocoInicial(): void {
    // Foco inicial no campo de input
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      // Anunciar instruções
      this.liveAnnouncer.announce(
        'Modal de nova rodada aberto. Digite a descrição da rodada. Mínimo 3 caracteres. Enter para confirmar, ESC para cancelar.',
        'polite'
      );
    }
  }

  private validarDescricaoEmTempoReal(valor: string): void {
    const valorLimpo = valor.trim();

    if (valorLimpo.length === 0) {
      this.validacaoMensagem = '';
    } else if (valorLimpo.length < 3) {
      this.validacaoMensagem = `Mínimo 3 caracteres. Atual: ${valorLimpo.length}`;
      this.anunciarValidacao('Descrição muito curta. Mínimo 3 caracteres.');
    } else if (valorLimpo.length > 100) {
      this.validacaoMensagem = `Máximo 100 caracteres. Atual: ${valorLimpo.length}`;
      this.anunciarValidacao('Descrição muito longa. Máximo 100 caracteres.');
    } else {
      this.validacaoMensagem = '';
      if (this.descricaoAnterior.trim().length < 3 && valorLimpo.length >= 3) {
        this.anunciarValidacao('Descrição válida. Pressione Enter para confirmar.');
      }
    }

    this.descricaoAnterior = valor;
  }

  private anunciarValidacao(mensagem: string): void {
    // Debounce para evitar muitos anúncios
    setTimeout(() => {
      this.liveAnnouncer.announce(mensagem, 'polite');
    }, 500);
  }

  private anunciarProblemaValidacao(): void {
    if (this.descricaoNovaRodada.trim().length < 3) {
      this.liveAnnouncer.announce(
        'Não é possível criar rodada. Descrição deve ter pelo menos 3 caracteres.',
        'assertive'
      );
    }
  }

  cancelarELimparFormulario(): void {
    // Limpar formulário
    this.descricaoNovaRodada = '';
    this.validacaoMensagem = '';
    this.descricaoAnterior = '';
    this.descricaoMudou.emit('');

    // Anunciar cancelamento
    this.liveAnnouncer.announce('Nova rodada cancelada. Formulário limpo.', 'polite');

    // Fechar modal
    this.fecharModalNovaRodada();
  }

  // Getters existentes mantidos
  get podeRevelarVotos(): boolean {
    return this.participantesQueVotaram === this.totalParticipantes && this.totalParticipantes > 0;
  }

  get textoRevelarVotos(): string {
    if (this.totalParticipantes === 0) {
      return 'Aguardando participantes';
    }

    if (this.podeRevelarVotos) {
      return 'Revelar Votos';
    }

    return `Aguardando votos`;
  }

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

  // Métodos de ação atualizados
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

    // Validação em tempo real com anúncios
    this.validarDescricaoEmTempoReal(valor);
  }

  abrirModalNovaRodada(): void {
    this.modalNovaRodadaAberto = true;
    this.descricaoAnterior = this.descricaoNovaRodada;
  }

  fecharModalNovaRodada(): void {
    this.modalNovaRodadaAberto = false;
    this.validacaoMensagem = '';
  }

  confirmarNovaRodada(): void {
    if (this.podeCriar) {
      this.liveAnnouncer.announce(`Nova rodada criada: ${this.descricaoNovaRodada.trim()}`, 'assertive');
      this.criarNovaRodada.emit();
      this.modalNovaRodadaAberto = false;
      this.validacaoMensagem = '';
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
