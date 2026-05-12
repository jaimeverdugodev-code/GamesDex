// src/app/core/services/review.service.ts

import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore, collection, addDoc, query,
  where, collectionData, deleteDoc, doc, serverTimestamp, docData, updateDoc, getDocs,
  orderBy, limit
} from '@angular/fire/firestore';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Review } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  // 1. Obtener todas las reseñas de un juego, enriquecidas con la foto actual del autor
  getGameReviews(gameId: number): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('gameId', '==', gameId));

    return (collectionData(q, { idField: 'id' }) as Observable<Review[]>).pipe(
      switchMap(reviews => {
        if (reviews.length === 0) return of([]);

        const uniqueUserIds = [...new Set(reviews.map(r => r.userId))];
        const userDocs$ = uniqueUserIds.map(uid =>
          runInInjectionContext(this.injector, () =>
            docData(doc(this.firestore, `users/${uid}`), { idField: 'uid' }) as Observable<any>
          )
        );

        return combineLatest(userDocs$).pipe(
          map(users => {
            const photoMap = new Map(
              users.filter((u: any) => !!u?.uid).map((u: any) => [u['uid'], u['photoUrl'] || ''])
            );
            return reviews
              .map(review => ({ ...review, authorPhoto: photoMap.get(review.userId) || '' }))
              .sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
              });
          })
        );
      })
    );
  }

  // 2. Obtener todas las reseñas de un usuario (lectura única desde servidor)
  getUserReviews(userId: string): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('userId', '==', userId));
    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as Review))
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
          })
      )
    );
  }

  // 3. Publicar una nueva reseña
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
    const reviewsRef = collection(this.firestore, 'reviews');
    await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: serverTimestamp() // Firebase pone la hora exacta del servidor
    });
  }

  // 4. Actualizar una reseña existente
  async updateReview(reviewId: string, data: Partial<Review>): Promise<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    await updateDoc(reviewDoc, data as any);
  }

  // 5. Borrar una reseña
  async deleteReview(reviewId: string): Promise<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    await deleteDoc(reviewDoc);
  }

  // 5b. Actualizar authorPhoto en todas las reseñas de un usuario
  async updateAuthorPhotoInReviews(userId: string, photoUrl: string): Promise<void> {
    const q = query(collection(this.firestore, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => updateDoc(d.ref, { authorPhoto: photoUrl })));
  }

  // 5c. Borrar todas las reseñas de un usuario
  async deleteUserReviews(userId: string): Promise<void> {
    const q = query(collection(this.firestore, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
  }

  // 6. Feed global: últimas N reseñas de toda la base de datos
  getGlobalReviews(limitNum: number = 20): Observable<Review[]> {
    const q = query(
      collection(this.firestore, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(limitNum)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
  }

  // 7. Feed de siguiendo: reseñas de los usuarios que sigues
  // Nota: el operador 'in' de Firestore soporta máximo 30 valores.
  getFollowingReviews(userIds: string[]): Observable<Review[]> {
    if (userIds.length === 0) return of([]);
    const q = query(
      collection(this.firestore, 'reviews'),
      where('userId', 'in', userIds)
    );
    return (collectionData(q, { idField: 'id' }) as Observable<Review[]>).pipe(
      map(reviews =>
        reviews.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
      )
    );
  }
}