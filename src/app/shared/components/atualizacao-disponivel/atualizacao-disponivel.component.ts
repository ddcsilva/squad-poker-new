import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtualizacaoService } from '../../../core/services/atualizacao.service';

@Component({
  selector: 'app-atualizacao-disponivel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atualizacao-disponivel.component.html',
})
export class AtualizacaoDisponivelComponent {
  atualizacaoService = inject(AtualizacaoService);

  atualizar(): void {
    this.atualizacaoService.atualizarParaNovaVersao();
  }
}
