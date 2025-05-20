import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusConexaoComponent } from './shared/components/status-conexao/status-conexao.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StatusConexaoComponent],
  template: `
    <router-outlet></router-outlet>
    <app-status-conexao></app-status-conexao>
  `,
})
export class AppComponent {}
