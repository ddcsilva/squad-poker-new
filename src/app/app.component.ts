import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusConexaoComponent } from './shared/components/status-conexao/status-conexao.component';
import { AtualizacaoDisponivelComponent } from './shared/components/atualizacao-disponivel/atualizacao-disponivel.component';
import { AtualizacaoService } from './core/services/atualizacao.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StatusConexaoComponent, AtualizacaoDisponivelComponent],
  template: `
    <router-outlet></router-outlet>
    <app-status-conexao></app-status-conexao>
    <app-atualizacao-disponivel></app-atualizacao-disponivel>
  `,
})
export class AppComponent {
  constructor(private atualizacaoService: AtualizacaoService) {}
}
