# Configurar Firebase + Cloud Firestore para un proyecto JavaScript

> **Módulo 7 — Lección 2** · Guía previa a [en-vivo-2-cifrado-y-firestore.html](en-vivo-2-cifrado-y-firestore.html)

---

## Antes de tocar una sola línea de código

Vamos a dejar algo claro desde el principio: **Firebase no es una base de datos**. Firebase es una PLATAFORMA de Google que agrupa varios servicios — autenticación, almacenamiento de archivos, hosting, funciones serverless — y entre ellos hay dos bases de datos distintas.

La que vamos a usar se llama **Cloud Firestore**. ¿Y por qué esta y no la otra? Porque Firestore es una base de datos **NoSQL orientada a documentos**, y eso cambia por completo cómo piensas tus datos:

| Mundo SQL (lo que ya conoces) | Mundo Firestore |
| --- | --- |
| Base de datos | Base de datos |
| Tabla | **Colección** |
| Fila / registro | **Documento** |
| Columna | **Campo** |
| Esquema rígido y obligatorio | Sin esquema fijo — cada documento puede tener campos distintos |
| `JOIN` entre tablas | No existe el `JOIN`. Se desnormaliza o se usan subcolecciones |

Un documento es, en la práctica, un objeto JSON con un ID. Una colección es una bolsa de documentos.

```
personas (colección)
 ├── a1b2c3 (documento)  →  { nombre: "Ana",  edad: 28, activo: true }
 └── d4e5f6 (documento)  →  { nombre: "Luis", edad: 34, email: "luis@mail.cl" }
```

¿Ves que el segundo documento tiene `email` y el primero no? En SQL eso te explota. Acá es perfectamente válido.

**Esto tiene una consecuencia que la gente descubre tarde y a golpes:** si no hay esquema, la base de datos NO te va a proteger de tus propios errores. Si hoy guardas `edad: 28` y mañana guardas `edad: "28"`, Firestore acepta los dos sin chistar, y tu filtro `where("edad", ">", 18)` va a ignorar silenciosamente el segundo. La consistencia de tipos pasa a ser responsabilidad TUYA, en el código. Ya te lo estoy diciendo ahora para que no lo aprendas debuggeando a las 2 de la mañana.

Con eso entendido, ahora sí: a la consola.

---

## Paso 1 — Crear el proyecto en Firebase

![Crear un proyecto en la consola de Firebase](assets/firebase-setup/01-crear-proyecto.gif)

**Qué pasa en el GIF, paso a paso:**

