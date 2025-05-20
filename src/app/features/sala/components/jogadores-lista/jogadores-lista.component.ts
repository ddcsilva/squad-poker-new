import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../../core/models/usuario.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  @Input() jogadores: Usuario[] = [];
  @Input() nomeDono: string = '';
  @Input() permissaoRemover: boolean = false;

  @Output() removerJogador = new EventEmitter<string>();

  constructor(private sanitizer: DomSanitizer) {}

  get iconeCoroa(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 text-amber-500 fill-current">
      <path d="M4 17L2 7l6 5 4-8 4 8 6-5-2 10H4zm0 2h16v2H4v-2z" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  get iconeExcluir(): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
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
