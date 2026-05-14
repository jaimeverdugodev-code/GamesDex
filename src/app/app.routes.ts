import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./UI/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./UI/auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'complete-profile',
    loadComponent: () => import('./UI/auth/complete-profile/complete-profile.page').then(m => m.CompleteProfilePage)
  },
  {
    path: 'home',
    loadComponent: () => import('./UI/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'search',
    loadComponent: () => import('./UI/search/search.page').then(m => m.SearchPage)
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./UI/game-detail/game-detail.page').then(m => m.GameDetailPage)
  },
  {
    path: 'activity',
    loadComponent: () => import('./UI/activity/activity.page').then(m => m.ActivityPage)
  },
  {
    path: 'friends',
    loadComponent: () => import('./UI/friends/friends.page').then(m => m.FriendsPage)
  },
  {
    // Mi propio perfil
    path: 'profile',
    loadComponent: () => import('./UI/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    // El perfil de un amigo (Recibe su UID por la URL)
    path: 'profile/:id',
    loadComponent: () => import('./UI/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'profile/:id/followers',
    loadComponent: () => import('./UI/social/followers/followers.page').then(m => m.FollowersPage)
  },
  {
    path: 'profile/:id/following',
    loadComponent: () => import('./UI/social/following/following.page').then(m => m.FollowingPage)
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./UI/edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },
  {
    path: 'add-friends',
    loadComponent: () => import('./UI/friends/add-friends/add-friends.page').then(m => m.AddFriendsPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./UI/admin/admin.page').then(m => m.AdminPage),
    canActivate: [adminGuard]
  },
  {
    path: 'review/:id',
    loadComponent: () => import('./UI/review-detail/review-detail.page').then(m => m.ReviewDetailPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./UI/settings/settings.page').then(m => m.SettingsPage)
  }
];