1. Se entra a [firebase.google.com](https://firebase.google.com) y se hace clic en **Ir a la consola** (o *Get started in console*). Necesitas una cuenta de Google — la misma de Gmail sirve.
2. Botón **Crear un proyecto**.
3. Se escribe el nombre del proyecto. En el GIF es `curso-vue-v2`.
4. Firebase genera automáticamente un **ID único** debajo del nombre (algo como `curso-vue-v2-7b53f`). Fíjate bien en ese detalle: el nombre es para que TÚ lo leas; el ID es el que usa Google internamente y el que va a aparecer en tu configuración. **No son lo mismo y el ID no se puede cambiar después.**
5. Se avanza por los pasos siguientes (Gemini en Firebase, Google Analytics). Para este curso puedes desactivar Analytics sin problema — es un servicio de métricas que no aporta nada a lo que vamos a hacer y agrega ruido a la configuración.
6. Aparece **"Estamos preparando tu proyecto"** y luego **"Terminando..."**. Esto demora entre 30 y 60 segundos. Google está aprovisionando infraestructura real detrás de escena, así que paciencia.
7. Llegas al **panel del proyecto**. Arriba del todo verás la etiqueta **Plan Spark**.

### Sobre el Plan Spark

Spark es el plan **gratuito** de Firebase. Sin tarjeta de crédito, sin cobros sorpresa. Sus límites diarios para Firestore son más que suficientes para aprender:

- 50.000 lecturas de documentos por día
- 20.000 escrituras por día
- 20.000 eliminaciones por día
- 1 GiB de almacenamiento

Cuando superas el límite, Firebase simplemente deja de responder hasta el día siguiente. **No te cobra.** Esa es exactamente la propiedad que quieres mientras estás aprendiendo.

> ⚠️ **Ojo con las lecturas:** en Firestore una "lectura" es UN DOCUMENTO, no una consulta. Si haces un `getDocs()` sobre una colección de 500 documentos, acabas de gastar 500 lecturas de tu cuota. Un componente mal hecho que recarga esa lista en cada render te funde las 50.000 en minutos. Esto no es teoría: es el error #1 de quienes recién parten con Firestore.

---

## Paso 2 — Crear la base de datos Cloud Firestore

![Crear una base de datos en Cloud Firestore](assets/firebase-setup/02-crear-firestore.gif)

Tener el proyecto creado **no** significa que tengas base de datos. Son dos cosas separadas y hay que activarla explícitamente.

**Qué pasa en el GIF, paso a paso:**

1. En el menú lateral izquierdo se despliega **Compilación → Bases de datos y almacenamiento**. Ahí aparecen varias opciones: *SQL Connect* (PostgreSQL), *Firestore*, *Realtime Database* y *Storage*.
2. Se elige **Firestore**. Ojo, **NO** *Realtime Database* — esa es la base de datos antigua de Firebase, con otra API completamente distinta. El 90% de los tutoriales rotos de internet mezclan las dos. Nosotros usamos **Firestore**.
3. En la pantalla de bienvenida de Cloud Firestore, botón **Crear base de datos**.
4. Se abre un asistente de 3 pasos:

   **① Seleccionar edición** → deja **Standard**. La edición Enterprise es para cargas de trabajo grandes con compatibilidad MongoDB y no aplica al plan gratuito.

   **② ID y ubicación de la base de datos**
   - *ID de la base de datos*: déjalo en `(default)`. Un proyecto puede tener varias bases de datos, pero la primera siempre es la default y es la que el SDK toma sin configuración extra.
   - *Ubicación*: acá se elige la región física donde vivirán tus datos. En el GIF se despliega la lista completa (`nam5`, `europe-west1`, `southamerica-east1`, etc.).

   > 🚨 **LA UBICACIÓN NO SE PUEDE CAMBIAR NUNCA MÁS.** Ni renombrando, ni desde consola, ni pidiéndoselo a Google. Si te equivocas, la única salida es borrar el proyecto y empezar de cero. Piénsalo 5 segundos antes de hacer clic. Para Chile, `southamerica-east1 (São Paulo)` da la menor latencia; `nam5 (United States)` es la opción por defecto y funciona perfecto para aprender.

   **③ Configurar** → acá eliges cómo nacen tus reglas de seguridad, y esto merece su propia sección.

5. Botón **Crear**, unos segundos de espera, y llegas al panel con el mensaje **"Tu base de datos está lista. Solo tienes que agregar datos"** y un botón **+ Iniciar colección**.

### Modo de producción vs. modo de prueba

El asistente te obliga a elegir entre dos, y la diferencia es ABISMAL:

**Iniciar en modo de producción** — todo bloqueado:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;   // ← nadie entra
    }
  }
}
```

**Comenzar en modo de prueba** — todo abierto, con fecha de vencimiento:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 8, 29);  // ← 30 días
    }
  }
}
```

En el GIF se elige **modo de prueba**, y la consola muestra la advertencia amarilla textual: *"Las reglas de seguridad predeterminadas del modo de prueba permiten que cualquier persona con acceso a la referencia de tu base de datos pueda ver, editar y borrar todos los datos de esta durante los siguientes 30 días"*.

Léelo otra vez. **CUALQUIER PERSONA.** No "cualquier persona autenticada". Cualquiera.

Para una clase es la decisión correcta, porque queremos escribir código y ver datos moviéndose sin pelear con permisos. Pero anota esto: **el día 31 tu app deja de funcionar de golpe**, y vas a ver errores `permission-denied` sin haber tocado nada. No es un bug. Es la fecha que expiró. Volvemos sobre esto en la sección de seguridad.

---

## Paso 3 — Registrar la app web y obtener las credenciales

![Obtener las credenciales de Firebase para una app web](assets/firebase-setup/03-credenciales-web.gif)

Tu base de datos existe, pero tu proyecto JavaScript todavía no tiene cómo encontrarla. Falta registrar una **app web** dentro del proyecto Firebase.

**Qué pasa en el GIF, paso a paso:**

1. Desde el panel de la base de datos se va al ⚙️ **engranaje de Configuración** (arriba a la izquierda, junto al nombre del proyecto) → **Configuración del proyecto**.
2. En la pestaña **General**, se baja hasta la sección **Tus apps** y se hace clic en el ícono **`</>`** (Web). Ese ícono es el que importa: hay uno para iOS, otro para Android y otro para Web. El nuestro es `</>`.
3. Se le pone un apodo a la app y se registra. *(La casilla de Firebase Hosting es opcional — no la necesitas ahora.)*
4. Firebase te muestra la pantalla **"Agrega Firebase a tu app web"** con dos partes:
   - **Instalar el SDK**: `npm install firebase` (con la pestaña *Usar npm* seleccionada) o la alternativa con etiqueta `<script>`.
   - **El objeto `firebaseConfig`**: acá está el tesoro. Un bloque de código con `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` y `appId`.
