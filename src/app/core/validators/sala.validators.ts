/**
 * Validadores de salas
 */
export class SalaValidators {
  static readonly NOME_MIN_LENGTH = 2;
  static readonly NOME_MAX_LENGTH = 50;
  static readonly DESCRICAO_MIN_LENGTH = 3;
  static readonly DESCRICAO_MAX_LENGTH = 200;
  static readonly CODIGO_SALA_MIN_LENGTH = 8;
  static readonly CODIGO_SALA_MAX_LENGTH = 36;
  static readonly CODIGO_SALA_PATTERN = /^[a-zA-Z0-9-]{8,36}$/;

  // Lista de palavras/padrões suspeitos
  static readonly SUSPICIOUS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  /**
   * Validação completa de nome com sanitização
   */
  static validarNome(nome: string): { valido: boolean; erro?: string; valorSanitizado?: string } {
    if (!nome || typeof nome !== 'string') {
      return { valido: false, erro: 'Nome é obrigatório e deve ser uma string' };
    }

    const nomeSanitizado = this.sanitizarTexto(nome);

    if (nomeSanitizado.length === 0) {
      return { valido: false, erro: 'Nome não pode estar vazio após sanitização' };
    }

    if (nomeSanitizado.length < this.NOME_MIN_LENGTH) {
      return { valido: false, erro: `Nome deve ter no mínimo ${this.NOME_MIN_LENGTH} caracteres` };
    }

    if (nomeSanitizado.length > this.NOME_MAX_LENGTH) {
      return { valido: false, erro: `Nome deve ter no máximo ${this.NOME_MAX_LENGTH} caracteres` };
    }

    // Regex mais restritiva - apenas letras, números, espaços, hífen e apóstrofe
    const regex = /^[a-zA-Z0-9À-ÿ\s\-']+$/;
    if (!regex.test(nomeSanitizado)) {
      return { valido: false, erro: 'Nome contém caracteres não permitidos' };
    }

    // Verificação contra padrões suspeitos
    if (this.contemPadroesSuspeitos(nomeSanitizado)) {
      return { valido: false, erro: 'Nome contém conteúdo potencialmente malicioso' };
    }

    return { valido: true, valorSanitizado: nomeSanitizado };
  }

  /**
   * Validação completa de descrição
   */
  static validarDescricao(descricao: string): { valido: boolean; erro?: string; valorSanitizado?: string } {
    if (!descricao || typeof descricao !== 'string') {
      return { valido: false, erro: 'Descrição é obrigatória e deve ser uma string' };
    }

    const descricaoSanitizada = this.sanitizarTexto(descricao);

    if (descricaoSanitizada.length === 0) {
      return { valido: false, erro: 'Descrição não pode estar vazia após sanitização' };
    }

    if (descricaoSanitizada.length < this.DESCRICAO_MIN_LENGTH) {
      return { valido: false, erro: `Descrição deve ter no mínimo ${this.DESCRICAO_MIN_LENGTH} caracteres` };
    }

    if (descricaoSanitizada.length > this.DESCRICAO_MAX_LENGTH) {
      return { valido: false, erro: `Descrição deve ter no máximo ${this.DESCRICAO_MAX_LENGTH} caracteres` };
    }

    if (this.contemPadroesSuspeitos(descricaoSanitizada)) {
      return { valido: false, erro: 'Descrição contém conteúdo potencialmente malicioso' };
    }

    return { valido: true, valorSanitizado: descricaoSanitizada };
  }

  /**
   * Validação de código de sala
   */
  static validarCodigoSala(codigo: string): { valido: boolean; erro?: string; valorSanitizado?: string } {
    if (!codigo || typeof codigo !== 'string') {
      return { valido: false, erro: 'Código da sala é obrigatório' };
    }

    const codigoLimpo = codigo.trim();

    if (codigoLimpo.length < this.CODIGO_SALA_MIN_LENGTH || codigoLimpo.length > this.CODIGO_SALA_MAX_LENGTH) {
      return {
        valido: false,
        erro: `Código deve ter entre ${this.CODIGO_SALA_MIN_LENGTH} e ${this.CODIGO_SALA_MAX_LENGTH} caracteres`,
      };
    }

    if (!this.CODIGO_SALA_PATTERN.test(codigoLimpo)) {
      return { valido: false, erro: 'Código da sala contém caracteres inválidos (apenas letras, números e hífen)' };
    }

    return { valido: true, valorSanitizado: codigoLimpo };
  }

  /**
   * Sanitização robusta de texto
   */
  static sanitizarTexto(texto: string): string {
    if (!texto || typeof texto !== 'string') return '';

    let textoLimpo = texto;

    // Remove scripts e outros elementos perigosos
    textoLimpo = textoLimpo
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '');

    // Remove atributos de eventos HTML
    textoLimpo = textoLimpo.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove todas as tags HTML restantes
    textoLimpo = textoLimpo.replace(/<[^>]+>/g, '');

    // Remove protocolos perigosos
    textoLimpo = textoLimpo
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, '');

