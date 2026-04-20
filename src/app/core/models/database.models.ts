// src/app/core/models/database.models.ts

import { Timestamp } from '@angular/fire/firestore';

// Colección 'users'
export interface User {
  uid: string;              // Identificador único de Firebase Auth
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  favoriteGenres: string[]; // Lista de géneros preferidos
}

// Colección 'reviews'
export interface Review {
  id?: string;
  gameId: number;           // El ID del juego en RAWG
  userId: string;           // El UID del usuario que escribe
  authorName: string;       // Nombre del usuario (para mostrarlo rápido)
  authorPhoto?: string;     // Foto del usuario
  rating: number;           // Estrellas del 1 al 5
  text: string;             // El comentario escrito
  createdAt: any;           // Fecha de publicación
}

// Colección 'follows'
export interface Follow {
  id?: string;
  followerId: string;       // UID del que sigue
  followingId: string;      // UID del seguido
  status: 'pending' | 'accepted'; 
}

// Colección 'user_games'
export interface UserGame {
  id?: string;
  userId: string;
  gameId: number;
  status: 'played' | 'playing' | 'wishlist' | null; // Estado del juego
  addedAt: Timestamp;
}