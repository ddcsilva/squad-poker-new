import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  selector: 'app-status-conexao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-conexao.component.html',
})
export class StatusConexaoComponent implements OnInit, OnDestroy {
  estaOnline = signal(navigator.onLine);
  exibirBannerReconectado = signal(false);

  private readonly TEMPO_EXIBICAO_RECONEXAO = 3000;

  ngOnInit(): void {
    this.adicionarListenersConexao();
  }

  ngOnDestroy(): void {
    this.removerListenersConexao();
  }

  /**
   * Handler para quando volta a conexão
   */
  private aoVoltarOnline = () => {
    this.estaOnline.set(true);
    this.mostrarFeedbackReconexao();
  };

  /**
   * Handler para quando perde a conexão
   */
  private aoFicarOffline = () => {
    this.estaOnline.set(false);
    this.ocultarFeedbackReconexao();
  };

  /**
   * Adiciona listeners para detectar mudanças de conectividade
   */
  private adicionarListenersConexao(): void {
    window.addEventListener('online', this.aoVoltarOnline);
    window.addEventListener('offline', this.aoFicarOffline);
  }

  /**
   * Remove listeners de conectividade para evitar memory leaks
   */
  private removerListenersConexao(): void {
    window.removeEventListener('online', this.aoVoltarOnline);
    window.removeEventListener('offline', this.aoFicarOffline);
  }

  /**
   * Exibe banner de reconexão por tempo determinado
   */
  private mostrarFeedbackReconexao(): void {
    this.exibirBannerReconectado.set(true);

    setTimeout(() => {
      this.exibirBannerReconectado.set(false);
    }, this.TEMPO_EXIBICAO_RECONEXAO);
  }

  /**
   * Oculta banner de reconexão (usado quando fica offline)
   */
  private ocultarFeedbackReconexao(): void {
    this.exibirBannerReconectado.set(false);
  }
}
