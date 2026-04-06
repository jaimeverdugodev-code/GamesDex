import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

import { IonContent, IonSpinner, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
// Añadimos personOutline y cameraOutline
import { checkmarkCircleOutline, gameController, personOutline, imageOutline, documentTextOutline, cameraOutline, closeOutline } from 'ionicons/icons';

// IMPORTAMOS LA LIBRERÍA DE RECORTE
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.page.html',
  styleUrls: ['./complete-profile.page.scss'],
  standalone: true,
  // Añadimos ImageCropperComponent y los componentes de IonModal a los imports
  imports: [
    CommonModule, FormsModule, IonContent, IonSpinner, IonIcon, 
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    ImageCropperComponent
  ]
})
export class CompleteProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  availableGenres = [
    'Acción', 'Aventura', 'RPG', 'Shooter', 'Deportes', 
    'Estrategia', 'Carreras', 'Lucha', 'Plataformas', 
    'Puzzle', 'Simulación', 'Indie'
  ];
  
  selectedGenres: Set<string> = new Set();
  
  displayName = '';
  photoUrl = ''; // Aquí guardaremos el Base64 final comprimido
  bio = '';
  
  isLoading = false;
  currentUserUid: string | null = null;
  errorMessage = '';

  // --- VARIABLES PARA EL CROPPER --- //
  imageFile: File | undefined = undefined;
  croppedImageBase64: string | ArrayBuffer | null = ''; 
  showCropperModal = false;
  // --------------------------------- //

  constructor() {
    addIcons({ checkmarkCircleOutline, gameController, personOutline, imageOutline, documentTextOutline, cameraOutline, closeOutline });
  }

  ngOnInit() {
    this.authService.user$.subscribe(async user => {
      if (user) {
        this.currentUserUid = user.uid;
        const profile = await firstValueFrom(this.authService.getProfileData(user.uid));
        if (profile) {
          this.displayName = profile.displayName || '';
          this.photoUrl = profile.photoUrl || '';
          this.bio = profile.bio || '';
          if (profile.favoriteGenres) {
            this.selectedGenres = new Set(profile.favoriteGenres);
          }
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleGenre(genre: string) {
    if (this.selectedGenres.has(genre)) {
      this.selectedGenres.delete(genre);
    } else {
      this.selectedGenres.add(genre);
    }
  }

  // --- LÓGICA DE FOTO CON EDITOR --- //
  triggerFileInput() {
    document.getElementById('file-upload')?.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/*/)) {
      this.errorMessage = 'Solo se permiten archivos de imagen.';
      return;
    }

    // Le pasamos el archivo directamente a la librería
    this.imageFile = file;
    this.showCropperModal = true;
  }

  // Se ejecuta cada vez que el usuario mueve/hace zoom en la imagen
  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.croppedImageBase64 = reader.result; // Aquí tenemos el Base64
      };
      reader.readAsDataURL(event.blob);
    }
  }

  imageLoaded() {
    // La imagen se ha cargado en el editor
  }
  cropperReady() {
    // El editor está listo
  }
  loadImageFailed() {
    this.errorMessage = 'No se pudo cargar la imagen para recortar.';
    this.closeModal();
  }

  // El usuario acepta el recorte actual
  saveCroppedImage() {
    if (this.croppedImageBase64) {
      this.photoUrl = this.croppedImageBase64 as string;
    }
    this.closeModal();
  }

  closeModal() {
    this.showCropperModal = false;
    this.imageFile = undefined;
    this.croppedImageBase64 = '';
    (<HTMLInputElement>document.getElementById('file-upload')).value = '';
  }
  // ------------------------------------ //

  async saveProfile() {
    this.errorMessage = '';

    if (!this.displayName.trim()) {
      this.errorMessage = 'El nombre de jugador es obligatorio.';
      return;
    }

    if (this.selectedGenres.size < 3 || !this.currentUserUid) {
      this.errorMessage = 'Debes seleccionar al menos 3 géneros.';
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.updateUserProfile(this.currentUserUid, {
        displayName: this.displayName.trim(),
        photoUrl: this.photoUrl, // Guardamos el Base64 definitivo
        bio: this.bio.trim(),
        favoriteGenres: Array.from(this.selectedGenres)
      });
      this.router.navigate(['/home']);
    } catch (error) {
      this.errorMessage = 'Ocurrió un error al guardar tu perfil.';
      console.error('Error al guardar perfil', error);
    } finally {
      this.isLoading = false;
    }
  }
}