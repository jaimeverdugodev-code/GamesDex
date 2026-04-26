import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, query,
  orderBy, doc, deleteDoc, getCountFromServer
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User, Review } from '../models/database.models';

export interface PlatformStats {
  totalUsers:   number;
  totalReviews: number;
  totalFollows: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private firestore = inject(Firestore);

  getAllUsers(): Observable<User[]> {
    return collectionData(
      collection(this.firestore, 'users'),
      { idField: 'uid' }
    ) as Observable<User[]>;
  }

  deleteUser(uid: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `users/${uid}`));
  }

  getAllReviews(): Observable<Review[]> {
    const q = query(
      collection(this.firestore, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
  }

  deleteReview(reviewId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `reviews/${reviewId}`));
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const [usersSnap, reviewsSnap, followsSnap] = await Promise.all([
      getCountFromServer(collection(this.firestore, 'users')),
      getCountFromServer(collection(this.firestore, 'reviews')),
      getCountFromServer(collection(this.firestore, 'follows'))
    ]);
    return {
      totalUsers:   usersSnap.data().count,
      totalReviews: reviewsSnap.data().count,
      totalFollows: followsSnap.data().count
    };
  }
}
