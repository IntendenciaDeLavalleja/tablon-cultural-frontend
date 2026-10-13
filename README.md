# Tablón Cultural de Lavalleja — Frontend

Sitio público Astro/React: tablón, agenda y formulario de postulaciones. El envío queda pendiente de revisión administrativa. El backend y el panel se mantienen en [tablon-cultural-backend](https://github.com/IntendenciaDeLavalleja/tablon-cultural-backend).

## Desarrollo y verificación

Requiere Node 22.12 o superior.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
```

En desarrollo, `/api` y `/media` apuntan al backend local en `http://127.0.0.1:5000`. El frontend no requiere Python ni archivos del backend para compilar o ejecutar las pruebas unitarias.

## Docker y Coolify

Copiar `.env.example` a `.env` y completar `SITE_URL` y `BACKEND_URL`. Seleccionar `/compose.yaml` en una aplicación Docker Compose de Coolify y asignar el dominio público al servicio `frontend`, puerto 80. `SITE_URL` se usa durante la compilación; reconstruir si cambia el dominio.

Conectar frontend y backend a la misma red de Coolify mediante **Connect to predefined network**. Configurar `BACKEND_URL` con el nombre real del contenedor backend y su puerto 8000, por ejemplo `http://backend:8000`; Coolify puede agregar prefijos al nombre. Nginx recibe esa variable al arrancar y dirige `/api`, `/admin`, `/media`, `/static` y `/healthz` hacia el backend. Mantener `PUBLIC_BACKEND_URL` vacío para conservar un único origen. No agregar `/api` al final de `BACKEND_URL`.

```sh
docker compose --env-file .env up -d --build --wait
```

El healthcheck comprueba también la conexión al backend; un hostname o puerto incorrecto deja el frontend sin salud. El servidor MinIO existente pertenece a la configuración del backend y no se despliega desde este repositorio.

## Pruebas completas con el backend aislado

Primero iniciar el proyecto `tablon-qa` siguiendo el README del backend, incluida la cuenta QA. Con ese entorno activo, iniciar este frontend:

```sh
docker compose --env-file .env -p tablon-frontend-qa -f compose.yaml -f deploy/compose.test.yaml up -d --build --wait
npx playwright install chromium firefox
npm run test:e2e
```

Sitio de prueba: `http://localhost:8088`. SMTP simulado: `http://localhost:8028`. Las pruebas completas crean y moderan eventos solo en ese entorno aislado. El override de pruebas no se utiliza en producción. Para detenerlo sin borrar datos:

```sh
docker compose --env-file .env -p tablon-frontend-qa -f compose.yaml -f deploy/compose.test.yaml down
```

No se incluyen credenciales, datos de bases locales, builds, dependencias instaladas ni informes de prueba.
