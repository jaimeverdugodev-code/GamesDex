import { Routes } from '@angular/router';

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
    path: 'my-games',
    loadComponent: () => import('./UI/my-games/my-games.page').then(m => m.MyGamesPage)
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
    path: 'edit-profile',
    loadComponent: () => import('./UI/edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },
  {
    path: 'add-friends',
    loadComponent: () => import('./UI/friends/add-friends/add-friends.page').then(m => m.AddFriendsPage)
  }
];