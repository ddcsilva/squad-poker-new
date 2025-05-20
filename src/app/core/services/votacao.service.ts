import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

/**
 * Serviço com métodos relacionados a cálculos e análises de votação.
 * Este serviço é stateless e contém apenas funções puras para manipulação de dados.
 */
@Injectable({
  providedIn: 'root',
})
export class VotacaoService {
  /**
   * Verifica se há empate nos votos mais frequentes
   * @param jogadores Lista de jogadores com seus votos
   * @returns Objeto contendo flag de empate e valores empatados
   */
  verificarEmpate(jogadores: Usuario[]): { temEmpate: boolean; valores: string[] } {
    // Filtra jogadores sem voto
    const votos = jogadores.filter(j => j.voto !== null).map(j => j.voto!);

    if (votos.length === 0) {
      return { temEmpate: false, valores: [] };
    }

    // Contagem de cada voto
    const contagem: Record<string, number> = {};
    votos.forEach(voto => {
      contagem[voto] = (contagem[voto] || 0) + 1;
    });

    // Encontra o maior número de votos
    const maiorContagem = Math.max(...Object.values(contagem));

    // Encontra todos os valores com essa contagem
    const valoresEmpatados = Object.entries(contagem)
      .filter(([_, count]) => count === maiorContagem)
      .map(([valor, _]) => valor);

    // Temos empate se mais de um valor tem a contagem máxima
    return {
      temEmpate: valoresEmpatados.length > 1,
      valores: valoresEmpatados,
    };
  }

  /**
   * Calcula o valor mais votado e estatísticas relacionadas
   * @param jogadores Lista de jogadores com seus votos
   * @returns Objeto contendo valor mais votado, contagem e total de votos
   */
  calcularMaisVotado(jogadores: Usuario[]): { valor: string; contagem: number; total: number } {
    // Filtra jogadores sem voto
    const votos = jogadores.filter(j => j.voto !== null).map(j => j.voto!);

    if (votos.length === 0) {
      return { valor: '-', contagem: 0, total: 0 };
    }

    // Conta ocorrências de cada voto
    const contagem: Record<string, number> = {};
    votos.forEach(voto => {
      contagem[voto] = (contagem[voto] || 0) + 1;
    });

    // Encontra o voto mais frequente
    let maisVotado = votos[0];
    let maiorContagem = contagem[maisVotado];

    Object.entries(contagem).forEach(([voto, count]) => {
      if (count > maiorContagem) {
        maisVotado = voto;
        maiorContagem = count;
      }
    });

    return {
      valor: maisVotado,
      contagem: maiorContagem,
      total: votos.length,
    };
  }

  /**
   * Calcula a porcentagem de jogadores que já votaram
   * @param jogadores Lista de jogadores completa
   * @returns Porcentagem de 0 a 100
   */
  calcularPorcentagemVotacao(jogadores: Usuario[]): number {
    const totalParticipantes = jogadores.filter(j => j.tipo === 'participante').length;

    if (totalParticipantes === 0) {
      return 0;
    }

    const participantesQueVotaram = jogadores.filter(j => j.tipo === 'participante' && j.voto !== null).length;

    return (participantesQueVotaram / totalParticipantes) * 100;
  }

  /**
   * Calcula a quantidade de participantes que já votaram
   * @param jogadores Lista de jogadores
   * @returns Número de participantes que votaram
   */
  contarParticipantesQueVotaram(jogadores: Usuario[]): number {
    return jogadores.filter(j => j.tipo === 'participante' && j.voto !== null).length;
  }

  /**
   * Calcula o total de participantes (excluindo espectadores)
   * @param jogadores Lista de jogadores
   * @returns Número total de participantes
   */
  contarTotalParticipantes(jogadores: Usuario[]): number {
    return jogadores.filter(j => j.tipo === 'participante').length;
  }

  /**
   * Calcula o valor mais adequado para pontuação final com base nos votos
   * @param jogadores Lista de jogadores com seus votos
   * @returns Valor sugerido para pontuação final
   */
  sugerirPontuacaoFinal(jogadores: Usuario[]): string {
    const { temEmpate } = this.verificarEmpate(jogadores);
    const { valor } = this.calcularMaisVotado(jogadores);

    // Em caso de empate ou valor especial, não fazemos sugestão automática
    if (temEmpate || valor === '?' || valor === '☕' || valor === '-') {
      return '';
    }

    return valor;
  }

  /**
   * Gera uma distribuição dos votos (histograma)
   * @param jogadores Lista de jogadores com seus votos
   * @returns Objeto com contagem de cada valor votado
   */
  gerarDistribuicaoVotos(jogadores: Usuario[]): Record<string, number> {
    const distribuicao: Record<string, number> = {};

    jogadores
      .filter(j => j.voto !== null)
      .forEach(j => {
        const voto = j.voto!;
        distribuicao[voto] = (distribuicao[voto] || 0) + 1;
      });

    return distribuicao;
  }
}
