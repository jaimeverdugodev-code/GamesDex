# Arquitectura y Capas: GamesDex

## 1. Arquitectura General del Sistema
[cite_start]GamesDex adopta un modelo de arquitectura **Serverless** basado en **Backend as a Service (BaaS)** gestionado por **Firebase**[cite: 72, 223]. [cite_start]Esta estructura permite una sincronización de datos en tiempo real y delega la infraestructura del servidor para centrar el desarrollo en el cliente[cite: 72, 77].

## 2. Arquitectura del Cliente (Frontend)
[cite_start]La aplicación utiliza una arquitectura organizada por capas dentro del framework **Angular**, lo que facilita el mantenimiento y la escalabilidad del código[cite: 72, 202].

### A. Capa de Presentación (UI Responsiva)
* [cite_start]**Tecnologías:** Construida mediante componentes de **Angular e Ionic** (como `ion-grid` e `ion-card`)[cite: 73, 143].
* [cite_start]**Diseño:** Implementa una estrategia de **Diseño Responsivo (RWD)** que adapta la disposición de los elementos dinámicamente para monitores de escritorio, dispositivos Android y PWA mediante **CSS Grid y Flexbox**[cite: 74, 143, 222].
* [cite_start]**Experiencia de Usuario:** Incluye soporte nativo para **Modo Oscuro** y el uso de **Skeleton Loaders** para mejorar la percepción de rendimiento durante las cargas de datos[cite: 146, 190, 204].

### B. Capa de Lógica de Negocio (Core)
* [cite_start]**Gestión de Servicios:** La lógica principal reside en los **Services de Angular**, que actúan como la fuente de verdad para los componentes[cite: 75].
* [cite_start]**Programación Reactiva:** Se utiliza la librería **RxJS** (mediante Observables y Subjects) para administrar la reactividad de la aplicación y el flujo de datos asíncronos[cite: 76].

### C. Capa de Acceso a Datos
* [cite_start]**Comunicación Externa:** Emplea el módulo `HttpClient` para realizar peticiones REST a servicios externos como la **API de RAWG** (catálogo) y **Hugging Face** (IA de recomendaciones)[cite: 77, 177, 179].
* [cite_start]**Persistencia Cloud:** Utiliza la librería **AngularFire** para la integración segura con los servicios de **Firebase Auth** y la base de datos **Cloud Firestore**[cite: 77, 187, 205].

## 3. Stack Tecnológico de Despliegue
[cite_start]Para garantizar una experiencia unificada con una única base de código (HTML, SCSS y TypeScript), se utilizan las siguientes herramientas de compilación[cite: 202, 203]:
* **Ionic Framework:** Para componentes de interfaz móvil de alta calidad.
* [cite_start]**Capacitor:** Para empaquetar la aplicación y permitir su ejecución óptima en dispositivos Android y como aplicación web progresiva (PWA)[cite: 203, 222].