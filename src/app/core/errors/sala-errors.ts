// src/app/core/errors/sala-errors.ts
export class SalaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalaError';
  }
}

export class SalaNaoEncontradaError extends SalaError {
  constructor(salaId?: string) {
    super(`Sala ${salaId ? `'${salaId}' ` : ''}não encontrada`);
    this.name = 'SalaNaoEncontradaError';
  }
}

export class JogadorNaoEncontradoError extends SalaError {
  constructor(jogadorId?: string) {
    super(`Jogador ${jogadorId ? `'${jogadorId}' ` : ''}não encontrado na sala`);
    this.name = 'JogadorNaoEncontradoError';
  }
}

export class SalaEncerradaError extends SalaError {
  constructor() {
    super('Esta sala já foi encerrada');
    this.name = 'SalaEncerradaError';
  }
}

export class OperacaoInvalidaError extends SalaError {
  constructor(message: string) {
    super(message);
    this.name = 'OperacaoInvalidaError';
  }
}
