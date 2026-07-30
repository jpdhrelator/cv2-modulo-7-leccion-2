# Backend Educativo Node.js + TypeScript

Este es un backend sencillo diseñado para practicar el consumo de APIs RESTful, manejo de tokens JWT y todos los métodos HTTP.

## 🚀 Cómo empezar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```
   El servidor correrá en `http://localhost:3001`.

## 🔐 Autenticación

Para realizar acciones de escritura (POST, PUT, PATCH, DELETE), necesitas un token.

- **Endpoint**: `POST /api/login`
- **Credenciales**:
  - `username`: `admin`
  - `password`: `admin123`
- **Respuesta**: Recibirás un `token`. Debes enviarlo en todos los demás requests en el header:
  `Authorization: Bearer <TU_TOKEN>`

## 🚀 Postman

Para importar rápidamente en Postman, puedes crear una nueva solicitud con estos detalles o usar la exportación de cURL:

### 1. Login (Obtener Token)
```bash
curl --location 'http://localhost:3001/api/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "admin123"
}'
```

### 2. Crear Item (Requiere Bearer Token)
```bash
curl --location 'http://localhost:3001/api/items' \
--header 'Authorization: Bearer <COPIA_EL_TOKEN_AQUI>' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Laptop Pro",
    "price": 2500,
    "description": "MacBook Pro M3",
    "category": "Computación"
}'
```

> [!TIP]
> En Postman, puedes ir a **Import** -> **Raw text** y pegar los comandos cURL anteriores para que se generen automáticamente las peticiones con sus headers.

## ⚓ API Endpoints (Recurso: Items)

| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/items` | Listar todos los items | No |
| **GET** | `/api/items/:id` | Ver un item por ID | No |
| **POST** | `/api/items` | Crear un nuevo item | **Sí** |
| **PUT** | `/api/items/:id` | Reemplazar item completo | **Sí** |
| **PATCH** | `/api/items/:id` | Actualización parcial | **Sí** |
| **DELETE** | `/api/items/:id` | Eliminar un item | **Sí** |

### Ejemplo de Body para POST/PUT:
```json
{
  "name": "Nuevo Producto",
  "price": 1500,
  "description": "Una descripción opcional",
  "category": "Electrónica"
}
```

## 🛠 Tecnologías usadas
- Node.js & TypeScript
- Express
- JSON Web Token (JWT)
- CORS (Habilitado para todos los origenes por defecto)
- dotenv

---

# 🎫 Recursos v2 — Tickets, Notas cifradas y Roles

Estos recursos se agregaron para la **actividad práctica** de la Lección 2.
Los endpoints de `/api/items` siguen intactos para los ejercicios de clase.

## 👥 Usuarios

| Usuario | Contraseña | Rol | Puede eliminar tickets |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `admin` | Sí |
| `operador` | `operador123` | `operador` | **No (403)** |

### Token de corta duración (para probar la expiración)

`POST /api/login` acepta un campo opcional `duracionMinutos`. Acepta decimales,
así que puedes pedir un token de 30 segundos y ver expirar la sesión en clase
sin esperar una hora:

```bash
curl -X POST http://localhost:3001/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123","duracionMinutos":0.5}'
```

## 🔑 Autenticación

| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Devuelve `{ token, duracionMinutos, usuario }` | No |
| **GET** | `/api/perfil` | Datos de la sesión y segundos restantes | **Sí** |
| **POST** | `/api/refresh` | Entrega un token nuevo | **Sí** |

> `GET /api/perfil` es una **lectura protegida**: sirve para comprobar que el
> interceptor del cliente adjunta el token también en los GET, no sólo al escribir.

## 🎫 Tickets

| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tickets` | Lista con filtros, orden y paginación | No |
| **GET** | `/api/tickets/resumen` | Estadísticas agregadas (**límite: 5 cada 30 s**) | No |
| **GET** | `/api/tickets/:id` | Detalle de un ticket | No |
| **POST** | `/api/tickets` | Crear (valida y responde **422** por campo) | **Sí** |
| **PUT** | `/api/tickets/:id` | **Reemplazo total** (**422** si falta un campo, **409** si está cerrado) | **Sí** |
| **PATCH** | `/api/tickets/:id` | Actualización parcial (**409** si está cerrado) | **Sí** |
| **POST** | `/api/tickets/:id/cerrar` | Cerrar, exige `solucion` | **Sí** |
| **POST** | `/api/tickets/:id/reabrir` | Reabrir (**409** si no estaba cerrado) | **Sí** |
| **PUT** | `/api/tickets/:id/seguro` | Guardar/rotar el dato sensible **ya cifrado en el cliente** | **Sí** |
| **DELETE** | `/api/tickets/:id/seguro` | Olvidar el dato sensible sin tocar el ticket | **Sí** |
| **DELETE** | `/api/tickets/:id` | Eliminar — **sólo rol `admin`** | **Sí** |

