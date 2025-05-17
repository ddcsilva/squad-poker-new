import { Routes } from '@angular/router';
import { EntradaComponent } from './features/entrada/entrada.component';
import { SalaComponent } from './features/sala/sala.component';

export const routes: Routes = [
  { path: '', component: EntradaComponent },
  { path: 'sala/:id', component: SalaComponent },
  { path: '**', redirectTo: '' },
];
