import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from '@angular/fire/firestore';
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

    return new Observable<Sala>((observer) => {
      const unsubscribe = onSnapshot(
        salaRef,
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next(snapshot.data() as Sala);
          } else {
            observer.error(new Error('Sala não encontrada'));
          }
        },
        (error) => {
          observer.error(error);
        }
      );

      // Retorna a função para cancelar a subscription
      return unsubscribe;
    });
  }
}
