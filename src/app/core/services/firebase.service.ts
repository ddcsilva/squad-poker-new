import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Sala } from '../models/sala.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore = inject(Firestore);

  async salvarSala(sala: Sala): Promise<void> {
    const salaRef = doc(this.firestore, 'salas', sala.id);
    await setDoc(salaRef, { ...sala }, { merge: true });
  }

  async buscarSala(id: string): Promise<Sala | null> {
    const salaRef = doc(this.firestore, 'salas', id);
    const snapshot = await getDoc(salaRef);
    return snapshot.exists() ? (snapshot.data() as Sala) : null;
  }

  observarSala(id: string): Observable<Sala> {
    const salaRef = doc(this.firestore, 'salas', id);

    return new Observable<Sala>(observer => {
      const unsubscribe = onSnapshot(
        salaRef,
        snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Sala;

            // Converte o timestamp do Firestore para o formato JavaScript Date
            if (data.criadaEm && 'seconds' in data.criadaEm) {
              data.criadaEm = new Date((data.criadaEm as any).seconds * 1000);
            }

            // Converte timestamps em rodadas históricas
            if (data.historicoRodadas && Array.isArray(data.historicoRodadas)) {
              data.historicoRodadas = data.historicoRodadas.map(rodada => {
                if (rodada.timestamp && 'seconds' in rodada.timestamp) {
                  rodada.timestamp = new Date((rodada.timestamp as any).seconds * 1000);
                }
                return rodada;
              });
            } else {
              // Inicializa como array vazio se ausente
              data.historicoRodadas = data.historicoRodadas || [];
            }

            observer.next(data);
          } else {
            observer.error(new Error('Sala não encontrada'));
          }
        },
        error => {
          observer.error(error);
        }
      );

      // Retorna a função para cancelar a subscription
      return unsubscribe;
    });
  }
}
