# Motor de Recomendaciones Personalizadas basado en IA y APIs concurrentes

## Descripcion general del modulo

GamesDex incorpora un motor de recomendaciones personalizadas que combina dos sistemas heterogeneos: un modelo de lenguaje de gran escala (LLM) alojado en la plataforma Hugging Face y la API REST de catalogo de videojuegos RAWG. La integracion de ambos sistemas no es trivial desde el punto de vista tecnico, ya que operan sobre dominios de datos completamente distintos. El presente apartado describe la arquitectura adoptada, los mecanismos de comunicacion implementados, el flujo de decision logica de la aplicacion y las tecnicas de programacion reactiva empleadas para garantizar una experiencia de usuario fluida y resiliente.

---

### 1. Arquitectura del sistema: el puente IA-API

El reto central del modulo reside en que el modelo de lenguaje --concretamente `Meta-Llama-3.3-70B-Instruct` de Meta AI, servido a traves del endpoint serverless de Hugging Face-- actua exclusivamente como motor de procesamiento de lenguaje natural. El modelo no dispone de acceso a bases de datos externas, no conoce los identificadores numericos de RAWG ni puede devolver imagenes ni metadatos estructurados. Su unica capacidad, en este contexto, es la de razonar sobre el dominio de los videojuegos y generar, a partir de un prompt de instruccion, una lista de titulos relevantes en formato de texto plano.

Este comportamiento impone una arquitectura en dos fases bien diferenciadas:

- **Fase 1 -- Generacion semantica (IA).** El sistema construye un prompt en ingles con instrucciones estrictas de formato y lo envia al LLM a traves de la API de Hugging Face (endpoint de tipo chat completions, compatible con el protocolo OpenAI). El modelo responde con un unico string de texto, sin numeracion ni explicaciones, cuya estructura es una secuencia de doce titulos de videojuegos separados por comas. Esta restriccion de formato se impone de forma explicita en el prompt del sistema y se refuerza con ejemplos few-shot.

- **Fase 2 -- Resolucion de metadatos (RAWG).** El string generado por el LLM se parsea y se transforma en un array de cadenas de texto. Cada titulo se utiliza como termino de busqueda en la API REST de RAWG, que si dispone de identificadores, portadas, puntuaciones y metadatos estructurados. El resultado final que se presenta al usuario proviene integramente de RAWG; la IA unicamente ha actuado como componente decisor intermedio.

Esta separacion de responsabilidades confiere al sistema una alta cohesion por capa: el `AiService` es el unico punto de contacto con Hugging Face y no gestiona imagenes ni rutas de navegacion; el `GameService` encapsula toda la logica de comunicacion con RAWG y no contiene logica de negocio sobre preferencias de usuario.

---

### 2. Evasion de restricciones de red: el proxy inverso local

La comunicacion directa desde una aplicacion Angular ejecutada en el navegador hacia un dominio externo como `router.huggingface.co` esta bloqueada por la politica de seguridad CORS (*Cross-Origin Resource Sharing*) del navegador cuando el servidor remoto no incluye las cabeceras de permiso adecuadas para el origen del cliente. Para resolver este bloqueo sin modificar la infraestructura del servidor externo ni exponer credenciales en una capa intermedia de backend propia, se implemento un **proxy inverso local** mediante la funcionalidad nativa del servidor de desarrollo de Angular CLI.

La configuracion se define en el fichero `proxy.conf.json`, ubicado en la raiz del proyecto:

```json
{
  "/hf-api": {
    "target": "https://router.huggingface.co",
    "changeOrigin": true,
    "pathRewrite": { "^/hf-api": "" },
    "secure": true
  }
}
```