5. Se usa el **ícono de copiar** de la esquina del bloque, y listo. Esa configuración es la que va a tu proyecto.

### Qué es cada campo del `firebaseConfig`

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",                          // identifica tu proyecto ante la API de Google
  authDomain:        "tu-proyecto-xxxxx.firebaseapp.com",  // dominio para el flujo de autenticación
  projectId:         "tu-proyecto-xxxxx",                  // el ID único — el que Firestore usa para enrutar
  storageBucket:     "tu-proyecto-xxxxx.firebasestorage.app", // bucket de Cloud Storage (archivos)
  messagingSenderId: "152554295202",                       // ID para notificaciones push (FCM)
  appId:             "1:152554295202:web:5d65dab80f85cbb24eecfb" // identifica ESTA app web en particular
};
```

> ¿Se puede volver a ver esto después? Sí. **⚙️ Configuración del proyecto → General → Tus apps → Configuración del SDK**. No hay que crear una app nueva cada vez, así que no la pierdas de vista ni la andes duplicando.

---

## Conectar el proyecto JavaScript

### 1. Instalar el SDK

```bash
npm install firebase
```

### 2. Crear un módulo de conexión — y crear UNO SOLO

```js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "tu-proyecto-xxxxx.firebaseapp.com",
  projectId:         "tu-proyecto-xxxxx",
  storageBucket:     "tu-proyecto-xxxxx.firebasestorage.app",
  messagingSenderId: "152554295202",
  appId:             "1:152554295202:web:5d65dab80f85cbb24eecfb"
};

// initializeApp se ejecuta UNA vez en toda la aplicación
const app = initializeApp(firebaseConfig);

// getFirestore devuelve la instancia de la base de datos
export const db = getFirestore(app);
```

**¿Por qué un archivo separado y no la configuración pegada en cada componente?** Porque `initializeApp()` debe ejecutarse **una sola vez** en el ciclo de vida de tu app. Si lo llamas dos veces, Firebase lanza un error `duplicate-app`. Al ponerlo en un módulo y exportar `db`, el sistema de módulos de ES **cachea la evaluación**: el archivo se ejecuta la primera vez que alguien lo importa y todas las importaciones siguientes reciben la misma instancia ya construida. No es una convención estética — es el patrón **Singleton** resuelto gratis por el módulo.

### 3. Usarlo

```js
// src/main.js
import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

// CREAR un documento (Firestore genera el ID automáticamente)
const docRef = await addDoc(collection(db, "personas"), {
  nombre: "Ana",
  edad: 28,
  activo: true
});
console.log("Documento creado con ID:", docRef.id);

