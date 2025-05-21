import { Usuario } from './usuario.model';

/**
 * Interface para representar uma sala de votação
 */
export interface Sala {
  id: string;
  nomeDono: string;
  descricaoVotacao: string;
  jogadores: Usuario[];
  status: 'aguardando' | 'encerrada';
  votosRevelados: boolean;
  rodadaAtual: number;
  historicoRodadas: HistoricoRodada[];
  criadaEm: Date;
}

/**
 * Interface para representar uma rodada de votação
 */
export interface HistoricoRodada {
  numero: number;
  descricao: string;
  pontuacaoFinal: string;
  votos: {
    [jogadorId: string]: {
      valor: string;
      nome: string;
      cor: string;
    };
  };
  timestamp: Date;
}
