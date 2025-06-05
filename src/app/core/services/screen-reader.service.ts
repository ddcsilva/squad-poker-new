import { Injectable } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

interface LiveRegion {
  id: string;
  element: HTMLElement;
  politeness: 'polite' | 'assertive';
  timestamp: number;
}

interface AnnouncementHistory {
  mensagem: string;
  politeness: 'polite' | 'assertive';
  timestamp: number;
  tipo: 'modal' | 'estado' | 'fechamento' | 'custom';
}

@Injectable({
  providedIn: 'root'
})
export class ScreenReaderService {
  private liveRegions: Map<string, LiveRegion> = new Map();
  private historico: AnnouncementHistory[] = [];
  private maxHistorico = 50; // Máximo de anúncios no histórico
  private debounceTimers: Map<string, any> = new Map();

  constructor(private liveAnnouncer: LiveAnnouncer) {
    this.inicializarLiveRegionsPadrao();
  }

  /**
   * Anuncia abertura de modal com título e descrição opcional
   */
  anunciarModal(titulo: string, descricao?: string): void {
    let mensagem = `Modal aberto: ${titulo}`;

    if (descricao) {
      mensagem += `. ${descricao}`;
    }

    mensagem += '. Use Tab para navegar, ESC para fechar.';

    this.anunciarComHistorico(mensagem, 'assertive', 'modal');

    // Aguardar um pouco e dar instruções adicionais
    setTimeout(() => {
      this.anunciarInstrucoesModal();
    }, 1500);
  }

  /**
   * Anuncia fechamento de modal
   */
  anunciarFechamento(): void {
    const mensagem = 'Modal fechado';
    this.anunciarComHistorico(mensagem, 'polite', 'fechamento');
  }

  /**
   * Anuncia mudanças de estado da aplicação
   */
  anunciarMudancaEstado(mensagem: string, urgente: boolean = false): void {
    const politeness = urgente ? 'assertive' : 'polite';
    this.anunciarComHistorico(mensagem, politeness, 'estado');
  }

  /**
   * Cria uma live region personalizada
   */
  criarLiveRegion(
    id: string,
    politeness: 'polite' | 'assertive' = 'polite',
    container?: HTMLElement
  ): HTMLElement {
    // Verificar se já existe
    if (this.liveRegions.has(id)) {
      console.warn(`[ScreenReader] Live region '${id}' já existe`);
      return this.liveRegions.get(id)!.element;
    }

    // Criar elemento
    const element = document.createElement('div');
    element.id = `live-region-${id}`;
    element.setAttribute('aria-live', politeness);
    element.setAttribute('aria-atomic', 'true');
    element.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    element.className = 'sr-only'; // Visualmente oculto, mas acessível
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    // Adicionar ao DOM
    const containerElement = container || document.body;
    containerElement.appendChild(element);

    // Armazenar referência
    const liveRegion: LiveRegion = {
      id,
      element,
      politeness,
      timestamp: Date.now()
    };

    this.liveRegions.set(id, liveRegion);

    console.debug(`[ScreenReader] Live region '${id}' criada com politeness '${politeness}'`);
    return element;
  }

  /**
   * Anuncia mensagem em uma live region específica
   */
  anunciarEmLiveRegion(id: string, mensagem: string): void {
    const liveRegion = this.liveRegions.get(id);

    if (!liveRegion) {
      console.warn(`[ScreenReader] Live region '${id}' não encontrada`);
      return;
    }

    // Limpar conteúdo anterior
    liveRegion.element.textContent = '';

    // Aguardar um ciclo para garantir que o screen reader detecte a mudança
    setTimeout(() => {
      liveRegion.element.textContent = mensagem;
      console.debug(`[ScreenReader] Anúncio em live region '${id}': ${mensagem}`);
    }, 10);
  }

  /**
   * Remove uma live region
   */
  removerLiveRegion(id: string): void {
    const liveRegion = this.liveRegions.get(id);

    if (liveRegion) {
      liveRegion.element.remove();
      this.liveRegions.delete(id);
      console.debug(`[ScreenReader] Live region '${id}' removida`);
    }
  }

  /**
   * Anuncia validação de formulário
   */
  anunciarValidacao(
    campo: string,
    mensagem: string,
    valido: boolean,
    debounceMs: number = 500
  ): void {
    const chaveDebounce = `validacao-${campo}`;

    // Cancelar timer anterior se existir
    if (this.debounceTimers.has(chaveDebounce)) {
      clearTimeout(this.debounceTimers.get(chaveDebounce));
    }

    // Criar novo timer
    const timer = setTimeout(() => {
      const prefixo = valido ? 'Campo válido' : 'Erro de validação';
      const mensagemCompleta = `${prefixo} em ${campo}: ${mensagem}`;

      this.anunciarComHistorico(mensagemCompleta, 'polite', 'estado');
      this.debounceTimers.delete(chaveDebounce);
    }, debounceMs);

    this.debounceTimers.set(chaveDebounce, timer);
  }

