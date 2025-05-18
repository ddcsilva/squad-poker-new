// src/app/core/services/usuario.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { USUARIO_REPOSITORY } from '../repositories/usuario-repository.token';
import { IUsuarioRepository } from '../repositories/usuario-repository.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Injeção do repositório usando o token
  private usuarioRepository = inject<IUsuarioRepository>(USUARIO_REPOSITORY);

  // Estado principal como signal (privado)
  private _usuarioAtual = signal<Usuario | null>(null);

  // Getter para acessar o valor (sem modificação externa)
  get usuarioAtual() {
    return this._usuarioAtual;
  }

  constructor() {
    this.carregarUsuario();
  }

  /**
   * Define o usuário atual e salva no repositório
   */
  definirUsuario(usuario: Usuario): void {
    try {
      // Validar dados do usuário
      if (!usuario || !usuario.id || !usuario.nome) {
        throw new Error('Dados do usuário inválidos');
      }

      // Salvar no repositório
      this.usuarioRepository.salvar(usuario);

      // Atualizar signal
      this._usuarioAtual.set(usuario);
    } catch (error) {
      console.error('Erro ao definir usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza o voto do usuário atual
   */
  atualizarVotoUsuario(voto: string | null): void {
    const usuarioAtual = this._usuarioAtual();

    if (usuarioAtual) {
      try {
        // Criar uma cópia atualizada do usuário
        const usuarioAtualizado = {
          ...usuarioAtual,
          voto,
        };

        // Salvar no repositório
        this.usuarioRepository.salvar(usuarioAtualizado);

        // Atualizar o signal
        this._usuarioAtual.set(usuarioAtualizado);
      } catch (error) {
        console.error('Erro ao atualizar voto do usuário:', error);
        // Não relançamos o erro aqui para evitar quebrar o fluxo do usuário,
        // mas registramos no console para diagnóstico
      }
    }
  }

  /**
   * Remove o usuário atual (logout)
   */
  limparUsuario(): void {
    try {
      // Remover do repositório
      this.usuarioRepository.remover();

      // Limpar o signal
      this._usuarioAtual.set(null);
    } catch (error) {
      console.error('Erro ao limpar usuário:', error);
      // Garantir que o signal seja limpo mesmo se houver erro no repositório
      this._usuarioAtual.set(null);
    }
  }

  /**
   * Verifica se há um usuário autenticado
   */
  estaAutenticado(): boolean {
    return !!this._usuarioAtual();
  }

  /**
   * Carrega usuário do repositório na inicialização
   */
  private carregarUsuario(): void {
    try {
      // Buscar do repositório
      const usuario = this.usuarioRepository.buscar();

      // Atualizar o signal se encontrou o usuário
      if (usuario) {
        this._usuarioAtual.set(usuario);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      // Em caso de erro, garantimos que o signal esteja limpo
      this._usuarioAtual.set(null);
    }
  }
}
