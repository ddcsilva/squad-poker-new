import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Serviço que centraliza os ícones SVG da aplicação e
 * realiza a sanitização HTML automaticamente.
 */
@Injectable({
  providedIn: 'root',
})
export class IconesService {
  private sanitizer = inject(DomSanitizer);

  // Cache de ícones já sanitizados
  private iconeCache = new Map<string, SafeHtml>();

  // ===== ÍCONES DE NAVEGAÇÃO =====
  get iconeVoltar(): SafeHtml {
    return this.obterIcone(
      'voltar',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>`
    );
  }

  // ===== ÍCONES DE AÇÕES =====
  get iconeRevelarVotos(): SafeHtml {
    return this.obterIcone(
      'revelarVotos',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeReiniciarVotacao(): SafeHtml {
    return this.obterIcone(
      'reiniciarVotacao',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>`
    );
  }

  get iconeNovaRodada(): SafeHtml {
    return this.obterIcone(
      'novaRodada',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeEncerrarSala(): SafeHtml {
    return this.obterIcone(
      'encerrarSala',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>`
    );
  }

  // ===== ÍCONES DE STATUS =====
  get iconeVotou(): SafeHtml {
    return this.obterIcone(
      'votou',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeAguardando(): SafeHtml {
    return this.obterIcone(
      'aguardando',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeEspectador(): SafeHtml {
    return this.obterIcone(
      'espectador',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeResultados(): SafeHtml {
    return this.obterIcone(
      'resultados',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
    </svg>`
    );
  }

  // ===== ÍCONES DIVERSOS =====
  get iconeDownload(): SafeHtml {
    return this.obterIcone(
      'download',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 mr-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>`
    );
  }

  get iconeCarregando(): SafeHtml {
    return this.obterIcone(
      'carregando',
      `<svg
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>`
    );
  }

  get iconeCoroa(): SafeHtml {
    return this.obterIcone(
      'coroa',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="h-4 w-4 text-amber-500 fill-current">
      <path d="M4 17L2 7l6 5 4-8 4 8 6-5-2 10H4zm0 2h16v2H4v-2z" />
    </svg>`
    );
  }

  get iconeSelecionado(): SafeHtml {
    return this.obterIcone(
      'selecionado',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-3 w-3 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>`
    );
  }

  get iconeFechar(): SafeHtml {
    return this.obterIcone(
      'fechar',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeExcluir(): SafeHtml {
    return this.obterIcone(
      'excluir',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd" />
    </svg>`
    );
  }

  get iconeEncerrado(): SafeHtml {
    return this.obterIcone(
      'encerrado',
      `<svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-12 w-12 text-red-400 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>`
    );
  }

  /**
   * Obtém um ícone sanitizado do cache ou sanitiza e armazena se não existir
   */
  private obterIcone(chave: string, svgCodigo: string): SafeHtml {
    if (!this.iconeCache.has(chave)) {
      const iconeSanitizado = this.sanitizer.bypassSecurityTrustHtml(svgCodigo);
      this.iconeCache.set(chave, iconeSanitizado);
    }

    return this.iconeCache.get(chave)!;
  }
}
