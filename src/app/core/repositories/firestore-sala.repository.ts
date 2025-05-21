import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Sala, HistoricoRodada } from '../models/sala.model';
import { ISalaRepository } from '../interfaces/sala-repository.interface';

/**
 * Implementação do repositório de salas usando Firebase Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreSalaRepository implements ISalaRepository {
  private firestore = inject(Firestore);

  /**
   * Salva uma sala no Firestore
   */
  async salvar(sala: Sala): Promise<void> {
    try {
      const salaRef = doc(this.firestore, 'salas', sala.id);
      await setDoc(salaRef, sala, { merge: true });
    } catch (error) {
      console.error('Erro ao salvar sala:', error);
      throw new Error('Não foi possível salvar os dados da sala');
    }
  }

  /**
   * Busca uma sala pelo ID no Firestore
   */
  async buscarPorId(id: string): Promise<Sala | null> {
    try {
      const salaRef = doc(this.firestore, 'salas', id);
      const snapshot = await getDoc(salaRef);

      if (!snapshot.exists()) {
        return null;
      }

      return this.converterParaSala(snapshot.data() as any, id);
    } catch (error) {
      console.error('Erro ao buscar sala:', error);
      throw new Error('Não foi possível buscar a sala');
    }
  }

  /**
   * Cria um Observable que emite atualizações da sala em tempo real
   */
  observar(id: string): Observable<Sala> {
    const salaRef = doc(this.firestore, 'salas', id);

    return new Observable<Sala>(observer => {
      const unsubscribe = onSnapshot(
        salaRef,
        snapshot => {
          if (snapshot.exists()) {
            try {
              const sala = this.converterParaSala(snapshot.data() as any, id);
              observer.next(sala);
            } catch (error) {
              observer.error(new Error('Falha ao processar dados da sala'));
            }
          } else {
            observer.error(new Error('Sala não encontrada'));
          }
        },
        error => {
          console.error('Erro ao observar sala:', error);
          observer.error(new Error('Falha ao observar a sala'));
        }
      );

      // Retorna a função para cancelar a subscription
      return unsubscribe;
    });
  }

  /**
   * Converte dados brutos do Firestore para o modelo Sala
   */
  private converterParaSala(data: any, id: string): Sala {
    // Processa as datas do Firestore para o formato Date
    const criadaEm = this.converterTimestampParaDate(data.criadaEm);

    // Processa as datas nas rodadas do histórico
    const historicoRodadas: HistoricoRodada[] = Array.isArray(data.historicoRodadas)
      ? data.historicoRodadas.map((rodada: any) => ({
          ...rodada,
          timestamp: this.converterTimestampParaDate(rodada.timestamp),
        }))
      : [];

    // Constrói o objeto Sala completo
    return {
      ...data,
      id, // Usa o ID fornecido
      criadaEm,
      historicoRodadas,
    };
  }

  /**
   * Converte um timestamp do Firestore para um objeto Date do JavaScript
   */
  private converterTimestampParaDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    // Se já for uma data, retorna ela mesma
    if (timestamp instanceof Date) return timestamp;

    // Se for um timestamp do Firestore (tem propriedade seconds)
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }

    // Tenta converter outros formatos para Date
    return new Date(timestamp);
  }
}
