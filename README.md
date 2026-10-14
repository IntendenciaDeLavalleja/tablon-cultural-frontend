# Tablón Cultural de Lavalleja

Portal Astro/React con API y administración Flask. El despliegue completo usa Nginx, Gunicorn, MariaDB, MinIO, Redis y un proceso de notificaciones.

**Estado al 8 de octubre de 2026:** funcionamiento y construcción Docker verificados, incluyendo el MinIO existente configurado en `backend/.env`. El Compose principal reutiliza ese almacenamiento mediante `MINIO_*`; no crea otro servidor ni un volumen de imágenes. La aceptación del dominio y correo finales en Coolify sigue pendiente. Ver el informe y las condiciones de despliegue.

- [Despliegue y operación en Coolify](docs/DEPLOYMENT.md)
- [Informe de verificación](docs/VERIFICATION.md)
- [Backend y desarrollo local](backend/README.md)

## Verificación local

Requiere Node 22.12 o superior, Python 3.13 o 3.14 y Docker con contenedores Linux. En Linux, instalar `libmagic1`.

```sh
npm ci
python -m pip install -r backend/requirements.txt
python -m pytest -q
npm run check
npm test
npm run build:admin
npm run build
```

Las pruebas Python usan SQLite aislado y correo simulado. No cargan datos de la base configurada en `backend/.env` ni envían correo real.

## Verificar el MinIO ya configurado

Con el servicio existente en ejecución:

```sh
python tests/integration/existing_storage.py
```

Lee únicamente la configuración de almacenamiento de `backend/.env`. Comprueba postulación, vista privada, publicación, cambio de imagen, archivo, republicación, eliminación, rechazo y creación directa. Usa una base SQLite en memoria y correo suprimido. Sube cuatro imágenes temporales y elimina solamente esos objetos; compara los objetos anteriores por clave, tamaño y ETag. No cambia el bucket, sus permisos ni los datos de la base configurada.

## Prueba completa con servicios reales aislados

Este entorno adicional sirve para CI y pruebas de caídas. Su MinIO es una instancia de prueba; no sustituye el servicio configurado. `deploy/minio/Dockerfile` se usa únicamente aquí.

```sh
python tests/integration/setup_qa.py
docker compose --env-file .env.test -p tablon-qa -f compose.yaml -f deploy/compose.test.yaml up -d --build --wait
# Esta cuenta es exclusivamente para el entorno de pruebas:
docker compose --env-file .env.test -p tablon-qa -f compose.yaml -f deploy/compose.test.yaml exec -T backend flask create-admin qa qa@example.com QA-only-Password-123! true
python tests/integration/migrations.py
npx playwright install chromium firefox
npm run test:e2e
python tests/integration/recovery.py
```

Sitio de prueba: `http://localhost:8088`. Buzón SMTP de prueba: `http://localhost:8028`. El script de recuperación detiene servicios **únicamente del proyecto `tablon-qa`**; ejecutarlo después de las pruebas de navegador. No ejecutar suites de navegador simultáneas contra el mismo proyecto porque los límites de peticiones están activos.

Para detener el entorno sin borrar sus datos:

```sh
docker compose --env-file .env.test -p tablon-qa -f compose.yaml -f deploy/compose.test.yaml down
```

`.github/workflows/ci.yml` reproduce las verificaciones en Linux, incluyendo construcción Docker, auditoría de dependencias, navegadores y recuperación. El archivo se agrega al repositorio; su ejecución remota depende de subir los cambios a GitHub.

## Reglas funcionales

- Se reciben postulaciones para revisión; enviar el formulario no publica inmediatamente.
- El tablón muestra eventos publicados desde hoy hasta hoy + 15 días, ambos inclusive, según `America/Montevideo`.
- La agenda muestra todos los publicados desde hoy. Los anteriores desaparecen por consulta, sin cron ni eliminación de registros.
- Las páginas abiertas actualizan sus consultas cada 60 segundos y al recuperar el foco.
- Fechas en formato `YYYY-MM-DD`, sin hora. Imágenes JPEG/PNG/WebP, hasta 2 MiB y 20 megapíxeles.
- Las notificaciones se guardan junto con la solicitud en la misma transacción. Una caída de SMTP no pierde la solicitud; el worker reintenta.
- Los reintentos del mismo formulario conservan un identificador mientras la página está abierta. La base impide duplicados concurrentes para ese identificador.

`sample-backend/` y los módulos antiguos de tickets no forman parte de las rutas activas ni del despliegue del Tablón.
