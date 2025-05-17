import { Routes } from '@angular/router';
import { EntradaComponent } from './features/entrada/entrada.component';

export const routes: Routes = [
  { path: '', component: EntradaComponent },
  { path: '**', redirectTo: '' },
];
