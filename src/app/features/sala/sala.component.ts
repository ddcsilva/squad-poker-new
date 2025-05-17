// src/app/features/sala/sala.component.ts
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Sala } from '../../core/models/sala.model';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala.component.html',
})
export class SalaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private salaService = inject(SalaService);
  public usuarioService = inject(UsuarioService);
  public router = inject(Router);

  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);
  salaId = '';

  private salaSubscription?: Subscription;

  ngOnInit(): void {
    this.salaId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarSala();
  }

  ngOnDestroy(): void {
    // Limpar subscription para evitar memory leaks
    if (this.salaSubscription) {
      this.salaSubscription.unsubscribe();
    }
  }

  private async carregarSala(): Promise<void> {
    if (!this.salaId) {
      this.router.navigate(['/']);
      return;
    }

    try {
      this.carregando.set(true);

      // Verificar se o usuário está autenticado
      if (!this.usuarioService.usuarioAtual()) {
        // Se não tiver usuário, volta para entrada
        this.router.navigate(['/']);
        return;
      }

      // Observar mudanças na sala em tempo real
      this.salaSubscription = this.salaService.observarSala(this.salaId).subscribe({
        next: () => {
          this.carregando.set(false);
        },
        error: error => {
          console.error('Erro ao carregar sala:', error);
          this.erro.set('Sala não encontrada ou você não tem permissão');
          this.carregando.set(false);
        },
      });
    } catch (error: any) {
      this.erro.set(error.message || 'Erro ao carregar sala');
      this.carregando.set(false);
    }
  }

  // Getter para acesso fácil à sala no template
  get sala(): Sala | null {
    return this.salaService.salaAtual();
  }
}
