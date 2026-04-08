// src/app/core/services/user-games.service.ts
// Capa de Acceso a Datos — CRUD de la colección 'user_games' en Firestore

import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, doc, query, where,
  getDocs, setDoc, deleteDoc, Timestamp
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserGame } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class UserGamesService {
  private firestore = inject(Firestore);

  /**
   * Caché local de IDs de juegos guardados por el usuario actual.
   * Permite comprobar el estado del FAB de forma instantánea sin
   * consultar Firestore en cada navegación al detalle.
   */
  private savedGameIds$ = new BehaviorSubject<Set<number>>(new Set());

  /**
   * Observable público para que los componentes reaccionen
   * a cambios en la colección de juegos del usuario.
   */
  get savedIds$(): Observable<Set<number>> {
    return this.savedGameIds$.asObservable();
  }

  /**
   * Carga todos los gameId del usuario desde Firestore y llena la caché.
   * Se llama una vez cuando se conoce el UID (ej: al entrar en game-detail).
   */
  loadUserGames(userId: string): void {
    const gamesRef = collection(this.firestore, 'user_games');
    const q = query(gamesRef, where('userId', '==', userId));

    from(getDocs(q)).subscribe(snapshot => {
      const ids = new Set<number>();
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserGame;
        ids.add(data.gameId);
      });
      this.savedGameIds$.next(ids);
    });
  }

  /**
   * Comprueba si un juego concreto está en la colección del usuario.
   * Lee de la caché local (BehaviorSubject), no de Firestore.
   */
  isGameSaved(gameId: number): Observable<boolean> {
    return this.savedGameIds$.pipe(
      map(ids => ids.has(gameId))
    );
  }

  /**
   * Añade un juego a la colección del usuario.
   * Usa un ID determinista `${userId}_${gameId}` para evitar duplicados
   * y permitir borrado directo sin necesidad de buscar el documento.
   */
  async addGame(userId: string, gameId: number, status: 'played' | 'wishlist' = 'played'): Promise<void> {
    const docId = `${userId}_${gameId}`;
    const docRef = doc(this.firestore, `user_games/${docId}`);

    const userGame: UserGame = {
      userId,
      gameId,
      status,
      addedAt: Timestamp.now()
    };

    await setDoc(docRef, userGame);

    // Actualizar caché local
    const current = this.savedGameIds$.value;
    current.add(gameId);
    this.savedGameIds$.next(new Set(current));
  }

  /**
   * Elimina un juego de la colección del usuario.
   */
  async removeGame(userId: string, gameId: number): Promise<void> {
    const docId = `${userId}_${gameId}`;
    const docRef = doc(this.firestore, `user_games/${docId}`);

    await deleteDoc(docRef);

    // Actualizar caché local
    const current = this.savedGameIds$.value;
    current.delete(gameId);
    this.savedGameIds$.next(new Set(current));
  }

  /**
   * Obtiene todos los documentos user_games de un usuario.
   * Útil para la FASE 3 (página de perfil / colección).
   */
  getUserGames(userId: string): Observable<UserGame[]> {
    const gamesRef = collection(this.firestore, 'user_games');
    const q = query(gamesRef, where('userId', '==', userId));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const games: UserGame[] = [];
        snapshot.forEach(docSnap => {
          games.push({ id: docSnap.id, ...docSnap.data() } as UserGame);
        });
        return games;
      })
    );
  }
}
