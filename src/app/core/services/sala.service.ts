// src/app/core/services/sala.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Sala } from '../models/sala.model';
import { Usuario } from '../models/usuario.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class SalaService {
  // Injeção de dependências
  private firebaseService = inject(FirebaseService);

  // Signal para a sala atual
  salaAtual = signal<Sala | null>(null);

  /**
   * Cria uma nova sala no Firestore
   */
  async criarSala(nomeDono: string, descricao: string, tipoUsuario: 'participante' | 'espectador'): Promise<Sala> {
    // 1. Criar o objeto do usuário dono
    const usuario: Usuario = {
      id: uuidv4(),
      nome: nomeDono,
      voto: null,
      cor: this.gerarCorAleatoria(),
      tipo: tipoUsuario,
    };

    // 2. Criar o objeto da sala
    const novaSala: Sala = {
      id: uuidv4(),
      nomeDono,
      descricaoVotacao: descricao,
      jogadores: [usuario],
      status: 'aguardando',
      votosRevelados: false,
      rodadaAtual: 1,
      historicoRodadas: [],
      criadaEm: new Date(),
    };

    // 3. Salvar no Firestore
    await this.firebaseService.salvarSala(novaSala);

    // 4. Atualizar o signal
    this.salaAtual.set(novaSala);

    // 5. Retornar a sala criada
    return novaSala;
  }

  /**
   * Gera uma cor aleatória para identificar o usuário
   */
  private gerarCorAleatoria(): string {
    const cores = ['#E57373', '#64B5F6', '#81C784', '#FFD54F', '#BA68C8', '#9575CD', '#4DB6AC', '#FF8A65'];
    return cores[Math.floor(Math.random() * cores.length)];
  }
}
