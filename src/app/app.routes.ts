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
  // { path: 'home', loadComponent: () => import('./UI/home/home.page').then(m => m.HomePage) },
];