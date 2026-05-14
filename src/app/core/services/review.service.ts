// src/app/core/services/review.service.ts

import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore, collection, addDoc, query,
  where, collectionData, deleteDoc, doc, serverTimestamp, docData, updateDoc, getDocs,
  orderBy, limit, getDoc, setDoc, increment
} from '@angular/fire/firestore';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Review, ReviewLike, ReviewComment } from '../models/database.models';

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

  // 3. Publicar una nueva reseña (devuelve el ID del documento creado)
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const ref = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: serverTimestamp()
    });
    return ref.id;
  }

  // 4. Actualizar una reseña existente
  async updateReview(reviewId: string, data: Partial<Review>): Promise<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    await updateDoc(reviewDoc, data as any);
  }

  // 5. Borrar una reseña (con limpieza en cascada de likes y comentarios)
  async deleteReview(reviewId: string): Promise<void> {
    await Promise.all([
      this.deleteReviewLikes(reviewId),
      this.deleteReviewComments(reviewId)
    ]);
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    await deleteDoc(reviewDoc);
  }

  // 5b. Actualizar authorPhoto en todas las reseñas de un usuario
  async updateAuthorPhotoInReviews(userId: string, photoUrl: string): Promise<void> {
    const q = query(collection(this.firestore, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => updateDoc(d.ref, { authorPhoto: photoUrl })));
  }

  // 5c. Borrar todas las reseñas de un usuario (con cascada de likes y comentarios)
  async deleteUserReviews(userId: string): Promise<void> {
    const q = query(collection(this.firestore, 'reviews'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(async d => {
      await this.deleteReviewLikes(d.id);
      await this.deleteReviewComments(d.id);
      return deleteDoc(d.ref);
    }));
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

  // 8. Obtener una reseña por ID (tiempo real)
  getReviewById(reviewId: string): Observable<Review> {
    return docData(doc(this.firestore, `reviews/${reviewId}`), { idField: 'id' }) as Observable<Review>;
  }

  // --- LIKES ---

  // Comprobar si el usuario actual ya dio like (lectura única por doc compuesto)
  getLike(reviewId: string, userId: string): Observable<boolean> {
    const likeRef = doc(this.firestore, `review_likes/${reviewId}_${userId}`);
    return from(getDoc(likeRef)).pipe(map(snap => snap.exists()));
  }

  // Obtener todos los likes de una reseña (tiempo real)
  getReviewLikes(reviewId: string): Observable<ReviewLike[]> {
    const q = query(
      collection(this.firestore, 'review_likes'),
      where('reviewId', '==', reviewId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<ReviewLike[]>;
  }

  // Toggle like (da o quita el like con contador atómico)
  async toggleLike(reviewId: string, userId: string, authorName: string, authorPhoto: string, currentlyLiked: boolean): Promise<void> {
    const likeId = `${reviewId}_${userId}`;
    const likeRef = doc(this.firestore, `review_likes/${likeId}`);
    const reviewRef = doc(this.firestore, `reviews/${reviewId}`);

    if (currentlyLiked) {
      await deleteDoc(likeRef);
      await updateDoc(reviewRef, { likesCount: increment(-1) });
    } else {
      await setDoc(likeRef, {
        reviewId,
        userId,
        authorName,
        authorPhoto: authorPhoto || '',
        createdAt: serverTimestamp()
      } as ReviewLike);
      await updateDoc(reviewRef, { likesCount: increment(1) });
    }
  }

  // --- COMENTARIOS / RESPUESTAS ---

  // Obtener respuestas de una reseña (tiempo real, ordenadas en memoria para evitar índice compuesto)
  getReviewComments(reviewId: string): Observable<ReviewComment[]> {
    const q = query(
      collection(this.firestore, 'review_comments'),
      where('reviewId', '==', reviewId)
    );
    return (collectionData(q, { idField: 'id' }) as Observable<ReviewComment[]>).pipe(
      map(comments =>
        comments.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0))
      )
    );
  }

  // Publicar una respuesta
  async addComment(commentData: Omit<ReviewComment, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(this.firestore, 'review_comments'), {
      ...commentData,
      createdAt: serverTimestamp()
    });
    await updateDoc(doc(this.firestore, `reviews/${commentData.reviewId}`), { commentsCount: increment(1) });
  }

  // Borrar una respuesta propia
  async deleteComment(commentId: string, reviewId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `review_comments/${commentId}`));
    await updateDoc(doc(this.firestore, `reviews/${reviewId}`), { commentsCount: increment(-1) });
  }

  // Borrar todos los likes de una reseña (usado en cascada al borrar la reseña)
  private async deleteReviewLikes(reviewId: string): Promise<void> {
    const q = query(collection(this.firestore, 'review_likes'), where('reviewId', '==', reviewId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
  }

  // Borrar todos los comentarios de una reseña (usado en cascada al borrar la reseña)
  private async deleteReviewComments(reviewId: string): Promise<void> {
    const q = query(collection(this.firestore, 'review_comments'), where('reviewId', '==', reviewId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
  }
}