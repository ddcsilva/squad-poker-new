import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../core/services/icones.service';
import { SalaValidators } from '../../core/validators/sala.validators';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent implements OnInit {
  private iconesService = inject(IconesService);
  private salaService = inject(SalaService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  modo = signal<'criar' | 'entrar'>('criar');
  nomeUsuario = signal<string>('');
  tipoUsuario = signal<'participante' | 'espectador'>('participante');
  descricaoSala = signal<string>('');
  codigoSala = signal<string>('');
  criandoSala = signal<boolean>(false);
  entrandoSala = signal<boolean>(false);
  erroMensagem = signal<string | null>(null);
  tempoErroExibicao = 4000;

  botaoCriarHabilitado = computed(
    () => !this.criandoSala() && this.nomeUsuario().trim() !== '' && this.descricaoSala().trim() !== ''
  );

  botaoEntrarHabilitado = computed(
    () => !this.entrandoSala() && this.nomeUsuario().trim() !== '' && this.codigoSala().trim() !== ''
  );

  get iconeCarregando(): SafeHtml {
    return this.iconesService.iconeCarregando;
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const mensagem = navigation?.extras?.state?.['mensagem'];

    if (mensagem) {
      this.mostrarErro(mensagem);
    }
  }

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

  mostrarErro(mensagem: string): void {
    this.erroMensagem.set(mensagem);
    setTimeout(() => {
      this.erroMensagem.set(null);
    }, this.tempoErroExibicao);
  }

  async criarSala(): Promise<void> {
    if (this.botaoCriarHabilitado()) {
      try {
        this.criandoSala.set(true);

        const resultadoValidacao = SalaValidators.validarEntradaCriarSala({
          nome: this.nomeUsuario(),
          descricao: this.descricaoSala(),
          tipo: this.tipoUsuario(),
        });

        if (!resultadoValidacao.valido) {
          this.mostrarErro(resultadoValidacao.erros[0]);
          return;
        }

        const dadosSeguros = resultadoValidacao.dadosSanitizados!;
        const sala = await this.salaService.criarSala(dadosSeguros.nome, dadosSeguros.descricao, dadosSeguros.tipo);
        const usuario = sala.jogadores[0];

        this.usuarioService.definirUsuario(usuario);

        this.router.navigate(['/sala', sala.id]);
      } catch (error: any) {
        console.error('Erro ao criar sala:', error);
        this.mostrarErro(error.message || 'Erro ao criar sala');
      } finally {
        this.criandoSala.set(false);
      }
    }
  }

  async entrarEmSala(): Promise<void> {
    if (this.botaoEntrarHabilitado()) {
      try {
        this.entrandoSala.set(true);

        const resultadoValidacao = SalaValidators.validarEntradaEntrarSala({
          nome: this.nomeUsuario(),
          codigo: this.codigoSala(),
          tipo: this.tipoUsuario(),
        });

        if (!resultadoValidacao.valido) {
          this.mostrarErro(resultadoValidacao.erros[0]);
          return;
        }

        const dadosSeguros = resultadoValidacao.dadosSanitizados!;
        const sala = await this.salaService.entrarEmSala(dadosSeguros.codigo, dadosSeguros.nome, dadosSeguros.tipo);
        const usuario = sala.jogadores[sala.jogadores.length - 1];

        this.usuarioService.definirUsuario(usuario);

        this.router.navigate(['/sala', sala.id]);
      } catch (error: any) {
        console.error('Erro ao entrar na sala:', error);
        this.mostrarErro(error.message || 'Erro ao entrar na sala');
      } finally {
        this.entrandoSala.set(false);
      }
    }
  }
}
