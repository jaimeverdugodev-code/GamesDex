import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, query,
  orderBy, doc, deleteDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, Review } from '../models/database.models';
import { ReviewService } from './review.service';
import { SocialService } from './social.service';
import { UserGamesService } from './user-games.service';

export interface PlatformStats {
  totalUsers:   number;
  totalReviews: number;
  totalFollows: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private firestore        = inject(Firestore);
  private auth             = inject(Auth);
  private http             = inject(HttpClient);
  private reviewService    = inject(ReviewService);
  private socialService    = inject(SocialService);
  private userGamesService = inject(UserGamesService);

  getAllUsers(): Observable<User[]> {
    return collectionData(
      collection(this.firestore, 'users'),
      { idField: 'uid' }
    ) as Observable<User[]>;
  }

  async deleteUser(uid: string): Promise<void> {
    await Promise.all([
      this.reviewService.deleteUserReviews(uid),
      this.socialService.deleteUserFollows(uid),
      this.userGamesService.deleteUserGames(uid),
      deleteDoc(doc(this.firestore, `users/${uid}`))
    ]);

    const idToken = await this.auth.currentUser?.getIdToken();
    if (idToken) {
      await firstValueFrom(
        this.http.post('/api/delete-auth-user', { uid }, {
          headers: new HttpHeaders({ Authorization: `Bearer ${idToken}` })
        })
      );
    }
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

  getFollowsCount(): Observable<number> {
    return (collectionData(collection(this.firestore, 'follows')) as Observable<unknown[]>).pipe(
      map(docs => docs.length)
    );
  }
}
