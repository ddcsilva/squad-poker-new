import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
  selector: 'app-status-votacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-votacao.component.html',
})
export class StatusVotacaoComponent {
  private iconesService = inject(IconesService);

  @Input() numeroRodada: number = 1;
  @Input() usuario: Usuario | null = null;
  @Input() votosRevelados: boolean = false;

  get iconeVotou(): SafeHtml {
    return this.iconesService.iconeVotou;
  }

  get iconeAguardando(): SafeHtml {
    return this.iconesService.iconeAguardando;
  }

  get iconeEspectador(): SafeHtml {
    return this.iconesService.iconeEspectador;
  }

  get iconeResultados(): SafeHtml {
    return this.iconesService.iconeResultados;
  }
}
