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
    this.copiarCodigo.emit();
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
}
