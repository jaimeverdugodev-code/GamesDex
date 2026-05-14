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
  role?: 'admin' | 'user';
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
  likesCount?: number;      // Contador desnormalizado de likes
  commentsCount?: number;   // Contador desnormalizado de respuestas
}

// Colección 'review_likes' — ID del documento: `${reviewId}_${userId}`
export interface ReviewLike {
  id?: string;
  reviewId: string;         // ID de la reseña que recibe el like
  userId: string;           // UID del usuario que dio el like
  authorName: string;       // Nombre del autor (para mostrar avatares)
  authorPhoto?: string;     // Foto del autor
  createdAt: any;
}

// Colección 'review_comments'
export interface ReviewComment {
  id?: string;
  reviewId: string;         // ID de la reseña a la que pertenece
  userId: string;           // UID del autor del comentario
  authorName: string;       // Nombre del autor
  authorPhoto?: string;     // Foto del autor
  text: string;             // Texto de la respuesta
  createdAt: any;
}

// Colección 'follows'
export interface Follow {
  id?: string;
  followerId: string;       // UID del que sigue
  followingId: string;      // UID del seguido
  status: 'pending' | 'accepted'; 
}

// Colección 'notifications'
export interface AppNotification {
  id?: string;
  userId: string;           // Receptor de la notificación
  type: 'review_liked' | 'review_commented' | 'new_follower' | 'new_review';
  fromUserId: string;       // Quien la generó
  fromUserName: string;
  fromUserPhoto?: string;
  reviewId?: string;        // Para review_liked, review_commented, new_review
  commentText?: string;     // Extracto del comentario (review_commented)
  gameId?: number;          // Para new_review
  gameName?: string;        // Para new_review
  read: boolean;
  createdAt: any;
}

// Colección 'user_games'
export interface UserGame {
  id?: string;
  userId: string;
  gameId: number;
  status: 'played' | 'playing' | 'wishlist' | null; // Estado del juego
  addedAt: Timestamp;
}