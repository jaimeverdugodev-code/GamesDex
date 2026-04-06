# Arquitectura del Sistema: GamesDex

## 1. Modelo de Arquitectura General
* [cite_start]El proyecto adopta una arquitectura Serverless de tipo Backend as a Service (BaaS) gestionada íntegramente por Firebase[cite: 72].
* [cite_start]Se combina con una arquitectura por capas en el cliente (Frontend) utilizando el framework Angular[cite: 6, 72].
* [cite_start]Esta estructura garantiza que GamesDex funcione de manera óptima tanto en dispositivos Android como en formato PWA (Progressive Web App)[cite: 202, 203, 222].

## 2. Descripción de las Capas (Frontend)

### A. Capa de Presentación (UI Responsiva)
* [cite_start]Se construye utilizando componentes nativos de Angular e Ionic, como `ion-grid` y `ion-card`[cite: 73].
* [cite_start]Implementa una Arquitectura de Diseño Responsivo (RWD) que se adapta dinámicamente mediante directivas y el uso de CSS Grid y Flexbox[cite: 74, 142, 143].
* [cite_start]Incluye elementos de experiencia de usuario modernos como "Modo Oscuro" nativo y "Skeleton Loaders" para gestionar los tiempos de carga[cite: 29, 43, 146, 204].
* [cite_start]Gestión de Imágenes de Perfil: Integración de la librería ngx-image-cropper para permitir al usuario ajustar, recortar y optimizar su foto de perfil antes de ser procesada y almacenada.

### B. Capa de Lógica de Negocio (Core)
* [cite_start]La lógica interna y el estado de la aplicación son gestionados exclusivamente por los Services de Angular[cite: 75, 124].
* [cite_start]Administra la reactividad del sistema utilizando la librería RxJS mediante el uso de Observables y Subjects[cite: 76].
* [cite_start]Aquí se procesan las reglas de filtrado de juegos y la lógica de interacción social (seguidores/reseñas)[cite: 28, 52, 64].
* [cite_start]Procesamiento de Media: Implementación de lógica de compresión y conversión de imágenes a Base64. Se asegura que el archivo resultante sea ligero para ser persistido directamente en el documento del usuario sin exceder el límite de 1MB por entrada de Firestore.

### C. Capa de Acceso a Datos
* [cite_start]Utiliza el módulo `HttpClient` de Angular para realizar peticiones REST a servicios externos como RAWG y Hugging Face[cite: 77, 177].
* [cite_start]Emplea la librería `AngularFire` para la sincronización y persistencia de datos en tiempo real con la base de datos NoSQL de Firebase[cite: 77].

## 3. Integración de Servicios Externos
* [cite_start]**API RAWG/IGDB:** Proporciona el catálogo detallado de videojuegos, portadas y sinopsis a través de endpoints GET[cite: 27, 175, 178].
* [cite_start]**API de IA (Hugging Face):** Recibe el dataset de preferencias del usuario mediante peticiones POST para devolver recomendaciones personalizadas[cite: 179, 180, 191].
* [cite_start]**Firebase Auth:** Gestiona la autenticación segura mediante Email/Contraseña y proveedores sociales como Google[cite: 26, 187, 205].