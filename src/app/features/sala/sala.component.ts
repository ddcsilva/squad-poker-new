// src/app/features/sala/sala.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala.component.html',
})
export class SalaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private salaService = inject(SalaService);
  public usuarioService = inject(UsuarioService);

  salaId = '';

  ngOnInit(): void {
    // Capturar o ID da sala da rota
    this.salaId = this.route.snapshot.paramMap.get('id') || '';
    console.log('Sala ID:', this.salaId);

    // Aqui carregaremos os dados da sala (em breve)
  }
}
