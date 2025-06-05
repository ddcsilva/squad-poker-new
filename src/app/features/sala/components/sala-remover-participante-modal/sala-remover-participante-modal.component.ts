import { Component, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ConfirmacaoModalComponent } from '../../../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
  selector: 'app-sala-remover-participante-modal',
  standalone: true,
  imports: [CommonModule, ConfirmacaoModalComponent],
  templateUrl: './sala-remover-participante-modal.component.html',
})
export class SalaRemoverParticipanteModalComponent implements OnChanges {
  @Input() visivel: boolean = false;
  @Input() nomeParticipante?: string; // Nome do participante para personalizar mensagem

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();

  @ViewChild(ConfirmacaoModalComponent) modalConfirmacao!: ConfirmacaoModalComponent;

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  // Mensagem personalizada baseada no nome do participante
  get mensagemPersonalizada(): string {
    if (this.nomeParticipante) {
      return `Tem certeza que deseja remover "${this.nomeParticipante}" da sala? Esta ação não pode ser desfeita.`;
    }
    return 'Tem certeza que deseja remover este participante da sala? Esta ação não pode ser desfeita.';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visivel'] && this.visivel) {
      // Aguardar a renderização do modal filho e configurar foco no botão cancelar
      setTimeout(() => {
        this.configurarFocoSeguro();
        this.anunciarAcaoDestrutiva();
      }, 200);
    }
  }

  private configurarFocoSeguro(): void {
    // Foco inicial no botão "Cancelar" para maior segurança em ações destrutivas
    const modalElement = document.querySelector('[role="dialog"]');
    if (!modalElement) return;

    // Buscar especificamente o botão de cancelar pelo texto ou classe
    const botaoCancelar = Array.from(modalElement.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Cancelar')
    ) as HTMLElement;

    if (botaoCancelar) {
      botaoCancelar.focus();
    } else {
      // Fallback: primeiro botão (que deveria ser o cancelar)
      const primeiroBotao = modalElement.querySelector('button:first-of-type') as HTMLElement;
      if (primeiroBotao) {
        primeiroBotao.focus();
      }
    }
  }

  private anunciarAcaoDestrutiva(): void {
    // Anúncio específico para ação destrutiva com alta prioridade
    const mensagem = this.nomeParticipante
      ? `Atenção: Ação destrutiva. Remoção do participante ${this.nomeParticipante}. Use Tab para navegar. Botão Cancelar está selecionado por segurança.`
      : 'Atenção: Ação destrutiva. Remoção de participante. Use Tab para navegar. Botão Cancelar está selecionado por segurança.';

    // Anunciar diretamente com LiveAnnouncer
    setTimeout(() => {
      this.liveAnnouncer.announce(mensagem, 'assertive');
    }, 200);
  }

  aoConfirmar(): void {
    // Anunciar confirmação da ação destrutiva
    const mensagemConfirmacao = this.nomeParticipante
      ? `Participante ${this.nomeParticipante} removido da sala`
      : 'Participante removido da sala';

    this.liveAnnouncer.announce(mensagemConfirmacao, 'assertive');
    this.confirmar.emit();
  }

  aoCancelar(): void {
    // Anunciar cancelamento (ação segura)
    this.liveAnnouncer.announce('Remoção cancelada. Participante mantido na sala.', 'polite');
    this.cancelar.emit();
  }

  aoFechar(): void {
    this.fechar.emit();
  }
}
