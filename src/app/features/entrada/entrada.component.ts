import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent {
  // Injeção de dependências
  private salaService = inject(SalaService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // Estados primários com Signals
  modo = signal<'criar' | 'entrar'>('criar');
  nomeUsuario = signal<string>('');
  tipoUsuario = signal<'participante' | 'espectador'>('participante');
  descricaoSala = signal<string>('');
  codigoSala = signal<string>('');

  // Estado de UI
  criandoSala = signal<boolean>(false);
  entrandoSala = signal<boolean>(false);

  // Estados computados (derivados)
  botaoCriarHabilitado = computed(
    () => !this.criandoSala() && this.nomeUsuario().trim() !== '' && this.descricaoSala().trim() !== ''
  );

  botaoEntrarHabilitado = computed(
    () => !this.entrandoSala() && this.nomeUsuario().trim() !== '' && this.codigoSala().trim() !== ''
  );

  // Métodos para manipular o estado
  alternarModo(novoModo: 'criar' | 'entrar'): void {
    this.modo.set(novoModo);
  }

  selecionarTipoUsuario(tipo: 'participante' | 'espectador'): void {
    this.tipoUsuario.set(tipo);
  }

  atualizarNome(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.nomeUsuario.set(input.value);
  }

  atualizarDescricao(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.descricaoSala.set(input.value);
  }

  atualizarCodigo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.codigoSala.set(input.value);
  }

  async criarSala(): Promise<void> {
    if (this.botaoCriarHabilitado()) {
      try {
        // 1. Ativar indicador de carregamento
        this.criandoSala.set(true);

        // 2. Criar a sala no Firebase
        const sala = await this.salaService.criarSala(this.nomeUsuario(), this.descricaoSala(), this.tipoUsuario());

        // 3. Recuperar o usuário criado (primeiro jogador da sala)
        const usuario = sala.jogadores[0];

        // 4. Salvar este usuário localmente
        this.usuarioService.definirUsuario(usuario);

        // 5. Navegar para a sala
        this.router.navigate(['/sala', sala.id]);
      } catch (error) {
        console.error('Erro ao criar sala:', error);
        // Futuramente: exibir mensagem de erro ao usuário
      } finally {
        // Desativar indicador de carregamento
        this.criandoSala.set(false);
      }
    }
  }

  async entrarEmSala(): Promise<void> {
    if (this.botaoEntrarHabilitado()) {
      // Stub - implementaremos depois
      console.log('Entrando na sala...', {
        nome: this.nomeUsuario(),
        tipo: this.tipoUsuario(),
        codigo: this.codigoSala(),
      });
    }
  }
}
