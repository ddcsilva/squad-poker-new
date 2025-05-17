import { Usuario } from './usuario.model';

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

export interface HistoricoRodada {
  numero: number;
  descricao: string;
  votos: { [jogadorId: string]: string };
  resultado?: string;
  timestamp: Date;
}
