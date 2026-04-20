# GamesDex 🎮
> Una plataforma social tipo Letterboxd para el sector del videojuego, con motor de descubrimiento y recomendación por IA.

## 📝 Descripción del Proyecto
Este proyecto es un **Trabajo de Fin de Ciclo / Grado** desarrollado en el **IES Rafael Alberti**. Consiste en una aplicación multiplataforma (Web, iOS y Android) construida con **Angular e Ionic Framework**. 

**GamesDex** permite a los usuarios gestionar su colección personal de videojuegos, interactuar con una comunidad a través de un sistema de seguidores y reseñas, y recibir recomendaciones hiperpersonalizadas generadas mediante Inteligencia Artificial.

---

## 📑 Planificación y Análisis

### A. Recopilación de Información 📚
Se ha investigado el estado del arte de las aplicaciones de gestión de ludotecas (como *Backloggd* o *HowLongToBeat*). Para la construcción del ecosistema se han seleccionado las siguientes herramientas:
* **APIs de Datos:** Selección de **RAWG Video Games Database API** por su extensa base de datos y endpoints optimizados.
* **Inteligencia Artificial:** Evaluación de modelos LLM (ej. OpenAI / Gemini) para el procesamiento de la biblioteca del usuario y generación de recomendaciones algorítmicas.
* **Referentes de UX/UI:** Diseño *Mobile-First* inspirado en redes sociales modernas, primando la velocidad y el diseño visual oscuro (Dark Mode).

### B. Estudio de Viabilidad Técnica ⚙️
El proyecto se considera viable utilizando el stack **Ionic + Angular + Firebase**:
* **Multiplataforma:** Un solo código base genera aplicaciones nativas y web progresivas (PWA).
* **Escalabilidad y Tiempo Real:** Firebase Firestore permite gestionar relaciones sociales (Seguidores/Siguiendo) y reseñas con actualizaciones en tiempo real sin necesidad de gestionar servidores propios.
* **Seguridad:** Reglas de base de datos estrictas integradas con Firebase Authentication y gestión de Roles (Usuarios vs. Administradores).

### C. Fases y Plazos de Ejecución 📅
El desarrollo se rige por una metodología ágil e iterativa dividida en 6 fases a lo largo de 12 semanas:
1. **Fase 1:** Análisis, Diseño (Figma) y Base de Datos.
2. **Fase 2:** Arquitectura base y Setup (Angular, Ionic, Firebase).
3. **Fase 3:** Desarrollo Core (Auth, Buscador RAWG, Detalles del Juego y Colección).
4. **Fase 4:** Desarrollo Social (Perfiles dinámicos, Sistema Follow/Unfollow, Reseñas).
5. **Fase 5:** Funcionalidades Avanzadas (Dashboard de Administrador y Motor IA).
6. **Fase 6:** Refactorización, Pruebas UX/UI y Memoria Final.

### D. Objetivos y Alcance 🎯
* **Objetivo:** Crear una red social de nicho donde la comunidad pueda registrar su actividad *gamer* y descubrir nuevos títulos.
* **Alcance:** - Autenticación segura.
  - Buscador global y vistas de detalle por juego.
  - Gestión de biblioteca personal.
  - Sistema relacional (Seguidores/Siguiendo).
  - Sistema de publicación de reseñas y calificaciones (1-5 estrellas).
  - Panel de control para Administradores.
  - Recomendaciones inteligentes mediante IA.

### E. Actividades de Desarrollo 🛠️
* Configuración del entorno de trabajo y control de versiones (Git).
* Modelado de datos NoSQL en Firestore (`users`, `user_games`, `follows`, `reviews`).
* Desarrollo de componentes UI reutilizables (GameCards, Modales, Skeletons de carga).
* Implementación de Guards de Angular para protección de rutas.

### F. Recursos Necesarios 📦
* **Hardware:** PC de desarrollo, dispositivo móvil para pruebas de diseño responsivo.
* **Software:** VS Code, Chrome DevTools, Firebase Console, Figma, Git.
* **Personales:** Jaime Verdugo Serrano (Full-Stack Developer).

### G. Financiación y Presupuesto 💰
* **Costes de Infraestructura:** 0€ (Aprovechamiento de los niveles gratuitos: Firebase Spark Plan, RAWG Free Tier, Free Tier de API de IA).
* **Coste de Desarrollo:** Autofinanciado (Estimación aproximada de 300 horas de planificación, diseño y desarrollo).

---

## 🚀 Stack Tecnológico
* **Frontend:** Angular 17+ & Ionic Framework (TypeScript, SCSS, HTML5).
* **Backend (BaaS):** Firebase (Firestore Database, Authentication).
* **APIs Externas:** RAWG API (Catálogo) & Integración IA.

---

## 🛠️ Instalación y Ejecución Local
Para levantar el proyecto en tu entorno local, sigue estos pasos:

---

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/GamesDex.git](https://github.com/tu-usuario/GamesDex.git)
   ```
   
2. Accede al directorio e instala las dependencias:
   ```bash
   cd GamesDex
   npm install
   ```
(Opcional) Configura tus variables de entorno en src/environments/environment.ts con tus credenciales de Firebase y tu API Key de RAWG.

3. Inicia el servidor de desarrollo:
   ```bash
   ionic serve
   ```
---


👤 Autor
Nombre: Jaime Verdugo Serrano

Correo: jaimeverdugo.dev@gmail.com

Centro: IES Rafael Alberti
