# Guía de Inicio del Proyecto

Este proyecto está dividido en dos partes:

- **Backend:** Symfony (PHP)
- **Frontend:** Angular 21

---

## 1. Backend (Symfony)

### Requisitos

- PHP 8.x
- Composer
- Extensiones básicas de PHP habilitadas (pdo, mbstring, etc.)

### Instalación de dependencias

Desde la carpeta del backend (por ejemplo `backend/`):

```bash
cd backend
composer install
```

### Variables de entorno

Copia el archivo de ejemplo y ajusta tus credenciales (BD, etc.)

```bash
cp .env .env.local
# Edita .env.local con tu configuración
```

### Levantar el servidor con el servidor nativo de PHP

Desde la raíz del backend (donde está la carpeta `public/`):

```bash
php -S 127.0.0.1:8000 -t public
```

El backend quedará disponible en:  
**http://127.0.0.1:8000**

Si la API tiene prefijo:

**http://127.0.0.1:8000/api**


> Esto funciona como un `php artisan serve`, pero usando el servidor nativo de PHP para Symfony.

---

## 2. Frontend (Angular 21)

### Requisitos

- Node.js (versión compatible con Angular 21)
- Angular CLI 21 instalada globalmente

```bash
npm install -g @angular/cli@21
```

### Instalación de dependencias

Desde la carpeta del frontend (por ejemplo `frontend/`):

```bash
cd frontend
npm install
```

### Configuración de la URL del backend

Editar:

`src/environments/environment.ts`

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000', // o http://127.0.0.1:8000/api
};
```

Y producción:

`src/environments/environment.prod.ts`

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-backend.com',
};
```

Asegurar que los servicios usen la variable:

```ts
private baseUrl = environment.apiBaseUrl;
```

### Levantar Angular

```bash
ng serve
# o
npm run start
```

Angular estará disponible en:

**http://localhost:4200**

Este frontend apuntará al backend configurado en `environment.apiBaseUrl`.

---

## Flujo de desarrollo recomendado

1️⃣ Levantar backend Symfony

```bash
cd backend
php -S 127.0.0.1:8000 -t public
```

2️⃣ Levantar frontend Angular

```bash
cd frontend
ng serve
```

3️⃣ Abrir:

Frontend → http://localhost:4200  
Backend → http://127.0.0.1:8000 (ó /api)
