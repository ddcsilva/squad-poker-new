import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Sala } from '../models/sala.model';
import { Usuario } from '../models/usuario.model';
import { v4 as uuidv4 } from 'uuid';
import { Observable, tap } from 'rxjs';

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
   * Permite um usuário entrar em uma sala existente
   */
  async entrarEmSala(
    codigoSala: string,
    nomeUsuario: string,
    tipoUsuario: 'participante' | 'espectador'
  ): Promise<Sala> {
    // 1. Buscar a sala pelo código
    const sala = await this.firebaseService.buscarSala(codigoSala);

    // 2. Verificar se a sala existe
    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // 3. Verificar se a sala está ativa
    if (sala.status === 'encerrada') {
      throw new Error('Esta sala já foi encerrada');
    }

    // 4. Criar novo usuário
    const novoUsuario: Usuario = {
      id: uuidv4(),
      nome: nomeUsuario,
      voto: null,
      cor: this.gerarCorAleatoria(),
      tipo: tipoUsuario,
    };

    // 5. Adicionar à lista de jogadores
    sala.jogadores.push(novoUsuario);

    // 6. Salvar a sala atualizada
    await this.firebaseService.salvarSala(sala);

    // 7. Atualizar o signal
    this.salaAtual.set(sala);

    return sala;
  }

  /**
   * Observa mudanças em uma sala em tempo real
   */
  observarSala(id: string): Observable<Sala> {
    return this.firebaseService.observarSala(id).pipe(
      tap((sala: Sala) => {
        // Atualiza o signal sempre que houver mudanças
        this.salaAtual.set(sala);
      })
    );
  }

  /**
   * Registra o voto de um jogador
   */
  async registrarVoto(salaId: string, jogadorId: string, voto: string | null): Promise<void> {
    // 1. Obter a sala atual
    const sala = this.salaAtual();

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // 2. Encontrar o jogador
    const jogador = sala.jogadores.find(j => j.id === jogadorId);

    if (!jogador) {
      throw new Error('Jogador não encontrado na sala');
    }

    // 3. Registrar o voto
    jogador.voto = voto;

    // 4. Salvar no Firebase
    await this.firebaseService.salvarSala(sala);

    // 5. O signal já está atualizado, pois modificamos o mesmo objeto
  }

  async revelarVotos(salaId: string): Promise<void> {
    // 1. Obter sala atual
    const sala = this.salaAtual();

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    // 2. Atualizar estado
    sala.votosRevelados = true;

    // 3. Salvar no Firebase
    await this.firebaseService.salvarSala(sala);
  }

  async ocultarVotos(salaId: string): Promise<void> {
    const sala = this.salaAtual();

    if (!sala) {
      throw new Error('Sala não encontrada');
    }

    sala.votosRevelados = false;

    await this.firebaseService.salvarSala(sala);
  }

  /**
   * Gera uma cor aleatória para identificar o usuário
   */
  private gerarCorAleatoria(): string {
    const cores = ['#E57373', '#64B5F6', '#81C784', '#FFD54F', '#BA68C8', '#9575CD', '#4DB6AC', '#FF8A65'];
    return cores[Math.floor(Math.random() * cores.length)];
  }
}