### PUT contra PATCH — la diferencia que hay que ver, no memorizar

`PUT /api/tickets/:id` **reemplaza** el recurso completo. Lo que no envíes en el
cuerpo NO se conserva: vuelve a su valor por defecto. Sólo sobreviven `id`,
`codigo` y `creadoEn`, porque eso es identidad del recurso, no contenido.

Para que la lección se vea, la respuesta incluye un campo `aviso` que enumera
qué campos se perdieron por no haberlos reenviado:

```json
{
  "ticket": { "...": "..." },
  "aviso": "PUT reemplazó el recurso completo. Se perdieron estos campos porque no los enviaste: solucion, datoSeguro."
}
```

`PATCH` en cambio sólo toca los campos presentes en el cuerpo. Mismo ticket,
mismos datos, dos verbos, dos resultados distintos.

### 🔒 `datoSeguro` — cifrado en el cliente dentro del flujo de negocio

Un ticket puede llevar un dato sensible del solicitante (RUT, teléfono de
contacto, credencial temporal). Ese dato **se cifra en el navegador** con
Web Crypto antes de salir, y el servidor lo guarda sin poder leerlo jamás.

Cuerpo de `PUT /api/tickets/:id/seguro`:

```json
{
  "etiqueta": "RUT del solicitante",
  "paquete": { "salt": "…Base64…", "iv": "…Base64…", "dato": "…Base64…" }
}
```

- `etiqueta` viaja **en claro a propósito**: es lo único que la interfaz puede
  mostrar sin descifrar. Dice *qué* hay guardado, nunca *cuál* es el valor.
- El servidor valida sólo la **forma** (tres campos, Base64, largo mínimo).
  Si mandas texto plano lo detecta y responde **422**.
- `PUT /api/tickets/:id` **borra** el `datoSeguro`. No es un descuido: es la
  demostración de qué significa "reemplazo total".

### Parámetros de `GET /api/tickets`

`estado`, `prioridad`, `buscar`, `orden` (`recientes` | `antiguos` | `prioridad`),
`pagina`, `porPagina` (máximo 50).

**La respuesta NO es un arreglo pelado:**

```json
{
  "datos": [ /* tickets */ ],
  "meta": { "pagina": 1, "porPagina": 5, "total": 12,
            "totalPaginas": 3, "hayAnterior": false, "haySiguiente": true }
}
```

Además envía la cabecera `X-Total-Registros`, legible desde JavaScript porque
el servidor la expone vía `Access-Control-Expose-Headers`.

## 👤 Personas — CRUD completo con los cinco verbos

Recurso pensado para la **actividad práctica de CRUD**. A propósito **no se
comporta igual que `/api/tickets`**: obliga a leer la respuesta real en vez de
copiar el código de otro recurso.

| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/personas` | Lista con filtros, orden y paginación | No |
| **GET** | `/api/personas/departamentos` | Valores válidos para el selector | No |
| **GET** | `/api/personas/:id` | Detalle — objeto directo, sin envoltorio | No |
| **POST** | `/api/personas` | Crear — **201** + cabecera `Location` | **Sí** |
| **PUT** | `/api/personas/:id` | **Reemplazo total** (**422** si falta un campo) | **Sí** |
| **PATCH** | `/api/personas/:id` | Actualización parcial (**422** si el cuerpo va vacío) | **Sí** |
| **DELETE** | `/api/personas/:id` | Eliminar — **204 sin cuerpo**, sólo rol `admin` | **Sí** |

### Diferencias deliberadas respecto de `/api/tickets`

| | Tickets | Personas |
| :--- | :--- | :--- |
| Envoltorio del listado | `{ datos, meta }` | **`{ resultados, paginacion }`** |
| Respuesta al crear | 201 con el objeto | 201 + **cabecera `Location`** |
| Respuesta al eliminar | 200 con `message` | **204 sin cuerpo** |
| Duplicados | no aplica | **409**, no 422 |

### Forma de una persona

```json
{
  "id": 1,
  "rut": "15782394-9",
  "nombre": "Camila",
  "apellido": "Rojas Fuentes",
  "email": "camila.rojas@empresa.cl",
  "telefono": "+56912345678",
  "cargo": "Analista de Soporte",
  "departamento": "informatica",
  "activo": true,
  "creadoEn": "2026-03-04T13:20:00.000Z",
  "actualizadoEn": "2026-03-04T13:20:00.000Z"
}
```

### Reglas de validación (responden **422** con detalle por campo)

| Campo | Regla |
| :--- | :--- |
| `rut` | Obligatorio. Se valida con el **algoritmo módulo 11**: el dígito verificador tiene que corresponder. Se acepta con o sin puntos y se guarda normalizado (`15782394-9`) |
| `nombre` | Obligatorio, 2 a 40 caracteres |
| `apellido` | Obligatorio, 2 a 60 caracteres |
| `email` | Obligatorio, formato válido **y** del dominio `@empresa.cl`. Se guarda en minúsculas |
| `telefono` | Opcional. Si viene, formato `+56912345678` |
| `cargo` | Obligatorio, mínimo 3 caracteres |
| `departamento` | Uno de: `administracion`, `operaciones`, `informatica`, `ventas`, `recursos_humanos` |
| `activo` | Booleano de verdad, no la cadena `"true"` |

> [!TIP]
> El RUT `12.345.678-9` que todo el mundo usa de ejemplo **es inválido**. Su
> dígito verificador correcto es `5`. Sirve perfecto para provocar el 422 en clase.

### Conflictos (responden **409**)

- **RUT o correo duplicado** — el dato está bien escrito, pero ya pertenece a otra persona. Por eso es 409 (conflicto de estado) y no 422 (error de formato).
- **Eliminar a alguien todavía activo** — regla de negocio: primero se desactiva con `PATCH { "activo": false }` y después se elimina. Obliga a encadenar dos verbos, como en un sistema real. La respuesta incluye un campo `sugerencia` con la petición exacta que falta.

### Parámetros de `GET /api/personas`

`buscar`, `departamento`, `activo` (`true` | `false`), `orden`
(`apellido` | `nombre` | `antiguedad` | `departamento`), `pagina`,
`porPagina` (máximo 50). También envía la cabecera `X-Total-Registros`.

```json
{
  "resultados": [ /* personas */ ],
  "paginacion": {
    "paginaActual": 1, "porPagina": 6, "totalRegistros": 12,
    "totalPaginas": 2, "hayAnterior": false, "haySiguiente": true
  }
}
```

## 🔐 Notas cifradas (conocimiento cero)

El servidor guarda el paquete cifrado **tal cual llega y nunca puede leerlo**:
la frase de paso jamás sale del navegador. Sólo valida la *forma* del paquete.

| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notas` | Lista sólo las notas del usuario autenticado | **Sí** |
| **POST** | `/api/notas` | Recibe `{ titulo, paquete: { salt, iv, dato } }` | **Sí** |
| **DELETE** | `/api/notas/:id` | Sólo el autor puede borrar la suya | **Sí** |

Los tres campos del paquete deben venir en **Base64**. Si mandas texto plano,
el servidor lo detecta y responde **422**.

## 📊 Códigos de estado que devuelve esta API

| Código | Cuándo aparece |
| :--- | :--- |
| **400** | Filtro con un valor no permitido |
| **401** | Falta el token o las credenciales son incorrectas |
| **403** | Token inválido/expirado, **o rol sin permiso** |
| **404** | El recurso no existe |
| **409** | Conflicto de estado (cerrar algo ya cerrado, RUT duplicado, eliminar a alguien activo) |
| **422** | Validación fallida, con detalle **por campo** en `errores` |
| **429** | Demasiadas peticiones, con cabecera `Retry-After` |

Y de los que **sí** son éxito:

| Código | Cuándo aparece |
| :--- | :--- |
| **200** | Lectura o actualización correcta, con cuerpo |
| **201** | Recurso creado. En `/api/personas` incluye la cabecera `Location` |
| **204** | Operación correcta y **sin nada que devolver** — el DELETE de personas |
