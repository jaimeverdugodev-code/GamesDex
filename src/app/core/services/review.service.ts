// src/app/core/services/review.service.ts

import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, addDoc, query, 
  where, collectionData, deleteDoc, doc, serverTimestamp 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Review } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);

  // 1. Obtener todas las reseñas de un juego en concreto
  getGameReviews(gameId: number): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const q = query(reviewsRef, where('gameId', '==', gameId));
    
    // Lo traemos y lo ordenamos por fecha en el frontend (más reciente primero)
    // para evitar tener que crear índices complejos en Firebase
    return (collectionData(q, { idField: 'id' }) as Observable<Review[]>).pipe(
      map(reviews => reviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA; 
      }))
    );
  }

  // 2. Publicar una nueva reseña
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
    const reviewsRef = collection(this.firestore, 'reviews');
    await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: serverTimestamp() // Firebase pone la hora exacta del servidor
    });
  }

  // 3. Borrar una reseña (Para cuando el usuario quiera borrar la suya)
  async deleteReview(reviewId: string): Promise<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    await deleteDoc(reviewDoc);
  }
}