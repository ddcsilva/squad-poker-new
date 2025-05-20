import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AtualizacaoService {
  atualizacaoDisponivel = false;

  constructor(private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      // Verificar atualizações a cada 6 horas
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);

      // Ouvir por novas atualizações
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(evt => {
          this.atualizacaoDisponivel = true;
          console.log(`Atualização disponível: ${JSON.stringify(evt)}`);
        });
    }
  }

  atualizarParaNovaVersao(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return Promise.resolve(false);
    }

    return this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
      return true;
    });
  }
}
