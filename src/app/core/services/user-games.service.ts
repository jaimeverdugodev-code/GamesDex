// src/app/core/services/user-games.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, doc, query, where,
  getDocs, setDoc, deleteDoc, Timestamp
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserGame } from '../models/database.models';

export type GameStatus = 'played' | 'playing' | 'wishlist';

@Injectable({
  providedIn: 'root'
})
export class UserGamesService {
  private firestore = inject(Firestore);

  /**
   * Caché local de juegos. 
   * Usamos un Map donde la Clave es el gameId (number) y el Valor es el status (string).
   */
  private savedGamesMap$ = new BehaviorSubject<Map<number, GameStatus>>(new Map());

  get savedGames$(): Observable<Map<number, GameStatus>> {
    return this.savedGamesMap$.asObservable();
  }

  /**
   * Carga todos los gameId del usuario desde Firestore y llena la caché (Map).
   */
  loadUserGames(userId: string): void {
    const gamesRef = collection(this.firestore, 'user_games');
    const q = query(gamesRef, where('userId', '==', userId));

    from(getDocs(q)).subscribe(snapshot => {
      const gameMap = new Map<number, GameStatus>();
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserGame;
        gameMap.set(data.gameId, data.status as GameStatus);
      });
      this.savedGamesMap$.next(gameMap);
    });
  }

  /**
   * Comprueba si un juego concreto está en la colección (Devuelve boolean).
   * Mantenida por compatibilidad con otras partes de la app.
   */
  isGameSaved(gameId: number): Observable<boolean> {
    return this.savedGamesMap$.pipe(
      map(gameMap => gameMap.has(gameId))
    );
  }

  /**
   * NUEVO: Devuelve el estado exacto del juego ('played', 'playing', 'wishlist' o null).
   */
  getGameStatus(gameId: number): Observable<GameStatus | null> {
    return this.savedGamesMap$.pipe(
      map(gameMap => gameMap.get(gameId) || null)
    );
  }

  /**
   * Añade (o actualiza) un juego en la colección.
   */
  async addGame(userId: string, gameId: number, status: GameStatus = 'played'): Promise<void> {
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
    const currentMap = this.savedGamesMap$.value;
    currentMap.set(gameId, status);
    this.savedGamesMap$.next(new Map(currentMap));
  }

  /**
   * Elimina un juego de la colección.
   */
  async removeGame(userId: string, gameId: number): Promise<void> {
    const docId = `${userId}_${gameId}`;
    const docRef = doc(this.firestore, `user_games/${docId}`);

    await deleteDoc(docRef);

    // Actualizar caché local
    const currentMap = this.savedGamesMap$.value;
    currentMap.delete(gameId);
    this.savedGamesMap$.next(new Map(currentMap));
  }

  /**
   * Obtiene todos los documentos completos de un usuario.
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