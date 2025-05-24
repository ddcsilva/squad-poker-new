import { Injectable, inject, signal } from '@angular/core';
import { Sala, HistoricoRodada } from '../models/sala.model';
import { Usuario } from '../models/usuario.model';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { SALA_REPOSITORY } from '../repositories/sala-repository.token';
import { ISalaRepository } from '../interfaces/sala-repository.interface';
import { VotacaoService } from './votacao.service';
import { SalaValidators } from '../validators/sala.validators';
import { VotoValidators } from '../validators/voto.validators';
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
    const resultadoValidacao = SalaValidators.validarEntradaCriarSala({
      nome: nomeDono,
      descricao: descricao,
      tipo: tipoUsuario,
    });

    if (!resultadoValidacao.valido) {
      throw new OperacaoInvalidaError(`Dados inválidos: ${resultadoValidacao.erros.join(', ')}`);
    }

    const dadosSegura = resultadoValidacao.dadosSanitizados!;

    // 1. Criar o objeto do usuário dono
    const usuario: Usuario = {
      id: uuidv4(),
      nome: dadosSegura.nome,
      voto: null,
      cor: this.gerarCorAleatoria(),
      tipo: dadosSegura.tipo as 'participante' | 'espectador',
    };

    // 2. Criar o objeto da sala
    const novaSala: Sala = {
      id: uuidv4(),
      nomeDono: dadosSegura.nome,
      descricaoVotacao: dadosSegura.descricao,
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
    const resultadoValidacao = SalaValidators.validarEntradaEntrarSala({
      nome: nomeUsuario,
      codigo: codigoSala,
      tipo: tipoUsuario,
    });

    if (!resultadoValidacao.valido) {
      throw new OperacaoInvalidaError(`Dados inválidos: ${resultadoValidacao.erros.join(', ')}`);
    }

    const dadosSeguros = resultadoValidacao.dadosSanitizados!;

    // 1. Buscar a sala pelo código usando o repositório
    const sala = await this.salaRepository.buscarPorId(dadosSeguros.codigo);

    // 2. Verificar se a sala existe
    if (!sala) {
      throw new SalaNaoEncontradaError(dadosSeguros.codigo);
    }

    // 3. Verificar se a sala está ativa
    if (sala.status === 'encerrada') {
      throw new SalaEncerradaError();
    }

    // 4. Criar novo usuário
    const novoUsuario: Usuario = {
      id: uuidv4(),
      nome: dadosSeguros.nome,
      voto: null,
      cor: this.gerarCorAleatoria(),
      tipo: dadosSeguros.tipo as 'participante' | 'espectador',
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
    // 1. Validar o voto
    const resultadoValidacao = VotoValidators.validarVoto(voto);

    // 2. Validar os IDs
    if (!resultadoValidacao.valido) {
      throw new OperacaoInvalidaError(`Voto inválido: ${resultadoValidacao.erro}`);
    }

    if (!salaId || typeof salaId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(salaId)) {
      throw new OperacaoInvalidaError('ID da sala inválido');
    }

    if (!jogadorId || typeof jogadorId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(jogadorId)) {
      throw new OperacaoInvalidaError('ID do jogador inválido');
    }

    // 3. Obter e validar a sala atual
    const sala = this.obterESalaValidar(salaId);

    // 4. Encontrar o jogador
    const jogador = this.encontrarJogadorOuErro(sala, jogadorId);

    // 5. Verificar se a votação está aberta
    if (sala.votosRevelados) {
      throw new OperacaoInvalidaError('Não é possível votar enquanto os votos estão revelados');
    }

    // 6. Registrar o voto sanitizado
    jogador.voto = resultadoValidacao.valorSanitizado!;

    // 7. Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Revela os votos da rodada atual
   */
  async revelarVotos(salaId: string): Promise<void> {
    // 1. Validar campos obrigatórios
    this.validarCamposObrigatorios({ salaId });

    // 2. Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // 3. Verificar se os votos já estão revelados
    if (sala.votosRevelados) {
      return;
    }

    // 4. Atualizar estado
    sala.votosRevelados = true;

    // 5. Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Oculta os votos e reinicia a votação da rodada atual
   */
  async ocultarVotos(salaId: string): Promise<void> {
    // 1. Validar campos obrigatórios
    this.validarCamposObrigatorios({ salaId });

    // 2. Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // 3. Verificar se os votos já estão ocultos
    if (!sala.votosRevelados) {
      return;
    }

    // 4. Ocultar votos
    sala.votosRevelados = false;

    // 5. Limpar votos de todos os jogadores
    sala.jogadores.forEach(jogador => {
      jogador.voto = null;
    });

    // 6. Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Inicia uma nova rodada de votação
   */
  async iniciarNovaRodada(salaId: string, descricaoNova: string, pontuacaoFinal: string): Promise<void> {
    // 1. Validar os dados da rodada
    const resultadoValidacao = VotoValidators.validarDadosRodada({
      descricao: descricaoNova,
      pontuacaoFinal: pontuacaoFinal,
    });

    // 2. Validar o ID da sala
    if (!resultadoValidacao.valido) {
      throw new OperacaoInvalidaError(`Dados da rodada inválidos: ${resultadoValidacao.erros.join(', ')}`);
    }

    // 3. Validar o ID da sala
    if (!salaId || typeof salaId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(salaId)) {
      throw new OperacaoInvalidaError('ID da sala inválido');
    }

    const dadosSegura = resultadoValidacao.dadosSanitizados!;

    // 4. Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // 5. Verificar se a sala está ativa
    if (sala.status === 'encerrada') {
      throw new SalaEncerradaError();
    }

    // 6. Salvar a rodada atual no histórico (apenas se os votos estiverem revelados)
    if (sala.votosRevelados) {
      const rodadaAtual = this.criarHistoricoRodada(sala, dadosSegura.pontuacaoFinal || ''); // 🔄 Era: pontuacaoFinal
      sala.historicoRodadas.push(rodadaAtual);
    }

    // 7. Atualizar rodada e limpar votos
    sala.rodadaAtual++;
    sala.descricaoVotacao = dadosSegura.descricao; // 🔄 Era: descricaoNova
    sala.votosRevelados = false;

    // 8. Limpar votos de todos os jogadores
    sala.jogadores.forEach(jogador => {
      jogador.voto = null;
    });

    // 9. Salvar no repositório
    await this.salaRepository.salvar(sala);
  }

  /**
   * Encerra uma sala permanentemente
   */
  async encerrarSala(salaId: string, pontuacaoFinal?: string): Promise<void> {
    // 1. Validar o ID da sala
    if (!salaId || typeof salaId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(salaId)) {
      throw new OperacaoInvalidaError('ID da sala inválido');
    }

    // 2. Validar a pontuação final
    if (pontuacaoFinal !== undefined) {
      const resultadoValidacao = VotoValidators.validarPontuacaoFinal(pontuacaoFinal);
      if (!resultadoValidacao.valido) {
        throw new OperacaoInvalidaError(`Pontuação final inválida: ${resultadoValidacao.erro}`);
      }
      pontuacaoFinal = resultadoValidacao.valorSanitizado;
    }

    // 3. Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // 4. Verificar se a sala já está encerrada
    if (sala.status === 'encerrada') {
      return; // Já está encerrada, não faz nada
    }

    // 5. Salvar a rodada atual no histórico se os votos estiverem revelados
    if (sala.votosRevelados) {
      const valorFinal = pontuacaoFinal || this.calcularMaisVotado(sala.jogadores);
      const rodadaAtual = this.criarHistoricoRodada(sala, valorFinal);
      sala.historicoRodadas.push(rodadaAtual);
    }

    // 6. Encerrar a sala
    sala.status = 'encerrada';
    await this.salaRepository.salvar(sala);
  }

  /**
   * Remove um jogador da sala e salva as alterações
   */
  async removerJogador(salaId: string, jogadorId: string): Promise<void> {
    // 1. Validar os IDs
    if (!salaId || typeof salaId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(salaId)) {
      throw new OperacaoInvalidaError('ID da sala inválido');
    }

    if (!jogadorId || typeof jogadorId !== 'string' || !/^[a-zA-Z0-9-]+$/.test(jogadorId)) {
      throw new OperacaoInvalidaError('ID do jogador inválido');
    }

    // 2. Obter e validar a sala
    const sala = this.obterESalaValidar(salaId);

    // 3. Verificar se o jogador existe na sala
    if (!sala.jogadores.some(j => j.id === jogadorId)) {
      throw new JogadorNaoEncontradoError(jogadorId);
    }

    // 4. Remover o jogador
    sala.jogadores = sala.jogadores.filter(j => j.id !== jogadorId);

    // 5. Salvar no repositório
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
