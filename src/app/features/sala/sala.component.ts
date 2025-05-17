import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Sala } from '../../core/models/sala.model';
import { CartaoPokerComponent } from '../../shared/components/cartao-poker/cartao-poker.component';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, CartaoPokerComponent],
  templateUrl: './sala.component.html',
})
export class SalaComponent implements OnInit, OnDestroy {
  // Injeção de dependências
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private salaService = inject(SalaService);
  public usuarioService = inject(UsuarioService);

  // Estados
  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);
  salaId = '';
  cartasPoker = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  cartaSelecionada = signal<string | null>(null);

  private salaSubscription?: Subscription;

  ngOnInit(): void {
    this.salaId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarSala();

    // Definir valor inicial da carta selecionada com base no voto atual do usuário, se disponível
    const usuarioAtual = this.usuarioService.usuarioAtual();
    if (usuarioAtual && usuarioAtual.voto) {
      this.cartaSelecionada.set(usuarioAtual.voto);
    }
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

  // Método para registrar voto
  async votar(valor: string): Promise<void> {
    if (!this.sala || !this.usuarioService.usuarioAtual()) {
      return;
    }

    const usuario = this.usuarioService.usuarioAtual()!;

    // Atualizar estado local imediatamente para feedback visual rápido
    this.cartaSelecionada.set(valor);

    // Apenas participantes podem votar, não espectadores
    if (usuario.tipo !== 'participante') {
      return;
    }

    try {
      await this.salaService.registrarVoto(this.salaId, usuario.id, valor);
    } catch (error) {
      console.error('Erro ao registrar voto:', error);
      // Resetar estado local em caso de erro
      this.cartaSelecionada.set(null);
    }
  }

  // Métodos auxiliares para o template
  obterParticipantesQueVotaram(): number {
    if (!this.sala?.jogadores) return 0;
    return this.sala.jogadores.filter(j => j.tipo === 'participante' && j.voto !== null).length;
  }

  obterTotalParticipantes(): number {
    if (!this.sala?.jogadores) return 0;
    return this.sala.jogadores.filter(j => j.tipo === 'participante').length;
  }
}
