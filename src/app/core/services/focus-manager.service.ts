import { Injectable } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

interface FocusState {
  elemento: HTMLElement;
  modalId: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class FocusManagerService {
  private focusStack: FocusState[] = [];
  private seletoresFocaveis = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    'details > summary:first-of-type',
    'details[open]',
  ].join(', ');

  constructor(private focusMonitor: FocusMonitor) {}

  /**
   * Salva o elemento atualmente focado antes de abrir um modal
   */
  salvarFocoAnterior(modalId: string = 'default'): void {
    const elementoAtivo = document.activeElement as HTMLElement;

    if (elementoAtivo && elementoAtivo !== document.body) {
      const focusState: FocusState = {
        elemento: elementoAtivo,
        modalId,
        timestamp: Date.now(),
      };

      // Adicionar ao stack (último a entrar, primeiro a sair)
      this.focusStack.push(focusState);

      console.debug(`[FocusManager] Foco salvo para modal '${modalId}'`, elementoAtivo);
    }
  }

  /**
   * Restaura o foco ao elemento anterior quando o modal fecha
   */
  restaurarFocoAnterior(modalId: string = 'default'): void {
    // Encontrar o último estado de foco para este modal
    const indice = this.focusStack.findIndex(state => state.modalId === modalId);

    if (indice === -1) {
      console.warn(`[FocusManager] Nenhum estado de foco encontrado para modal '${modalId}'`);
      return;
    }

    const focusState = this.focusStack[indice];

    // Remover do stack
    this.focusStack.splice(indice, 1);

    // Verificar se o elemento ainda existe e é focável
    if (this.ehElementoFocavel(focusState.elemento) && this.elementoExisteNoDom(focusState.elemento)) {
      this.focusMonitor.focusVia(focusState.elemento, 'program');
      console.debug(`[FocusManager] Foco restaurado para modal '${modalId}'`, focusState.elemento);
    } else {
      console.warn(`[FocusManager] Elemento não é mais focável ou não existe no DOM`, focusState.elemento);
      this.focarElementoAlternativo();
    }
  }

  /**
   * Encontra o primeiro elemento focável dentro de um container
   */
  encontrarPrimeiroFocavel(container: HTMLElement): HTMLElement | null {
    if (!container) {
      return null;
    }

    const elementosFocaveis = container.querySelectorAll(this.seletoresFocaveis) as NodeListOf<HTMLElement>;

    for (const elemento of Array.from(elementosFocaveis)) {
      if (this.ehElementoFocavel(elemento) && this.ehElementoVisivel(elemento)) {
        return elemento;
      }
    }

    return null;
  }

  /**
   * Foca no primeiro elemento focável do container
   */
  focarPrimeiro(container: HTMLElement): boolean {
    const primeiroElemento = this.encontrarPrimeiroFocavel(container);

    if (primeiroElemento) {
      this.focusMonitor.focusVia(primeiroElemento, 'program');
      console.debug('[FocusManager] Foco definido no primeiro elemento', primeiroElemento);
      return true;
    }

    console.warn('[FocusManager] Nenhum elemento focável encontrado no container', container);
    return false;
  }

  /**
   * Verifica se um elemento é focável
   */
  ehElementoFocavel(elemento: HTMLElement): boolean {
    if (!elemento || elemento.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    // Verificar se está desabilitado
    if (elemento.hasAttribute('disabled')) {
      return false;
    }

    // Verificar tabindex
    const tabindex = elemento.getAttribute('tabindex');
    if (tabindex === '-1') {
      return false;
    }

    // Verificar se corresponde aos seletores focáveis
    try {
      return elemento.matches(this.seletoresFocaveis);
    } catch (error) {
      console.warn('[FocusManager] Erro ao verificar seletores focáveis', error);
      return false;
    }
  }

  /**
   * Verifica se o elemento ainda existe no DOM
   */
  elementoExisteNoDom(elemento: HTMLElement): boolean {
    return elemento && document.contains(elemento);
  }

  /**
   * Verifica se um elemento está visível
   */
  private ehElementoVisivel(elemento: HTMLElement): boolean {
    if (!elemento) {
      return false;
    }

    const style = window.getComputedStyle(elemento);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      elemento.offsetWidth > 0 &&
      elemento.offsetHeight > 0
    );
  }

  /**
   * Foca em um elemento alternativo quando a restauração falha
   */
  private focarElementoAlternativo(): void {
    // Tentar focar no body como último recurso
    const body = document.body;
    if (body) {
      body.focus();
      console.debug('[FocusManager] Foco definido no body como alternativa');
    }
  }

  /**
   * Encontra todos os elementos focáveis dentro de um container
   */
  encontrarTodosFocaveis(container: HTMLElement): HTMLElement[] {
    if (!container) {
      return [];
    }

    const elementosFocaveis = container.querySelectorAll(this.seletoresFocaveis) as NodeListOf<HTMLElement>;

    return Array.from(elementosFocaveis).filter(
      elemento => this.ehElementoFocavel(elemento) && this.ehElementoVisivel(elemento)
    );
  }

  /**
   * Encontra o último elemento focável dentro de um container
   */
  encontrarUltimoFocavel(container: HTMLElement): HTMLElement | null {
    const todosFocaveis = this.encontrarTodosFocaveis(container);
    return todosFocaveis.length > 0 ? todosFocaveis[todosFocaveis.length - 1] : null;
  }

  /**
   * Limpa o stack de foco (útil para reset ou emergência)
   */
  limparStackFoco(): void {
    this.focusStack = [];
    console.debug('[FocusManager] Stack de foco limpo');
  }

  /**
   * Retorna informações sobre o estado atual do stack
   */
  obterEstadoStack(): { total: number; modais: string[] } {
    return {
      total: this.focusStack.length,
      modais: this.focusStack.map(state => state.modalId),
    };
  }

  /**
   * Foca em um elemento específico usando seletor CSS
   */
  focarElementoPorSeletor(seletor: string, container: HTMLElement = document.body): boolean {
    try {
      const elemento = container.querySelector(seletor) as HTMLElement;

      if (elemento && this.ehElementoFocavel(elemento)) {
        this.focusMonitor.focusVia(elemento, 'program');
        console.debug(`[FocusManager] Foco definido via seletor '${seletor}'`, elemento);
        return true;
      }

      console.warn(`[FocusManager] Elemento não encontrado ou não focável para seletor '${seletor}'`);
      return false;
    } catch (error) {
      console.error(`[FocusManager] Erro ao focar elemento por seletor '${seletor}'`, error);
      return false;
    }
  }

  /**
   * Verifica se há modais ativos no stack
   */
  temModaisAtivos(): boolean {
    return this.focusStack.length > 0;
  }

  /**
   * Remove um modal específico do stack (útil se modal for fechado de forma inesperada)
   */
  removerModalDoStack(modalId: string): boolean {
    const indiceInicial = this.focusStack.length;
    this.focusStack = this.focusStack.filter(state => state.modalId !== modalId);

    const removido = this.focusStack.length < indiceInicial;
    if (removido) {
      console.debug(`[FocusManager] Modal '${modalId}' removido do stack`);
    }

    return removido;
  }
}
