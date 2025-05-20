import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  private iconesService = inject(IconesService);

  @Input() visivel = false;
  @Input() titulo = '';
  @Output() fechar = new EventEmitter<void>();

  get iconeFechar(): SafeHtml {
    return this.iconesService.iconeFechar;
  }

  fecharModal() {
    this.fechar.emit();
  }
}
