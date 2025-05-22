import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { ConfirmacaoModalComponent } from '../../../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
  selector: 'app-cabecalho-sala',
  standalone: true,
  imports: [CommonModule, ConfirmacaoModalComponent],
  templateUrl: './cabecalho-sala.component.html',
})
export class CabecalhoSalaComponent {
  @Input() codigoSala: string = '';
  @Input() usuario: Usuario | null = null;
  @Input() status: 'aguardando' | 'encerrada' = 'aguardando';
  @Input() descricaoVotacao: string = '';
  @Input() copiado: boolean = false;
  @Input() ehDono: boolean = false;

  @Output() copiarCodigo = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();

  // Estado do modal
  modalSairVisivel = false;

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  aoCopiarCodigo(): void {
    navigator.clipboard
      .writeText(this.codigoSala)
      .then(() => {
        this.vibrarDispositivo(100);
        this.copiarCodigo.emit();
      })
      .catch(error => {
        this.vibrarDispositivo(200);
        console.error('Erro ao copiar código:', error);
        this.mostrarCodigoParaCopia();
      });
  }

  // Método para abrir o modal quando o botão "Sair" é clicado
  abrirModalSair(): void {
    this.modalSairVisivel = true;
  }

  // Método para fechar o modal sem ação
  fecharModalSair(): void {
    this.modalSairVisivel = false;
  }

  // Método chamado quando a saída é confirmada no modal
  confirmarSair(): void {
    this.modalSairVisivel = false;
    this.sair.emit();
  }

  // Mensagem contextual para o modal
  obterMensagemSair(): string {
    if (this.ehDono) {
      return 'Você é o dono desta sala. Sair irá ENCERRAR a sala para todos os participantes. Deseja continuar?';
    }
    return 'Tem certeza que deseja sair desta sala? Você será removido da lista de participantes.';
  }

  // Tipo de botão para o modal
  obterTipoBotaoSair(): 'primario' | 'perigo' | 'sucesso' {
    return this.ehDono ? 'perigo' : 'primario';
  }

  private vibrarDispositivo(duracao: number): void {
    if (
      'vibrate' in navigator &&
      navigator.vibrate &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      try {
        navigator.vibrate(duracao);
      } catch (error) {
        // Fail silently
      }
    }
  }

  private mostrarCodigoParaCopia(): void {
    const textoTemp = document.createElement('textarea');
    textoTemp.value = `Squad Poker - Código da Sala: ${this.codigoSala}`;
    document.body.appendChild(textoTemp);
    textoTemp.select();
    document.body.removeChild(textoTemp);
    alert(`📋 Código da sala: ${this.codigoSala}`);
  }
}
