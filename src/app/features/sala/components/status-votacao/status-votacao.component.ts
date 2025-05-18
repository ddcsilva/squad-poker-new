import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-status-votacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-votacao.component.html',
})
export class StatusVotacaoComponent {
  @Input() numeroRodada: number = 1;
  @Input() usuario: Usuario | null = null;
  @Input() votosRevelados: boolean = false;
}
