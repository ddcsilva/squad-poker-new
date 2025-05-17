import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

const STORAGE_KEY = 'squad_poker_usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Estado principal como signal (público, readonly)
  private _usuarioAtual = signal<Usuario | null>(null);

  // Getter para acessar o valor (sem modificação externa)
  get usuarioAtual() {
    return this._usuarioAtual;
  }

  constructor() {
    this.carregarDoStorage();
  }

  /**
   * Define o usuário atual e salva no localStorage
   */
  definirUsuario(usuario: Usuario): void {
    // Atualiza signal
    this._usuarioAtual.set(usuario);

    // Persiste no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  }

  /**
   * Atualiza o voto do usuário atual
   */
  atualizarVotoUsuario(voto: string | null): void {
    const usuarioAtual = this._usuarioAtual();

    if (usuarioAtual) {
      // Criar uma cópia atualizada do usuário
      const usuarioAtualizado = {
        ...usuarioAtual,
        voto,
      };

      // Atualizar o signal
      this._usuarioAtual.set(usuarioAtualizado);

      // Persistir no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioAtualizado));
    }
  }

  /**
   * Remove o usuário atual (logout)
   */
  limparUsuario(): void {
    this._usuarioAtual.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Carrega usuário do localStorage na inicialização (privado)
   */
  private carregarDoStorage(): void {
    try {
      const usuarioSalvo = localStorage.getItem(STORAGE_KEY);

      if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo) as Usuario;
        this._usuarioAtual.set(usuario);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do storage:', error);
      // Limpa storage se houver um erro de parsing
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
