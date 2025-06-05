import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../core/services/icones.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, A11yModule],
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
