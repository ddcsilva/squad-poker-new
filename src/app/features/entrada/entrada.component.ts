import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent {
  // Aqui virá nossa lógica em breve
}
