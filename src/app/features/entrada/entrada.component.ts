import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../core/services/icones.service';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent implements OnInit {
  // Injeção de dependências
  private iconesService = inject(IconesService);
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
  erroMensagem = signal<string | null>(null);
  tempoErroExibicao = 4000; // 4 segundos

  // Estados computados (derivados)
  botaoCriarHabilitado = computed(
    () => !this.criandoSala() && this.nomeUsuario().trim() !== '' && this.descricaoSala().trim() !== ''
  );

  botaoEntrarHabilitado = computed(
    () => !this.entrandoSala() && this.nomeUsuario().trim() !== '' && this.codigoSala().trim() !== ''
  );

  ngOnInit(): void {
    // Verificar se há uma mensagem no state do router
    const navigation = this.router.getCurrentNavigation();
    const mensagem = navigation?.extras?.state?.['mensagem'];

    if (mensagem) {
      this.mostrarErro(mensagem);
    }
  }

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

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

  // Método para exibir mensagens de erro
  mostrarErro(mensagem: string): void {
    this.erroMensagem.set(mensagem);
    // Esconder depois de um tempo
    setTimeout(() => {
      this.erroMensagem.set(null);
    }, this.tempoErroExibicao);
  }

  // Ações principais
  async criarSala(): Promise<void> {
    if (this.botaoCriarHabilitado()) {
      try {
        // Ativar indicador de carregamento
        this.criandoSala.set(true);

        // Criar a sala usando o serviço
        const sala = await this.salaService.criarSala(this.nomeUsuario(), this.descricaoSala(), this.tipoUsuario());

        // Recuperar o usuário criado (primeiro jogador da sala)
        const usuario = sala.jogadores[0];

        // Salvar este usuário localmente
        this.usuarioService.definirUsuario(usuario);

        // Navegar para a sala
        this.router.navigate(['/sala', sala.id]);
      } catch (error: any) {
        console.error('Erro ao criar sala:', error);
        this.mostrarErro(error.message || 'Erro ao criar sala');
      } finally {
        // Desativar indicador de carregamento
        this.criandoSala.set(false);
      }
    }
  }

  async entrarEmSala(): Promise<void> {
    if (this.botaoEntrarHabilitado()) {
      try {
        // Ativar indicador de carregamento
        this.entrandoSala.set(true);

        // Tenta entrar na sala
        const sala = await this.salaService.entrarEmSala(this.codigoSala(), this.nomeUsuario(), this.tipoUsuario());

        // Encontra o usuário recém-adicionado (último da lista)
        const usuario = sala.jogadores[sala.jogadores.length - 1];

        // Salvar no UsuarioService
        this.usuarioService.definirUsuario(usuario);

        // Navegar para a sala
        this.router.navigate(['/sala', sala.id]);
      } catch (error: any) {
        console.error('Erro ao entrar na sala:', error);
        this.mostrarErro(error.message || 'Erro ao entrar na sala');
      } finally {
        // Desativar carregamento
        this.entrandoSala.set(false);
      }
    }
  }
}
