import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule, FocusMonitor, FocusTrap, FocusTrapFactory, LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-confirmacao-modal',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './confirmacao-modal.component.html',
})
export class ConfirmacaoModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visivel: boolean = false;
  @Input() titulo: string = 'Confirmação';
  @Input() mensagem: string = 'Tem certeza que deseja prosseguir?';
  @Input() textoBotaoConfirmar: string = 'Confirmar';
  @Input() textoBotaoCancelar: string = 'Cancelar';
  @Input() tipoBotaoConfirmar: 'primario' | 'perigo' | 'sucesso' = 'primario';

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();

  // IDs únicos para acessibilidade
  readonly tituloId = `modal-titulo-${Math.random().toString(36).substr(2, 9)}`;
  readonly descricaoId = `modal-descricao-${Math.random().toString(36).substr(2, 9)}`;

  // Gerenciamento de estado
  private elementoAtivoAnterior: HTMLElement | null = null;
  private focusTrap: FocusTrap | null = null;

  constructor(
    private focusMonitor: FocusMonitor,
    private focusTrapFactory: FocusTrapFactory,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visivel) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Tab':
        this.handleTabKey(event);
        break;
      case 'Enter':
        this.handleEnterKey(event);
        break;
      case ' ':
      case 'Space':
        this.handleSpaceKey(event);
        break;
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.aoFechar();
  }

  private handleTabKey(event: KeyboardEvent): void {
    // O FocusTrap do Angular CDK já gerencia Tab e Shift+Tab automaticamente
    // quando está ativo, mantendo o foco dentro do modal.
    // Este método é mantido para casos especiais ou debugging.

    if (!this.focusTrap || !this.focusTrap.hasAttached()) {
      // Se o focus trap não estiver ativo, não interferimos na navegação
      return;
    }

    // Deixar o CDK FocusTrap gerenciar a navegação por Tab
    // O comportamento padrão já mantém o foco dentro do modal
  }

  private handleEnterKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'BUTTON') {
      // Se já está em um botão, deixa o comportamento padrão
      return;
    }

    // Se não está em um botão, ativa o botão de confirmar
    event.preventDefault();
    this.aoConfirmar();
  }

  private handleSpaceKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    if (target.tagName === 'BUTTON') {
      // Se já está em um botão, deixa o comportamento padrão
      return;
    }

    // Se não está em um botão, ativa o botão focado ou o de confirmar
    event.preventDefault();
    const focusedButton = document.activeElement as HTMLButtonElement;

    if (focusedButton && focusedButton.tagName === 'BUTTON') {
      focusedButton.click();
    } else {
      this.aoConfirmar();
    }
  }

  ngOnInit(): void {
    // Configuração inicial se necessário
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visivel']) {
      if (this.visivel) {
        this.aoAbrirModal();
      } else {
        this.aoFecharModal();
      }
    }
  }

  ngOnDestroy(): void {
    this.aoFecharModal();
  }

  private aoAbrirModal(): void {
    // Armazenar elemento ativo antes de abrir modal
    this.elementoAtivoAnterior = document.activeElement as HTMLElement;

    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';

    // Anunciar abertura do modal para screen readers
    this.anunciarAberturaModal();

    // Aguardar o próximo ciclo de detecção para o modal estar renderizado
    setTimeout(() => {
      this.capturarFocoNoModal();
      this.lerTituloEDescricaoAutomaticamente();
    }, 100);
  }

  private aoFecharModal(): void {
    // Anunciar fechamento quando apropriado
    if (this.visivel) {
      this.anunciarFechamentoModal();
    }

    // Restaurar foco ao elemento original
    if (this.elementoAtivoAnterior) {
      this.focusMonitor.focusVia(this.elementoAtivoAnterior, 'program');
      this.elementoAtivoAnterior = null;
    }

    // Restaurar scroll do body
    document.body.style.overflow = '';

    // Limpar focus trap
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = null;
    }
  }

  private capturarFocoNoModal(): void {
    const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (modalElement) {
      // Criar focus trap (além do CDK automático para controle adicional)
      this.focusTrap = this.focusTrapFactory.create(modalElement);

      // Ativar o focus trap e focar no primeiro elemento
      this.focusTrap.focusFirstTabbableElement();

      // Garantir que o trap está ativo
      if (!this.focusTrap.hasAttached()) {
        this.focusTrap.attachAnchors();
      }
    }
  }

  // ========== 3.1.4 Screen Reader Support ==========

  private anunciarAberturaModal(): void {
    // Anunciar abertura do modal
    const mensagemAbertura = `Modal de confirmação aberto: ${this.titulo}`;
    this.liveAnnouncer.announce(mensagemAbertura, 'assertive');
  }

  private lerTituloEDescricaoAutomaticamente(): void {
    // Ler título e descrição automaticamente
    setTimeout(() => {
      const conteudoCompleto = `${this.titulo}. ${this.mensagem}. Use Tab para navegar entre as opções.`;
      this.liveAnnouncer.announce(conteudoCompleto, 'polite');
    }, 500);
  }

  private anunciarFechamentoModal(): void {
    // Anunciar fechamento quando apropriado
    this.liveAnnouncer.announce('Modal de confirmação fechado', 'polite');
  }

  private anunciarAcaoRealizada(acao: string): void {
    // Anunciar ação realizada (confirmar/cancelar)
    this.liveAnnouncer.announce(`Ação realizada: ${acao}`, 'assertive');
  }

  // ========== Métodos de Ação Atualizados ==========

  obterClasseBotaoConfirmar(): string {
    const base = 'w-full sm:w-auto px-4 py-2 text-white rounded-md transition-colors sm:order-2';

    if (this.tipoBotaoConfirmar === 'perigo') {
      return `${base} bg-red-600 hover:bg-red-700`;
    } else if (this.tipoBotaoConfirmar === 'sucesso') {
      return `${base} bg-green-600 hover:bg-green-700`;
    } else {
      return `${base} bg-poker-blue hover:bg-blue-700`;
    }
  }

  aoConfirmar(): void {
    this.anunciarAcaoRealizada('Confirmado');
    this.confirmar.emit();
  }

  aoCancelar(): void {
    this.anunciarAcaoRealizada('Cancelado');
    this.cancelar.emit();
  }

  aoFechar(): void {
    this.fechar.emit();
  }
}