// LEER todos los documentos de la colección
const snapshot = await getDocs(collection(db, "personas"));
snapshot.forEach((doc) => {
  console.log(doc.id, "=>", doc.data());
});
```

Fíjate en un detalle que confunde a mucha gente: **la colección `"personas"` no la creaste en ningún lado**. En Firestore las colecciones no se declaran — nacen solas cuando insertas el primer documento, y desaparecen solas cuando borras el último. Otra vez: sin esquema, sin ceremonia, sin red de seguridad.

### Si usas Vite (recomendado): variables de entorno

```bash
# .env.local  ← agrégalo a .gitignore
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto-xxxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=152554295202
VITE_FIREBASE_APP_ID=1:152554295202:web:5d65dab80f85cbb24eecfb
```

```js
// src/firebase.js
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID
};
```

> El prefijo `VITE_` es **obligatorio**. Vite solo expone al navegador las variables que empiezan así — es un filtro deliberado para que no se te escape una variable de servidor al bundle del cliente. Sin el prefijo, `import.meta.env.MI_VARIABLE` te devuelve `undefined` y vas a perder media hora buscando el error en el lugar equivocado.

---

## 🔐 La parte que nadie lee y todos deberían: seguridad

### La `apiKey` de Firebase NO es una contraseña

Sé perfectamente lo que estás pensando: *"¡pero estoy poniendo una API key en el código del navegador, eso es un desastre de seguridad!"*.

Es una duda excelente, es la duda correcta, y en el 99% de las APIs tendrías toda la razón. Pero acá no. Y te explico técnicamente POR QUÉ:

La `apiKey` de Firebase **no autentica ni autoriza a nadie**. Lo único que hace es IDENTIFICAR a qué proyecto de Google le estás hablando. Es una dirección, no una llave. Google lo dice de forma explícita en su documentación oficial, y es inevitable por diseño: el SDK corre en el navegador del usuario, así que cualquier persona puede abrir DevTools, ir a la pestaña Network y verla. No existe forma de esconderla. Toda app de Firebase en producción, en el mundo entero, tiene su `apiKey` visible en el bundle.

**Entonces, ¿qué te protege de verdad?**

### Las Security Rules. Ellas y nada más.

Las Security Rules son código que corre **en los servidores de Google**, del lado que el usuario no controla. Son el equivalente a la lógica de autorización de tu backend. Y esto lleva a la conclusión más importante de todo este documento:

> **En Firestore, las Security Rules SON tu backend de autorización.**
> No son un extra ni un "nice to have". Si están abiertas, tu base de datos está abierta al mundo entero — y ninguna cantidad de ofuscación en el cliente lo va a arreglar.

Cuando arranques en modo de prueba, tienes **30 días**. Antes de que se acaben (o antes de publicar cualquier cosa), anda a **Firestore → pestaña Reglas** y escribe reglas de verdad:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Lectura pública, escritura solo para usuarios autenticados
    match /personas/{personaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Cada usuario solo puede tocar SU propio documento
    match /usuarios/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

**Regla de oro:** nunca dejes `allow read, write: if true;` en un proyecto que esté publicado en internet. Eso no es una base de datos, es un formulario público para que cualquiera te borre todo.

### Sobre estos GIFs y las credenciales que se ven en pantalla

En el tercer GIF se alcanza a leer el `firebaseConfig` real de un proyecto. Aprovechemos el momento didáctico: **eso no constituye una filtración de secretos**, por todo lo que acabamos de explicar — esa configuración es pública por diseño.

Pero — y este pero es enorme — **si esa base de datos está en modo de prueba, cualquiera que vea el GIF puede leer y escribir en ella hasta que las reglas expiren.** El problema nunca fue la `apiKey` expuesta. El problema son las reglas abiertas. Son dos cosas distintas y hay que tenerlas separadas en la cabeza.

Si vas a compartir capturas o GIFs de un proyecto en modo de prueba: cierra las reglas primero, o usa un proyecto desechable para las demos. Es así de simple.

---

## Errores típicos y cómo resolverlos

| Error | Causa real | Solución |
| --- | --- | --- |
| `Missing or insufficient permissions` | Las reglas de seguridad te están bloqueando. Si funcionaba antes y hoy no, se te vencieron los 30 días del modo de prueba | Revisa **Firestore → Reglas** y ajusta según el acceso que necesites |
| `Firebase: No Firebase App '[DEFAULT]' has been created` | Estás usando `getFirestore()` antes de que corriera `initializeApp()` | Importa siempre `db` desde tu módulo `firebase.js`, nunca crees la instancia por tu cuenta |
| `Firebase App named '[DEFAULT]' already exists` | Llamaste a `initializeApp()` más de una vez | Un solo archivo de configuración exportando la instancia. Es el patrón Singleton |
| `import.meta.env.VITE_...` devuelve `undefined` | Falta el prefijo `VITE_`, o no reiniciaste el servidor de desarrollo | Agrega el prefijo y reinicia `npm run dev`. Vite lee el `.env` solo al arrancar |
| `Failed to get document because the client is offline` | Sin conexión, o un bloqueador/extensión está cortando las peticiones a Google | Revisa la red y desactiva bloqueadores de anuncios en `localhost` |
| Los datos se guardan pero no aparecen en la consola web | Estás mirando otra base de datos u otro proyecto | Verifica el `projectId` de tu config contra el selector de proyecto de la consola |

---

## Checklist final

- [ ] Proyecto creado en la consola de Firebase
- [ ] Base de datos **Cloud Firestore** creada (no Realtime Database)
- [ ] Ubicación elegida a conciencia — **es irreversible**
- [ ] App **web (`</>`)** registrada dentro del proyecto
- [ ] `firebaseConfig` copiado desde ⚙️ Configuración del proyecto → General
- [ ] `npm install firebase` ejecutado
- [ ] `src/firebase.js` creado con UNA sola llamada a `initializeApp()`
- [ ] Credenciales en `.env.local` y `.env.local` dentro de `.gitignore`
- [ ] **Recordatorio anotado: las reglas de prueba vencen en 30 días**

---

## Para seguir

- [Documentación oficial de Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Guía de Security Rules](https://firebase.google.com/docs/rules)
- [Por qué la apiKey de Firebase puede ser pública](https://firebase.google.com/docs/projects/api-keys)

