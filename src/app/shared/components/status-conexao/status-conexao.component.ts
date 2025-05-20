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
  online = signal(navigator.onLine);

  private onlineHandler = () => this.online.set(true);
  private offlineHandler = () => this.online.set(false);

  ngOnInit(): void {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}
