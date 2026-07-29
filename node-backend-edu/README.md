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
curl --location 'http://localhost:3000/api/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "admin",
    "password": "admin123"
}'
```

### 2. Crear Item (Requiere Bearer Token)
```bash
curl --location 'http://localhost:3000/api/items' \
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
curl -X POST http://localhost:3000/api/login \
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
| **PATCH** | `/api/tickets/:id` | Actualización parcial (**409** si está cerrado) | **Sí** |
| **POST** | `/api/tickets/:id/cerrar` | Cerrar, exige `solucion` | **Sí** |
| **POST** | `/api/tickets/:id/reabrir` | Reabrir (**409** si no estaba cerrado) | **Sí** |
| **DELETE** | `/api/tickets/:id` | Eliminar — **sólo rol `admin`** | **Sí** |

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
| **409** | Conflicto de estado (cerrar algo ya cerrado) |
| **422** | Validación fallida, con detalle **por campo** en `errores` |
| **429** | Demasiadas peticiones, con cabecera `Retry-After` |
