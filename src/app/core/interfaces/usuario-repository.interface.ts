import { Usuario } from '../models/usuario.model';

/**
 * Interface para o repositório de usuário
 */
export interface IUsuarioRepository {
  /**
   * Salva um usuário no repositório
   * @param usuario Usuário a ser salvo
   */
  salvar(usuario: Usuario): void;

  /**
   * Busca o usuário armazenado
   * @returns Usuário encontrado ou null se não existir
   */
  buscar(): Usuario | null;

  /**
   * Remove o usuário do repositório
   */
  remover(): void;
}
