import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconesService } from '../../../../core/services/icones.service';

@Component({
  selector: 'app-jogadores-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jogadores-lista.component.html',
  animations: [
    trigger('jogadorAnimacao', [
      transition(':enter', [
        style({ opacity: '0', transform: 'translateY(8px)' }),
        animate('200ms ease-out', style({ opacity: '1', transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: '0', transform: 'translateY(8px)' }))]),
    ]),
  ],
})
export class JogadoresListaComponent {
  private iconesService = inject(IconesService);

  @Input() jogadores: Usuario[] = [];
  @Input() nomeDono: string = '';
  @Input() permissaoRemover: boolean = false;

  @Output() removerJogador = new EventEmitter<string>();

  get iconeCoroa(): SafeHtml {
    return this.iconesService.iconeCoroa;
  }

  get iconeExcluir(): SafeHtml {
    return this.iconesService.iconeExcluir;
  }

  trackByJogadorId(index: number, jogador: Usuario): string {
    return jogador.id;
  }

  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  ehDonoDaSala(jogador: Usuario): boolean {
    return jogador.nome === this.nomeDono;
  }

  obterClasseStatus(jogador: Usuario): string {
    return jogador.voto !== null ? 'text-green-600' : 'text-gray-400';
  }

  podeRemoverJogador(jogador: Usuario): boolean {
    return this.permissaoRemover && jogador.nome !== this.nomeDono;
  }

  obterStatusTexto(jogador: Usuario): string {
    return jogador.voto !== null ? 'Votou' : 'Não votou';
  }

  obterTipoTexto(jogador: Usuario): string {
    return jogador.tipo === 'participante' ? '🎮 Jogador' : '👁️ Espectador';
  }

  aoRemoverJogador(jogadorId: string): void {
    this.removerJogador.emit(jogadorId);
  }
}
