// src/app/UI/social/followers/followers.page.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { SocialService } from '../../../core/services/social.service';
import { User } from '../../../core/models/database.models';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.page.html',
  styleUrls: ['./followers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonSpinner
  ]
})
export class FollowersPage implements OnInit, OnDestroy {
  private socialService = inject(SocialService);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  users: User[] = [];
  loading = true;
  profileId = '';

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.profileId) return;

    this.socialService.getFollowers(this.profileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.loading = false;
      });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
