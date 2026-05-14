// src/app/core/services/notification.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, query,
  where, collectionData, updateDoc, getDocs, serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppNotification } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);

  // Obtener todas las notificaciones de un usuario (tiempo real, ordenadas en memoria)
  getNotifications(userId: string): Observable<AppNotification[]> {
    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', userId)
    );
    return (collectionData(q, { idField: 'id' }) as Observable<AppNotification[]>).pipe(
      map(notifs =>
        notifs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      )
    );
  }

  // Contador de notificaciones no leídas (tiempo real)
  getUnreadCount(userId: string): Observable<number> {
    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    return collectionData(q).pipe(map(docs => docs.length));
  }

  // Marcar todas como leídas
  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    await Promise.all(snapshot.docs.map(d => updateDoc(d.ref, { read: true })));
  }

  // Notificación de like a una reseña
  async createLikeNotification(
    reviewId: string,
    reviewAuthorId: string,
    fromUserId: string,
    fromUserName: string,
    fromUserPhoto: string
  ): Promise<void> {
    if (fromUserId === reviewAuthorId) return;
    await addDoc(collection(this.firestore, 'notifications'), {
      userId: reviewAuthorId,
      type: 'review_liked',
      fromUserId,
      fromUserName,
      fromUserPhoto: fromUserPhoto || '',
      reviewId,
      read: false,
      createdAt: serverTimestamp()
    } as AppNotification);
  }

  // Notificación de comentario en una reseña
  async createCommentNotification(
    reviewId: string,
    reviewAuthorId: string,
    commentText: string,
    fromUserId: string,
    fromUserName: string,
    fromUserPhoto: string
  ): Promise<void> {
    if (fromUserId === reviewAuthorId) return;
    await addDoc(collection(this.firestore, 'notifications'), {
      userId: reviewAuthorId,
      type: 'review_commented',
      fromUserId,
      fromUserName,
      fromUserPhoto: fromUserPhoto || '',
      reviewId,
      commentText: commentText.substring(0, 100),
      read: false,
      createdAt: serverTimestamp()
    } as AppNotification);
  }

  // Notificación de nuevo seguidor
  async createFollowNotification(
    followedUserId: string,
    fromUserId: string,
    fromUserName: string,
    fromUserPhoto: string
  ): Promise<void> {
    if (fromUserId === followedUserId) return;
    await addDoc(collection(this.firestore, 'notifications'), {
      userId: followedUserId,
      type: 'new_follower',
      fromUserId,
      fromUserName,
      fromUserPhoto: fromUserPhoto || '',
      read: false,
      createdAt: serverTimestamp()
    } as AppNotification);
  }

  // Notificación de nueva reseña para cada seguidor
  async createNewReviewNotifications(
    reviewId: string,
    authorId: string,
    fromUserName: string,
    fromUserPhoto: string,
    gameName: string,
    gameId: number,
    followerIds: string[]
  ): Promise<void> {
    if (followerIds.length === 0) return;
    await Promise.all(
      followerIds.map(followerId =>
        addDoc(collection(this.firestore, 'notifications'), {
          userId: followerId,
          type: 'new_review',
          fromUserId: authorId,
          fromUserName,
          fromUserPhoto: fromUserPhoto || '',
          reviewId,
          gameName,
          gameId,
          read: false,
          createdAt: serverTimestamp()
        } as AppNotification)
      )
    );
  }
}
