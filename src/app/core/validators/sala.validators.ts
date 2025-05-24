/**
 * Validadores de salas
 */
export class SalaValidators {
  static readonly NOME_MIN_LENGTH = 2;
  static readonly NOME_MAX_LENGTH = 50;
  static readonly DESCRICAO_MIN_LENGTH = 3;
  static readonly DESCRICAO_MAX_LENGTH = 200;
  static readonly CODIGO_SALA_PATTERN = /^[a-zA-Z0-9-]+$/;

  /**
   * Valida o nome do usuário
   */
  static validarNome(nome: string): { valido: boolean; erro?: string } {
    if (!nome || nome.trim().length === 0) {
      return { valido: false, erro: 'Nome é obrigatório' };
    }

    const nomeTrimmed = nome.trim();

    if (nomeTrimmed.length < this.NOME_MIN_LENGTH) {
      return { valido: false, erro: `Nome deve ter no mínimo ${this.NOME_MIN_LENGTH} caracteres` };
    }

    if (nomeTrimmed.length > this.NOME_MAX_LENGTH) {
      return { valido: false, erro: `Nome deve ter no máximo ${this.NOME_MAX_LENGTH} caracteres` };
    }

    // Verificar se contém apenas caracteres válidos
    const regex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!regex.test(nomeTrimmed)) {
      return { valido: false, erro: 'Nome contém caracteres inválidos' };
    }

    return { valido: true };
  }

  /**
   * Valida a descrição da sala
   */
  static validarDescricao(descricao: string): { valido: boolean; erro?: string } {
    if (!descricao || descricao.trim().length === 0) {
      return { valido: false, erro: 'Descrição é obrigatória' };
    }

    const descricaoTrimmed = descricao.trim();

    if (descricaoTrimmed.length < this.DESCRICAO_MIN_LENGTH) {
      return { valido: false, erro: `Descrição deve ter no mínimo ${this.DESCRICAO_MIN_LENGTH} caracteres` };
    }

    if (descricaoTrimmed.length > this.DESCRICAO_MAX_LENGTH) {
      return { valido: false, erro: `Descrição deve ter no máximo ${this.DESCRICAO_MAX_LENGTH} caracteres` };
    }

    return { valido: true };
  }

  /**
   * Valida o código da sala
   */
  static validarCodigoSala(codigo: string): { valido: boolean; erro?: string } {
    if (!codigo || codigo.trim().length === 0) {
      return { valido: false, erro: 'Código da sala é obrigatório' };
    }

    if (!this.CODIGO_SALA_PATTERN.test(codigo)) {
      return { valido: false, erro: 'Código da sala inválido' };
    }

    return { valido: true };
  }

  /**
   * Sanitiza entrada de texto para prevenir XSS
   */
  static sanitizarTexto(texto: string): string {
    if (!texto) return '';

    // Remove tags HTML e scripts
    return texto
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}
