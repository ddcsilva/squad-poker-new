// src/app/core/repositories/local-storage-usuario.repository.ts
import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { IUsuarioRepository } from './usuario-repository.interface';

/**
 * Implementação do repositório de usuário usando localStorage
 */
@Injectable()
export class LocalStorageUsuarioRepository implements IUsuarioRepository {
  private readonly STORAGE_KEY = 'squad_poker_usuario';

  /**
   * Salva um usuário no localStorage
   */
  salvar(usuario: Usuario): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    } catch (error) {
      console.error('Erro ao salvar usuário no localStorage:', error);
      throw new Error('Não foi possível salvar os dados do usuário');
    }
  }

  /**
   * Busca um usuário do localStorage
   */
  buscar(): Usuario | null {
    try {
      const usuarioJson = localStorage.getItem(this.STORAGE_KEY);

      if (!usuarioJson) {
        return null;
      }

      return JSON.parse(usuarioJson) as Usuario;
    } catch (error) {
      console.error('Erro ao buscar usuário do localStorage:', error);
      // Em caso de erro de parsing, remover o item do localStorage
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Remove o usuário do localStorage
   */
  remover(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao remover usuário do localStorage:', error);
      throw new Error('Não foi possível remover os dados do usuário');
    }
  }
}
