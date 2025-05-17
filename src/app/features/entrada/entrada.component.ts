import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.component.html',
})
export class EntradaComponent {
  // Estado primário com Signals
  modo = signal<'criar' | 'entrar'>('criar');
  nomeUsuario = signal<string>('');
  tipoUsuario = signal<'participante' | 'espectador'>('participante');
  descricaoSala = signal<string>('');
  codigoSala = signal<string>('');

  // Estado computado (derivado)
  botaoCriarHabilitado = computed(() => this.nomeUsuario().trim() !== '' && this.descricaoSala().trim() !== '');

  botaoEntrarHabilitado = computed(() => this.nomeUsuario().trim() !== '' && this.codigoSala().trim() !== '');

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

  // Ações finais (stub por enquanto)
  criarSala(): void {
    if (this.botaoCriarHabilitado()) {
      console.log('Criando sala...', {
        nome: this.nomeUsuario(),
        tipo: this.tipoUsuario(),
        descricao: this.descricaoSala(),
      });
      // Aqui virá a lógica de criação com Firebase
    }
  }

  entrarEmSala(): void {
    if (this.botaoEntrarHabilitado()) {
      console.log('Entrando na sala...', {
        nome: this.nomeUsuario(),
        tipo: this.tipoUsuario(),
        codigo: this.codigoSala(),
      });
      // Aqui virá a lógica de entrada com Firebase
    }
  }
}
