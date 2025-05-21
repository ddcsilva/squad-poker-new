/**
 * Classe base para erros relacionados a salas
 */
export class SalaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalaError';
  }
}

/**
 * Erro para representar uma sala não encontrada
 */
export class SalaNaoEncontradaError extends SalaError {
  constructor(salaId?: string) {
    super(`Sala ${salaId ? `'${salaId}' ` : ''}não encontrada`);
    this.name = 'SalaNaoEncontradaError';
  }
}

/**
 * Erro para representar um jogador não encontrado na sala
 */
export class JogadorNaoEncontradoError extends SalaError {
  constructor(jogadorId?: string) {
    super(`Jogador ${jogadorId ? `'${jogadorId}' ` : ''}não encontrado na sala`);
    this.name = 'JogadorNaoEncontradoError';
  }
}

/**
 * Erro para representar uma sala encerrada
 */
export class SalaEncerradaError extends SalaError {
  constructor() {
    super('Esta sala já foi encerrada');
    this.name = 'SalaEncerradaError';
  }
}

/**
 * Erro para representar uma operação inválida
 */
export class OperacaoInvalidaError extends SalaError {
  constructor(message: string) {
    super(message);
    this.name = 'OperacaoInvalidaError';
  }
}
