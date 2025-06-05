import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-confirmacao-modal',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './confirmacao-modal.component.html',
})
export class ConfirmacaoModalComponent {
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
