import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

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

  aoVoltar(): void {
    this.voltar.emit();
  }
}
