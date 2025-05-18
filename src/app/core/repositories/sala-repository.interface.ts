import { Observable } from 'rxjs';
import { Sala } from '../models/sala.model';

/**
 * Interface para o repositório de salas
 */
export interface ISalaRepository {
  /**
   * Salva uma sala no repositório
   * @param sala Sala a ser salva
   */
  salvar(sala: Sala): Promise<void>;

  /**
   * Busca uma sala pelo ID
   * @param id ID da sala
   * @returns Sala encontrada ou null se não existir
   */
  buscarPorId(id: string): Promise<Sala | null>;

  /**
   * Observable que emite atualizações da sala em tempo real
   * @param id ID da sala a ser observada
   * @returns Observable da sala
   */
  observar(id: string): Observable<Sala>;
}
