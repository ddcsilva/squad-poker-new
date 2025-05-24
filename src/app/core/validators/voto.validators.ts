import { SalaValidators } from './sala.validators';

export class VotoValidators {
  static readonly VALORES_PERMITIDOS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  static readonly PONTUACAO_MIN = 0;
  static readonly PONTUACAO_MAX = 100;

  /**
   * Validação rigorosa de voto
   */
  static validarVoto(voto: any): { valido: boolean; erro?: string; valorSanitizado?: string | null } {
    // Permite null (voto não realizado)
    if (voto === null || voto === undefined) {
      return { valido: true, valorSanitizado: null };
    }

    // Deve ser string
    if (typeof voto !== 'string') {
      return { valido: false, erro: 'Voto deve ser uma string ou null' };
    }

    // Limpar espaços
    const votoLimpo = voto.trim();

    // Verificar se está na lista de valores permitidos
    if (!this.VALORES_PERMITIDOS.includes(votoLimpo)) {
      return { valido: false, erro: 'Valor de voto não permitido' };
    }

    return { valido: true, valorSanitizado: votoLimpo };
  }

  /**
   * Validação de pontuação final
   */
  static validarPontuacaoFinal(pontuacao: any): { valido: boolean; erro?: string; valorSanitizado?: string } {
    // Permite vazio
    if (!pontuacao || pontuacao === '') {
      return { valido: true, valorSanitizado: '' };
    }

    if (typeof pontuacao !== 'string') {
      return { valido: false, erro: 'Pontuação deve ser uma string' };
    }

    const pontuacaoLimpa = pontuacao.trim();

    // Se está vazia após trim, ok
    if (pontuacaoLimpa === '') {
      return { valido: true, valorSanitizado: '' };
    }

    // Verificar se é um dos valores de poker permitidos
    if (this.VALORES_PERMITIDOS.includes(pontuacaoLimpa)) {
      return { valido: true, valorSanitizado: pontuacaoLimpa };
    }

    // Verificar se é um número válido
    const numero = parseFloat(pontuacaoLimpa);
    if (isNaN(numero)) {
      return { valido: false, erro: 'Pontuação deve ser um número válido ou um valor de poker' };
    }

    if (numero < this.PONTUACAO_MIN || numero > this.PONTUACAO_MAX) {
      return {
        valido: false,
        erro: `Pontuação deve estar entre ${this.PONTUACAO_MIN} e ${this.PONTUACAO_MAX}`,
      };
    }

    // Limitar casas decimais
    const numeroFormatado = Number(numero.toFixed(2)).toString();

    return { valido: true, valorSanitizado: numeroFormatado };
  }

  /**
   * Validação de todos os dados de uma rodada
   */
  static validarDadosRodada(dados: { descricao: string; pontuacaoFinal?: string }): {
    valido: boolean;
    erros: string[];
    dadosSanitizados?: any;
  } {
    const erros: string[] = [];
    const dadosSanitizados: any = {};

    // Validar descrição
    const resultadoDescricao = SalaValidators.validarDescricao(dados.descricao);
    if (!resultadoDescricao.valido) {
      erros.push(resultadoDescricao.erro!);
    } else {
      dadosSanitizados.descricao = resultadoDescricao.valorSanitizado;
    }

    // Validar pontuação final se fornecida
    if (dados.pontuacaoFinal !== undefined) {
      const resultadoPontuacao = this.validarPontuacaoFinal(dados.pontuacaoFinal);
      if (!resultadoPontuacao.valido) {
        erros.push(resultadoPontuacao.erro!);
      } else {
        dadosSanitizados.pontuacaoFinal = resultadoPontuacao.valorSanitizado;
      }
    }

    return {
      valido: erros.length === 0,
      erros,
      dadosSanitizados: erros.length === 0 ? dadosSanitizados : undefined,
    };
  }
}
