import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule, FocusMonitor, FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

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
    private focusTrapFactory: FocusTrapFactory
  ) {}

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

    // Aguardar o próximo ciclo de detecção para o modal estar renderizado
    setTimeout(() => {
      this.capturarFocoNoModal();
    });
  }

  private aoFecharModal(): void {
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
      // Criar focus trap
      this.focusTrap = this.focusTrapFactory.create(modalElement);
      this.focusTrap.focusFirstTabbableElement();
    }
  }

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
    this.confirmar.emit();
  }

  aoCancelar(): void {
    this.cancelar.emit();
  }

  aoFechar(): void {
    this.fechar.emit();
  }
}