  /**
   * Anuncia progresso de operação
   */
  anunciarProgresso(
    operacao: string,
    porcentagem: number,
    detalhes?: string
  ): void {
    let mensagem = `${operacao}: ${porcentagem}% completo`;

    if (detalhes) {
      mensagem += `. ${detalhes}`;
    }

    this.anunciarEmLiveRegion('progresso', mensagem);
  }

  /**
   * Anuncia ações do usuário
   */
  anunciarAcao(
    acao: string,
    resultado: 'sucesso' | 'erro' | 'info',
    detalhes?: string
  ): void {
    const prefixos = {
      sucesso: '✓ Sucesso',
      erro: '✗ Erro',
      info: 'ℹ Informação'
    };

    let mensagem = `${prefixos[resultado]}: ${acao}`;

    if (detalhes) {
      mensagem += `. ${detalhes}`;
    }

    const politeness = resultado === 'erro' ? 'assertive' : 'polite';
    this.anunciarComHistorico(mensagem, politeness, 'estado');
  }

  /**
   * Configura região de status para votação
   */
  configurarStatusVotacao(): void {
    this.criarLiveRegion('votacao-status', 'polite');
  }

  /**
   * Anuncia mudanças na votação
   */
  anunciarMudancaVotacao(
    participantesQueVotaram: number,
    totalParticipantes: number,
    nomeParticipante?: string
  ): void {
    let mensagem = '';

    if (nomeParticipante) {
      mensagem = `${nomeParticipante} votou. `;
    }

    mensagem += `${participantesQueVotaram} de ${totalParticipantes} participantes votaram.`;

    if (participantesQueVotaram === totalParticipantes) {
      mensagem += ' Todos os participantes votaram. Votos podem ser revelados.';
    }

    this.anunciarEmLiveRegion('votacao-status', mensagem);
  }

  /**
   * Inicializa live regions padrão da aplicação
   */
  private inicializarLiveRegionsPadrao(): void {
    // Região para mensagens gerais
    this.criarLiveRegion('geral', 'polite');

    // Região para alertas importantes
    this.criarLiveRegion('alertas', 'assertive');

    // Região para progresso
    this.criarLiveRegion('progresso', 'polite');

    console.debug('[ScreenReader] Live regions padrão inicializadas');
  }

  /**
   * Anuncia instruções adicionais para modal
   */
  private anunciarInstrucoesModal(): void {
    const instrucoes = 'Use as setas ou Tab para navegar. Enter para ativar botões. ESC para fechar modal.';
    this.liveAnnouncer.announce(instrucoes, 'polite');
  }

  /**
   * Método interno para anunciar com histórico
   */
  private anunciarComHistorico(
    mensagem: string,
    politeness: 'polite' | 'assertive',
    tipo: AnnouncementHistory['tipo']
  ): void {
    // Anunciar usando LiveAnnouncer do CDK
    this.liveAnnouncer.announce(mensagem, politeness);

    // Adicionar ao histórico
    const entrada: AnnouncementHistory = {
      mensagem,
      politeness,
      timestamp: Date.now(),
      tipo
    };

    this.historico.push(entrada);

    // Manter apenas os últimos N anúncios
    if (this.historico.length > this.maxHistorico) {
      this.historico.shift();
    }

    console.debug(`[ScreenReader] Anúncio (${politeness}): ${mensagem}`);
  }

  /**
   * Limpa todas as live regions customizadas
   */
  limparLiveRegions(): void {
    this.liveRegions.forEach((region, id) => {
      if (!['geral', 'alertas', 'progresso'].includes(id)) {
        this.removerLiveRegion(id);
      }
    });
  }

  /**
   * Obtém histórico de anúncios
   */
  obterHistorico(): AnnouncementHistory[] {
    return [...this.historico];
  }

  /**
   * Obtém estatísticas de uso
   */
  obterEstatisticas(): {
    totalAnuncios: number;
    liveRegionsAtivas: number;
    ultimoAnuncio?: AnnouncementHistory;
  } {
    return {
      totalAnuncios: this.historico.length,
      liveRegionsAtivas: this.liveRegions.size,
      ultimoAnuncio: this.historico[this.historico.length - 1]
    };
  }

  /**
   * Anuncia mensagem customizada
   */
  anunciar(
    mensagem: string,
    politeness: 'polite' | 'assertive' = 'polite'
  ): void {
    this.anunciarComHistorico(mensagem, politeness, 'custom');
  }
}