El servidor de desarrollo de Angular CLI actua como intermediario: todas las peticiones del cliente Angular dirigidas al prefijo `/hf-api` son interceptadas y reenviadas por el propio proceso Node.js hacia `router.huggingface.co`, reescribiendo la ruta y anadiendo la cabecera `Host` correcta mediante la opcion `changeOrigin`. Dado que la peticion sale del proceso de Node.js y no del navegador, no esta sujeta a la politica CORS. La respuesta de Hugging Face retorna al servidor de desarrollo, que la reenvía al cliente Angular como si procediera del mismo origen.

En el `AiService`, la URL base del endpoint refleja este prefijo de proxy:

```typescript
private readonly hfUrl = '/hf-api/sambanova/v1/chat/completions';
```

Este mecanismo es suficiente para el entorno de desarrollo y presentacion del proyecto. En un despliegue en produccion, el proxy inverso deberia ser reemplazado por un componente de backend (por ejemplo, una Cloud Function o un servidor Express) que gestione las credenciales de forma segura y centralizada.

---

### 3. Flujo de decision logica: arbol de fallback personalizado

La personalizacion de las recomendaciones se articula mediante un arbol de decisiones que se evalua en el metodo `refreshUserData` del componente `HomePage`, ejecutado cada vez que el usuario entra en la pantalla principal. El objetivo es maximizar la relevancia del resultado utilizando la senal contextual de mayor calidad disponible para cada usuario concreto.

El arbol de decisiones sigue la siguiente jerarquia de prioridad:

1. **Prioridad 1 -- Coleccion del usuario.** Si el usuario tiene al menos un juego registrado en su biblioteca personal (coleccion almacenada en Firestore), el sistema toma los tres registros anadidos mas recientemente, ordenados por su timestamp `addedAt`. A continuacion, resuelve los nombres de esos juegos mediante llamadas a `getGameDetails` de RAWG y construye el prompt de IA con esos titulos como contexto:
   ```
   Based on these games: [X, Y, Z], suggest exactly 12 similar top-rated masterpieces.
   ```
   Este enfoque produce las recomendaciones mas personalizadas, ya que el modelo infiere los gustos del usuario a partir de su historial real.

2. **Prioridad 2 -- Generos favoritos.** Si el usuario no tiene juegos en su coleccion pero si ha declarado generos favoritos durante el proceso de onboarding, el sistema construye el prompt con esos generos como parametro:
   ```
   Reply with ONLY a comma-separated list of exactly 12 popular video game titles
   from these genres: [Action, RPG, ...].
   ```
   Esta ruta produce recomendaciones acordes con las preferencias declaradas, aunque con menor especificidad que la ruta anterior.

3. **Fallback -- Datos genericos de RAWG.** Si el usuario no cumple ninguna de las condiciones anteriores (cuenta sin configurar o sin historial), la seccion "Para Ti" muestra los resultados del endpoint `getForYouGames` de RAWG, que devuelve los juegos con mejor puntuacion Metacritic del ultimo ano. Este resultado es identico para todos los usuarios en ese estado, pero garantiza que la seccion nunca aparezca vacia.

La implementacion de este arbol utiliza sentencias `if / else if` sincronas sobre los datos ya resueltos (coleccion y perfil), cargados previamente mediante `firstValueFrom` sobre los observables de Firestore. Esto evita la complejidad de gestionar multiples cadenas reactivas anidadas para la logica de seleccion.

---

### 4. Asincronia avanzada y programacion reactiva con RxJS

Este es el punto tecnicamente mas significativo del modulo. La transformacion de un string de texto generado por la IA en un array de objetos `Game` con metadatos completos requiere una cadena de operadores RxJS que combina concurrencia, transformacion y manejo de errores en un pipeline declarativo.

El flujo completo, desde la respuesta del LLM hasta la actualizacion de la vista, sigue los pasos siguientes:

1. **Parseo del string.** El metodo `parse` del `AiService` recibe el campo `choices[0].message.content` de la respuesta del modelo, que contiene el string de doce titulos. Lo divide por comas mediante `split(',')`, limpia caracteres no deseados (comillas, numeracion residual) con una expresion regular, y filtra elementos vacios o excesivamente largos. El resultado es un `string[]` de hasta doce titulos normalizados.

