/**
 * Validadores de votos
 */
export class VotoValidators {
  static readonly VALORES_PERMITIDOS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];

  /**
   * Valida se o voto é válido
   */
  static validarVoto(voto: string | null): boolean {
    if (voto === null) return true;
    return this.VALORES_PERMITIDOS.includes(voto);
  }

  /**
   * Valida pontuação final
   */
  static validarPontuacaoFinal(pontuacao: string): { valido: boolean; erro?: string } {
    if (!pontuacao || pontuacao.trim().length === 0) {
      return { valido: true };
    }

    const pontuacaoTrimmed = pontuacao.trim();

    if (this.VALORES_PERMITIDOS.includes(pontuacaoTrimmed)) {
      return { valido: true };
    }

    const numero = parseFloat(pontuacaoTrimmed);
    if (!isNaN(numero) && numero >= 0 && numero <= 100) {
      return { valido: true };
    }

    return { valido: false, erro: 'Pontuação inválida' };
  }
}
