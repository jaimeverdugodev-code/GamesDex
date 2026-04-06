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
  id?: string;              // Auto-ID (Opcional en la creación)
  userId: string;           // Referencia al UID del autor
  gameId: number;           // ID único del juego (API RAWG)
  rating: number;           // Puntuación numérica
  comment: string;          // Texto de la reseña
  createdAt: Timestamp;     // Fecha y hora
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
  status: 'played' | 'wishlist'; // Estado del juego
  addedAt: Timestamp;
}