2. **Transformacion del observable con `switchMap`.** El observable que emite el array de titulos se encadena con el operador `switchMap`, que cancela cualquier suscripcion anterior y proyecta el valor emitido en un nuevo observable: la llamada a `getGamesByTitles`. Esto garantiza que si el componente se destruye o el usuario navega a otra pantalla antes de que la IA responda, las peticiones pendientes se cancelan automaticamente, evitando memory leaks y actualizaciones de estado sobre componentes desmontados.

3. **Concurrencia controlada con `forkJoin`.** El metodo `getGamesByTitles` del `GameService` recibe el array de titulos y construye un array de doce observables independientes, uno por cada titulo. Cada observable realiza una peticion HTTP `GET` a la API de RAWG con el titulo como termino de busqueda y extrae el primer resultado (`results[0]`). El operador `forkJoin` suscribe a todos los observables de forma simultanea y emite un unico array cuando el ultimo de ellos completa. Esto significa que las doce peticiones HTTP se ejecutan en paralelo, no en secuencia, reduciendo el tiempo total de resolucion al de la peticion mas lenta en lugar de a la suma de todas.

```typescript
// GameService — getGamesByTitles
const searches$ = titles.map(title => {
  const params = new HttpParams()
    .set('key', environment.rawgApiKey)
    .set('search', title.trim())
    .set('page_size', 1);
  return this.http.get<RawgResponse>(`${this.baseUrl}/games`, { params }).pipe(
    map(res => res.results?.[0] ?? null),
    catchError(() => of(null))
  );
});

return forkJoin(searches$).pipe(
  map(results => results.filter(
    (g): g is Game =>
      g !== null &&
      (g.rating > 0 || (g.metacritic != null && g.metacritic > 50))
  ))
);
```

El uso de `catchError(() => of(null))` a nivel de cada observable individual es deliberado: si una de las doce peticiones falla (por timeout, error de red o titulo no encontrado en RAWG), el error se absorbe localmente y se sustituye por `null`. El `forkJoin` puede completar igualmente con los once resultados restantes. Sin este tratamiento, un unico error en cualquiera de los observables internos cancelaria el `forkJoin` completo y descartaria todos los resultados obtenidos hasta ese momento.

El pipeline completo desde el componente `HomePage` queda expresado de forma declarativa:

```typescript
// HomePage — refreshUserData (rama coleccion)
forkJoin(recent.map(ug =>
  this.gameService.getGameDetails(ug.gameId).pipe(catchError(() => of(null)))
)).pipe(
  switchMap(details => {
    const names = details.filter(g => g !== null).map(g => g!.name);
    if (names.length === 0) return of([]);
    return this.aiService.getRecommendationsByGames(names).pipe(
      switchMap(titles => this.gameService.getGamesByTitles(titles)),
      catchError(() => of([]))
    );
  }),
  catchError(() => of([])),
  takeUntil(this.destroy$)
).subscribe({
  next: (games) => { if (games.length > 0) this.forYouGames = games; }
});
```

---

### 5. Filtros de calidad y estrategia de experiencia de usuario no bloqueante

#### 5.1 Filtros de calidad (Quality Gates)

No todos los juegos que RAWG devuelve para un termino de busqueda arbitrario tienen una presencia relevante en el catalogo. Para evitar que titulos desconocidos u obscuros se cuelen en la seccion de recomendaciones personalizadas, se aplica un filtro de calidad sobre el array resultante del `forkJoin`:

```typescript
g !== null && (g.rating > 0 || (g.metacritic != null && g.metacritic > 50))
```

