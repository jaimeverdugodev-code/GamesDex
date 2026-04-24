// src/app/core/services/review.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, query,
  where, collectionData, deleteDoc, doc, serverTimestamp, docData, updateDoc, getDocs
} from '@angular/fire/firestore';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Review } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);

  // 1. Obtener todas las reseñas de un juego, enriquecidas con la foto actual del autor
  getGameReviews(gameId: number): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('gameId', '==', gameId));

    return (collectionData(q, { idField: 'id' }) as Observable<Review[]>).pipe(
      switchMap(reviews => {
        if (reviews.length === 0) return of([]);

        const uniqueUserIds = [...new Set(reviews.map(r => r.userId))];
        const userDocs$ = uniqueUserIds.map(uid =>
          docData(doc(this.firestore, `users/${uid}`), { idField: 'uid' }) as Observable<any>
        );

        return combineLatest(userDocs$).pipe(
          map(users => {
            const photoMap = new Map(users.map((u: any) => [u['uid'], u['photoUrl'] || '']));
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
}