    // Remove caracteres de controle exceto tab, nova linha e carriage return
    textoLimpo = textoLimpo.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return textoLimpo.trim();
  }

  /**
   * Verifica se o texto contém padrões suspeitos
   */
  private static contemPadroesSuspeitos(texto: string): boolean {
    return this.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(texto));
  }

  /**
   * Validação de entrada completa para criação de sala
   */
  static validarEntradaCriarSala(dados: { nome: string; descricao: string; tipo: string }): {
    valido: boolean;
    erros: string[];
    dadosSanitizados?: any;
  } {
    const erros: string[] = [];
    const dadosSanitizados: any = {};

    // Validar nome
    const resultadoNome = this.validarNome(dados.nome);
    if (!resultadoNome.valido) {
      erros.push(resultadoNome.erro!);
    } else {
      dadosSanitizados.nome = resultadoNome.valorSanitizado;
    }

    // Validar descrição
    const resultadoDescricao = this.validarDescricao(dados.descricao);
    if (!resultadoDescricao.valido) {
      erros.push(resultadoDescricao.erro!);
    } else {
      dadosSanitizados.descricao = resultadoDescricao.valorSanitizado;
    }

    // Validar tipo
    if (!['participante', 'espectador'].includes(dados.tipo)) {
      erros.push('Tipo de usuário inválido');
    } else {
      dadosSanitizados.tipo = dados.tipo;
    }

    return {
      valido: erros.length === 0,
      erros,
      dadosSanitizados: erros.length === 0 ? dadosSanitizados : undefined,
    };
  }

  /**
   * Validação de entrada para entrar em sala
   */
  static validarEntradaEntrarSala(dados: { nome: string; codigo: string; tipo: string }): {
    valido: boolean;
    erros: string[];
    dadosSanitizados?: any;
  } {
    const erros: string[] = [];
    const dadosSanitizados: any = {};

    // Validar nome
    const resultadoNome = this.validarNome(dados.nome);
    if (!resultadoNome.valido) {
      erros.push(resultadoNome.erro!);
    } else {
      dadosSanitizados.nome = resultadoNome.valorSanitizado;
    }

    // Validar código
    const resultadoCodigo = this.validarCodigoSala(dados.codigo);
    if (!resultadoCodigo.valido) {
      erros.push(resultadoCodigo.erro!);
    } else {
      dadosSanitizados.codigo = resultadoCodigo.valorSanitizado;
    }

    // Validar tipo
    if (!['participante', 'espectador'].includes(dados.tipo)) {
      erros.push('Tipo de usuário inválido');
    } else {
      dadosSanitizados.tipo = dados.tipo;
    }

    return {
      valido: erros.length === 0,
      erros,
      dadosSanitizados: erros.length === 0 ? dadosSanitizados : undefined,
    };
  }
}
