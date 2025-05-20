import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sala-alternar-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala-alternar-layout.component.html',
})
export class SalaAlternarLayoutComponent {
  @Input() mostrandoHistorico: boolean = false;
  @Output() alternarVisualizacao = new EventEmitter<boolean>();
}