Un juego pasa el filtro unicamente si tiene una puntuacion de usuarios en RAWG (`rating > 0`) o una puntuacion Metacritic superior a 50. Los juegos que no cumplen ninguna de las dos condiciones se descartan del array final. Este criterio dual permite filtrar juegos sin masa critica de evaluaciones, pero es suficientemente permisivo como para no excluir juegos independientes de calidad que carezcan de puntuacion Metacritic.

#### 5.2 Interfaz no bloqueante y actualizacion reactiva transparente

La seccion "Para Ti" de la pantalla principal implementa una estrategia de carga en dos fases disenada para que el usuario perciba una respuesta inmediata sin tener que esperar a la resolucion completa del pipeline de IA:

- **Carga rapida (RAWG).** Al inicializar el componente (`ngOnInit`), se lanza una peticion directa a `getForYouGames` de RAWG, que tipicamente resuelve en menos de un segundo. Los datos se asignan a `forYouGames` y el indicador `loadingForYou` se pone a `false`, eliminando el skeleton y mostrando el contenido inmediatamente.

- **Enriquecimiento asincrono (IA).** En paralelo, desde `ionViewWillEnter`, se inicia el pipeline de IA (construccion del prompt, llamada a Hugging Face, parseo, doce peticiones concurrentes a RAWG, filtrado). Este proceso puede tardar varios segundos. Cuando completa, si el resultado contiene al menos un juego, la propiedad `forYouGames` se sobreescribe con los datos de la IA. Angular detecta el cambio de referencia del array y actualiza la vista de forma reactiva sin que el usuario perciba ningun flash ni pantalla de carga adicional.

Este patron se denomina habitualmente **actualizacion optimista diferida**: la interfaz presenta datos de calidad suficiente de forma inmediata y los refina en segundo plano cuando dispone de informacion de mayor relevancia.

#### 5.3 Degradacion elegante ante fallos

Cada punto de fallo del pipeline esta cubierto por un operador `catchError` que devuelve `of([])`, un observable que emite un array vacio y completa sin propagar el error. Esto garantiza que:

- Si la API de Hugging Face no esta disponible, el pipeline devuelve un array vacio, la condicion `if (games.length > 0)` no se cumple, y `forYouGames` conserva los datos de RAWG ya cargados. El usuario no percibe ningun error.
- Si alguna de las doce peticiones paralelas a RAWG falla individualmente, el error se absorbe y el juego correspondiente se excluye del resultado, sin afectar al resto del pipeline.
- Si el modelo genera un string malformado o vacio, el parser devuelve un array vacio, `getGamesByTitles` retorna `of([])` inmediatamente por la guarda `if (!titles || titles.length === 0)`, y el sistema recae en los datos de RAWG.

En ningun escenario de fallo se interrumpe la experiencia de usuario ni se presenta un estado de error visible. La aplicacion degrada elegantemente al nivel de funcionalidad inmediatamente inferior disponible, siguiendo el principio de **degradacion progresiva** (*progressive degradation*) propio de las arquitecturas resilientes.

---

### Diagrama de flujo resumido

```
Usuario entra en Home
        |
        +---> [ngOnInit] getForYouGames (RAWG) -----> forYouGames = datos RAWG
        |                                              loadingForYou = false
        |
        +---> [ionViewWillEnter] refreshUserData()
                    |
                    v
            Tiene coleccion?
            /           \
          SI              NO
          |               |
          v               v
    3 juegos recientes  Tiene generos?
    --> getGameDetails   /        \
    --> nombres        SI          NO
          |            |            |
          v            v            v
      getRecommendations  getPersonalizedRecs  [fin: RAWG se mantiene]
      ByGames (IA)        (IA)
          |            |
          +-----------+
                |
                v
         switchMap --> getGamesByTitles
                |
                v
         forkJoin [12 peticiones paralelas RAWG]
                |
                v
         Filtro de calidad (rating/metacritic)
                |
                v
         games.length > 0?
         /            \
        SI              NO
        |               |
        v               v
  forYouGames =    [RAWG se mantiene]
  datos IA
```
