// src/app/core/services/social.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, limit, where, doc, docData, addDoc, getDocs, deleteDoc } from '@angular/fire/firestore';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User, Follow } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private firestore = inject(Firestore);

  // Obtener todos los usuarios
  getAllUsers(maxLimit: number = 50): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, limit(maxLimit));
    return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
  }

  // Obtener los seguidores de un usuario (quienes le siguen a él)
  getFollowers(userId: string): Observable<User[]> {
    const followsRef = collection(this.firestore, 'follows');
    const q = query(followsRef, where('followingId', '==', userId));

    return collectionData(q).pipe(
      switchMap((follows: any[]) => {
        if (!follows || follows.length === 0) return of([]);
        const userDocs = follows.map(f =>
          docData(doc(this.firestore, `users/${f.followerId}`), { idField: 'uid' }) as Observable<User>
        );
        return combineLatest(userDocs);
      })
    );
  }

  // Obtener solo a los que SIGUES (Siguiendo)
  getFollowing(currentUserId: string): Observable<User[]> {
    const followsRef = collection(this.firestore, 'follows');
    const q = query(followsRef, where('followerId', '==', currentUserId));
    
    return collectionData(q).pipe(
      switchMap((follows: any[]) => {
        if (!follows || follows.length === 0) return of([]);
        const userDocs = follows.map(f => 
          docData(doc(this.firestore, `users/${f.followingId}`), { idField: 'uid' }) as Observable<User>
        );
        return combineLatest(userDocs);
      })
    );
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    const followsRef = collection(this.firestore, 'follows');
    await addDoc(followsRef, {
      followerId,
      followingId,
      status: 'accepted'
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const followsRef = collection(this.firestore, 'follows');
    const q = query(followsRef, where('followerId', '==', followerId), where('followingId', '==', followingId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(this.firestore, `follows/${docSnap.id}`)));
    await Promise.all(deletePromises);
  }

  async deleteUserFollows(userId: string): Promise<void> {
    const followsRef = collection(this.firestore, 'follows');
    const [asFollower, asFollowing] = await Promise.all([
      getDocs(query(followsRef, where('followerId', '==', userId))),
      getDocs(query(followsRef, where('followingId', '==', userId)))
    ]);
    const all = [...asFollower.docs, ...asFollowing.docs];
    await Promise.all(all.map(d => deleteDoc(d.ref)));
  }
}