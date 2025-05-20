import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmacaoModalComponent } from '../../../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
  selector: 'app-sala-remover-participante-modal',
  standalone: true,
  imports: [CommonModule, ConfirmacaoModalComponent],
  templateUrl: './sala-remover-participante-modal.component.html',
})
export class SalaRemoverParticipanteModalComponent {
  @Input() visivel: boolean = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();
}
