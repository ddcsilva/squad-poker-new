import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-jogadores-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jogadores-lista.component.html',
})
export class JogadoresListaComponent {
  @Input() jogadores: Usuario[] = [];
  @Input() nomeDono: string = '';
  @Input() permissaoRemover: boolean = false;

  @Output() removerJogador = new EventEmitter<string>();

  onRemoverJogador(jogadorId: string): void {
    // Confirmação para evitar cliques acidentais
    if (confirm('Tem certeza que deseja remover este participante?')) {
      this.removerJogador.emit(jogadorId);
    }
  }
}
