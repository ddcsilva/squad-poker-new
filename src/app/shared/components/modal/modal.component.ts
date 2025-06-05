import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule, FocusMonitor, FocusTrap, FocusTrapFactory, LiveAnnouncer } from '@angular/cdk/a11y';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  private iconesService = inject(IconesService);

  @Input() visivel = false;
  @Input() titulo = '';
  @Input() descricao?: string; // Descrição opcional para screen readers
  @Input() focoInicial?: string; // Seletor CSS para elemento de foco inicial
  @Input() anunciarAbertura = true; // Controla se deve anunciar abertura
  @Input() anunciarFechamento = true; // Controla se deve anunciar fechamento
  @Input() bloquearScroll = true; // Controla se deve bloquear scroll do body

  @Output() fechar = new EventEmitter<void>();
  @Output() aberto = new EventEmitter<void>(); // Evento quando modal abre
  @Output() fechado = new EventEmitter<void>(); // Evento quando modal fecha

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

  get iconeFechar(): SafeHtml {
    return this.iconesService.iconeFechar;
  }

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
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.fecharModal();
  }

  private handleTabKey(event: KeyboardEvent): void {
    // O FocusTrap do Angular CDK já gerencia Tab e Shift+Tab automaticamente
    if (!this.focusTrap || !this.focusTrap.hasAttached()) {
      return;
    }
    // Deixar o CDK FocusTrap gerenciar a navegação
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

    // Bloquear scroll do body se configurado
    if (this.bloquearScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Anunciar abertura do modal se configurado
    if (this.anunciarAbertura) {
      this.anunciarAberturaModal();
    }

    // Aguardar renderização e configurar foco
    setTimeout(() => {
      this.capturarFocoNoModal();
      this.lerConteudoAutomaticamente();
    }, 100);

    // Emitir evento de abertura
    this.aberto.emit();
  }

  private aoFecharModal(): void {
    // Anunciar fechamento se configurado
    if (this.anunciarFechamento && this.visivel) {
      this.anunciarFechamentoModal();
    }

    // Restaurar foco ao elemento original
    if (this.elementoAtivoAnterior) {
      this.focusMonitor.focusVia(this.elementoAtivoAnterior, 'program');
      this.elementoAtivoAnterior = null;
    }

    // Restaurar scroll do body se foi bloqueado
    if (this.bloquearScroll) {
      document.body.style.overflow = '';
    }

    // Limpar focus trap
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = null;
    }

    // Emitir evento de fechamento
    this.fechado.emit();
  }

  private capturarFocoNoModal(): void {
    const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (!modalElement) {
      return;
    }

    // Criar focus trap
    this.focusTrap = this.focusTrapFactory.create(modalElement);

    // Configurar foco inicial
    if (this.focoInicial) {
      const elementoFocoInicial = modalElement.querySelector(this.focoInicial) as HTMLElement;
      if (elementoFocoInicial) {
        this.focusMonitor.focusVia(elementoFocoInicial, 'program');
      } else {
        this.focusTrap.focusFirstTabbableElement();
      }
    } else {
      this.focusTrap.focusFirstTabbableElement();
    }

    // Garantir que o trap está ativo
    if (!this.focusTrap.hasAttached()) {
      this.focusTrap.attachAnchors();
    }
  }

  // ========== Screen Reader Support ==========

  private anunciarAberturaModal(): void {
    const mensagem = this.titulo
      ? `Modal aberto: ${this.titulo}`
      : 'Modal aberto';
    this.liveAnnouncer.announce(mensagem, 'assertive');
  }

  private lerConteudoAutomaticamente(): void {
    if (!this.titulo) {
      return;
    }

    setTimeout(() => {
      let conteudo = this.titulo;

      if (this.descricao) {
        conteudo += `. ${this.descricao}`;
      }

      conteudo += '. Use Tab para navegar, ESC para fechar.';

      this.liveAnnouncer.announce(conteudo, 'polite');
    }, 500);
  }

  private anunciarFechamentoModal(): void {
    this.liveAnnouncer.announce('Modal fechado', 'polite');
  }

  // ========== Métodos Públicos ==========

  fecharModal(): void {
    this.fechar.emit();
  }

  /**
   * Método para anunciar mensagens personalizadas via screen reader
   */
  anunciar(mensagem: string, prioridade: 'polite' | 'assertive' = 'polite'): void {
    this.liveAnnouncer.announce(mensagem, prioridade);
  }

  /**
   * Método para focar em um elemento específico dentro do modal
   */
  focarElemento(seletor: string): void {
    if (!this.visivel) {
      return;
    }

    const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (!modalElement) {
      return;
    }

    const elemento = modalElement.querySelector(seletor) as HTMLElement;
    if (elemento) {
      this.focusMonitor.focusVia(elemento, 'program');
    }
  }
}
