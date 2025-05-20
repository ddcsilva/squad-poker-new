import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-sala-encerrada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sala-encerrada.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class SalaEncerradaComponent {
  @Input() titulo: string = 'Sala Encerrada';
  @Input() mensagem: string = 'Esta sala foi encerrada pelo moderador.<br />Obrigado por participar!';
  @Input() mostrarBotaoVoltar: boolean = false;

  @Output() voltar = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  get iconeEncerrado(): SafeHtml {
    const svg = `<svg class="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  aoVoltar(): void {
    this.voltar.emit();
  }
}
