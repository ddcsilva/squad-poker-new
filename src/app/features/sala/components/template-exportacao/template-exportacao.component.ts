import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-template-exportacao',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './template-exportacao.component.html',
  styles: [
    `
      .template-invisivel {
        position: fixed;
        top: 0;
        left: 0;
        visibility: hidden;
        opacity: 0;
        z-index: -9999;
        pointer-events: none;
      }

      .template-visivel {
        position: fixed;
        top: 0;
        left: 0;
        opacity: 0;
        z-index: 9999;
        pointer-events: none;
      }
    `,
  ],
})
export class TemplateExportacaoComponent {
  @ViewChild('templateContainer') templateContainer!: ElementRef;

  @Input() numeroRodada: number = 1;
  @Input() descricaoRodada: string = '';
  @Input() pontuacaoFinal: string = '';
  @Input() participantes: {
    id: string;
    nome: string;
    voto: string | null;
    cor: string;
    tipo: 'participante' | 'espectador';
  }[] = [];
  @Input() codigoSala: string = '';
  @Input() dataRodada: Date = new Date();
  @Input() visivel: boolean = false;

  // Métodos auxiliares
  obterInicialNome(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  // Filtra apenas participantes com direito a voto
  get apenasParticipantes() {
    return this.participantes.filter(p => p.tipo === 'participante');
  }

  // Filtra apenas espectadores
  get apenasEspectadores() {
    return this.participantes.filter(p => p.tipo === 'espectador');
  }
}
