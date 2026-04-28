// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  User as FirebaseAuthUser
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyección de dependencias de AngularFire (basado en app.config / main.ts)
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable que emite el estado actual del usuario (Reactividad con RxJS)
  public readonly user$ = authState(this.auth);

  public readonly isAdmin$ = this.user$.pipe(
    switchMap(user => {
      if (!user) return of(false);
      const userRef = doc(this.firestore, `users/${user.uid}`);
      return from(getDoc(userRef)).pipe(
        map(snap => snap.exists() ? (snap.data() as User).role === 'admin' : false)
      );
    })
  );

  constructor() {}

  /**
   * HU01: Iniciar sesión con Google
   */
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(this.auth, provider);
  }

  async handleGoogleRedirect(): Promise<void> {
    const result = await getRedirectResult(this.auth);
    if (result?.user) {
      await this.syncUserData(result.user);
    }
  }

  /**
   * HU01: Registro con Email y Contraseña
   */
  async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    // Para registro por email, forzamos el displayName que introduce el usuario
    await this.syncUserData(credential.user, displayName);
  }

  /**
   * HU01: Iniciar sesión con Email y Contraseña
   */
  async loginWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async changeUserPassword(newPassword: string): Promise<void> {
    await updatePassword(this.auth.currentUser!, newPassword);
  }

  async deleteUserAccount(): Promise<void> {
    await deleteUser(this.auth.currentUser!);
  }

  /**
   * MÉTODO INTERNO: Sincroniza el usuario de Firebase Auth con nuestra colección 'users' en Firestore.
   * Si es la primera vez que entra, crea el documento basándose en nuestra interfaz NoSQL.
   */
  private async syncUserData(firebaseUser: FirebaseAuthUser, customDisplayName?: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
    const userSnap = await getDoc(userRef);

    // Si el documento no existe, es un usuario nuevo: lo creamos
    if (!userSnap.exists()) {
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: customDisplayName || firebaseUser.displayName || 'Gamer Anónimo',
        photoUrl: firebaseUser.photoURL || '',
        favoriteGenres: [] // Array vacío por defecto como dicta el modelo
      };
      // setDoc crea o sobrescribe el documento
      await setDoc(userRef, newUser);
    }
  }

  /**
   * Obtiene el perfil completo del usuario desde Firestore (para la UI)
   */
  getProfileData(uid: string): Observable<User | undefined> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userRef)).pipe(
      switchMap(async (snap) => snap.exists() ? snap.data() as User : undefined)
    );
  }

  /**
   * Actualiza los datos del perfil del usuario (Nombre, Foto, Bio, Géneros)
   */
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    // merge: true actualiza solo los campos especificados sin borrar el resto
    await setDoc(userRef, profileData, { merge: true });
  }

  /**
   * Comprueba si el usuario tiene al menos 3 géneros seleccionados
   */
  async isProfileComplete(uid: string): Promise<boolean> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const userData = snap.data() as User;
      return userData.favoriteGenres && userData.favoriteGenres.length >= 3;
    }
    return false;
  }
}