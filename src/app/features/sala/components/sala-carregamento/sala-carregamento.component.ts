import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala-carregamento.component.html',
})
export class SalaCarregamentoComponent {
  @Input() carregando: boolean = false;
  @Input() erro: string | null = null;

  @Output() voltar = new EventEmitter<void>();

  constructor(public router: Router) {}
}
