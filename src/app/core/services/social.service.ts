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
    // Buscamos el documento exacto donde tú eres el follower y él es el following
    const q = query(followsRef, where('followerId', '==', followerId), where('followingId', '==', followingId));
    const snapshot = await getDocs(q);
    
    // Eliminamos todas las coincidencias (normalmente solo habrá una)
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(this.firestore, `follows/${docSnap.id}`)));
    await Promise.all(deletePromises);
  }
}