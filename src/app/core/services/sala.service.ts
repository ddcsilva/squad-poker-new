import { Injectable, inject, signal } from '@angular/core';
import { Sala, HistoricoRodada } from '../models/sala.model';
import { Usuario } from '../models/usuario.model';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { SALA_REPOSITORY } from '../repositories/sala-repository.token';
import { ISalaRepository } from '../repositories/sala-repository.interface';
import { VotacaoService } from './votacao.service';
import {
  JogadorNaoEncontradoError,
  SalaEncerradaError,
  SalaNaoEncontradaError,
  OperacaoInvalidaError,
} from '../errors/sala-errors';

@Injectable({
  providedIn: 'root',
})
export class SalaService {
  private salaRepository = inject<ISalaRepository>(SALA_REPOSITORY);
  private votacaoService = inject(VotacaoService);

  salaAtual = signal<Sala | null>(null);

  /**
   * Cria uma nova sala no repositório
   */
  async criarSala(nomeDono: string, descricao: string, tipoUsuario: 'participante' | 'espectador'): Promise<Sala> {
    this.validarCamposObrigatorios({ nomeDono, descricao });

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

    // 3. Salvar usando o repositório
    await this.salaRepository.salvar(novaSala);

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
    this.validarCamposObrigatorios({ codigoSala, nomeUsuario });

    // 1. Buscar a sala pelo código usando o repositório
    const sala = await this.salaRepository.buscarPorId(codigoSala);

    // 2. Verificar se a sala existe
    if (!sala) {
      throw new SalaNaoEncontradaError(codigoSala);
    }

    // 3. Verificar se a sala está ativa
    if (sala.status === 'encerrada') {
      throw new SalaEncerradaError();
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

    // 6. Salvar a sala atualizada no repositório
    await this.salaRepository.salvar(sala);

    // 7. Atualizar o signal
    this.salaAtual.set(sala);

    return sala;
  }

  /**
   * Observa mudanças em uma sala em tempo real
   */
  observarSala(id: string): Observable<Sala> {
    if (!id) {
      throw new OperacaoInvalidaError('ID da sala é obrigatório');
    }

    return this.salaRepository.observar(id).pipe(
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
    this.validarCamposObrigatorios({ salaId, jogadorId });

    // 1. Obter e validar a sala atual
    const sala = this.obterESalaValidar(salaId);

    // 2. Encontrar o jogador
    const jogador = this.encontrarJogadorOuErro(sala, jogadorId);

    // Verificar se a votação está aberta
    if (sala.votosRevelados) {
      throw new OperacaoInvalidaError('Não é possível votar enquanto os votos estão revelados');
    }

    // 3. Registrar o voto
    jogador.voto = voto;

    // 4. Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Revela os votos da rodada atual
   */
  async revelarVotos(salaId: string): Promise<void> {
    this.validarCamposObrigatorios({ salaId });

    // Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // Verificar se os votos já estão revelados
    if (sala.votosRevelados) {
      return; // Já está revelado, não faz nada
    }

    // Atualizar estado
    sala.votosRevelados = true;

    // Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Oculta os votos e reinicia a votação da rodada atual
   */
  async ocultarVotos(salaId: string): Promise<void> {
    this.validarCamposObrigatorios({ salaId });

    // Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // Verificar se os votos já estão ocultos
    if (!sala.votosRevelados) {
      return; // Já está oculto, não faz nada
    }

    // Ocultar votos
    sala.votosRevelados = false;

    // Limpar votos de todos os jogadores
    sala.jogadores.forEach(jogador => {
      jogador.voto = null;
    });

    // Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Inicia uma nova rodada de votação
   */
  async iniciarNovaRodada(salaId: string, descricaoNova: string, pontuacaoFinal: string): Promise<void> {
    this.validarCamposObrigatorios({ salaId, descricaoNova });

    // Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // Verificar se a sala está ativa
    if (sala.status === 'encerrada') {
      throw new SalaEncerradaError();
    }

    // Salvar a rodada atual no histórico (apenas se os votos estiverem revelados)
    if (sala.votosRevelados) {
      const rodadaAtual = this.criarHistoricoRodada(sala, pontuacaoFinal);
      sala.historicoRodadas.push(rodadaAtual);
    }

    // Atualizar rodada e limpar votos
    sala.rodadaAtual++;
    sala.descricaoVotacao = descricaoNova;
    sala.votosRevelados = false;

    // Limpar votos de todos os jogadores
    sala.jogadores.forEach(jogador => {
      jogador.voto = null;
    });

    // Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Encerra uma sala permanentemente
   */
  async encerrarSala(salaId: string, pontuacaoFinal?: string): Promise<void> {
    this.validarCamposObrigatorios({ salaId });

    // Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // Verificar se a sala já está encerrada
    if (sala.status === 'encerrada') {
      return; // Já está encerrada, não faz nada
    }

    // Salvar a rodada atual no histórico se os votos estiverem revelados
    if (sala.votosRevelados) {
      // Usar a pontuação passada como parâmetro OU calcular automaticamente
      const valorFinal = pontuacaoFinal || this.calcularMaisVotado(sala.jogadores);
      const rodadaAtual = this.criarHistoricoRodada(sala, valorFinal);
      sala.historicoRodadas.push(rodadaAtual);
    }

    // Encerrar a sala
    sala.status = 'encerrada';
    await this.salaRepository.salvar(sala);
  }

  /**
   * Remove um jogador da sala e salva as alterações
   */
  async removerJogador(salaId: string, jogadorId: string): Promise<void> {
    this.validarCamposObrigatorios({ salaId, jogadorId });

    // Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // Verificar se o jogador existe na sala
    if (!sala.jogadores.some(j => j.id === jogadorId)) {
      throw new JogadorNaoEncontradoError(jogadorId);
    }

    // Remover o jogador
    sala.jogadores = sala.jogadores.filter(j => j.id !== jogadorId);

    // Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Verifica se o usuário é o dono da sala
   */
  ehDonoDaSala(salaId: string, nomeUsuario: string): boolean {
    try {
      const sala = this.obterESalaValidar(salaId);
      return sala.nomeDono === nomeUsuario;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém a sala atual e valida se existe, lançando erro caso contrário
   */
  private obterESalaValidar(salaId: string): Sala {
    const sala = this.salaAtual();

    if (!sala) {
      throw new SalaNaoEncontradaError(salaId);
    }

    // Validar se é a mesma sala sendo solicitada
    if (sala.id !== salaId) {
      throw new OperacaoInvalidaError('Operação inválida: IDs de sala não correspondem');
    }

    return sala;
  }

  /**
   * Encontra um jogador em uma sala ou lança erro
   */
  private encontrarJogadorOuErro(sala: Sala, jogadorId: string): Usuario {
    const jogador = sala.jogadores.find(j => j.id === jogadorId);

    if (!jogador) {
      throw new JogadorNaoEncontradoError(jogadorId);
    }

    return jogador;
  }

  /**
   * Cria um objeto de histórico para a rodada atual
   */
  private criarHistoricoRodada(sala: Sala, pontuacaoFinal: string): HistoricoRodada {
    const rodada: HistoricoRodada = {
      numero: sala.rodadaAtual,
      descricao: sala.descricaoVotacao,
      pontuacaoFinal: pontuacaoFinal || this.calcularMaisVotado(sala.jogadores),
      votos: {},
      timestamp: new Date(),
    };

    // Capturar todos os votos da rodada atual
    sala.jogadores.forEach(jogador => {
      if (jogador.voto !== null) {
        rodada.votos[jogador.id] = {
          valor: jogador.voto,
          nome: jogador.nome,
          cor: jogador.cor,
        };
      }
    });

    return rodada;
  }

  /**
   * Calcula o valor mais votado entre os jogadores
   */
  private calcularMaisVotado(jogadores: Usuario[]): string {
    return this.votacaoService.calcularMaisVotado(jogadores).valor;
  }

  /**
   * Gera uma cor aleatória para identificar o usuário
   */
  private gerarCorAleatoria(): string {
    const cores = ['#E57373', '#64B5F6', '#81C784', '#FFD54F', '#BA68C8', '#9575CD', '#4DB6AC', '#FF8A65'];
    return cores[Math.floor(Math.random() * cores.length)];
  }

  /**
   * Valida campos obrigatórios em um objeto, lançando erro se algum estiver faltando
   */
  private validarCamposObrigatorios(campos: Record<string, any>): void {
    for (const [nome, valor] of Object.entries(campos)) {
      if (valor === undefined || valor === null || valor === '') {
        throw new OperacaoInvalidaError(`O campo '${nome}' é obrigatório`);
      }
    }
  }
}
