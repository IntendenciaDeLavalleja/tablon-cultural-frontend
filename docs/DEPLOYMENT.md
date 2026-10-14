# Despliegue en Coolify

## Estado de la revisión del 8 de octubre de 2026

El flujo de eventos y la construcción Docker están verificados. También se comprobó el MinIO existente configurado en `backend/.env`: contenedor `minio`, versión `RELEASE.2025-09-07T16-13-09Z`, bucket `tablon-cultural-uploads`. El circuito de imágenes pasó desde Windows y desde la imagen Linux del backend. Los dos objetos anteriores quedaron intactos; solo se eliminaron las imágenes temporales de cada prueba.

El Compose principal consume un servidor MinIO existente mediante variables de entorno. No construye ni administra MinIO y no monta un volumen de imágenes. `deploy/minio/Dockerfile` pertenece exclusivamente al entorno aislado de CI; la revisión anterior lo había incluido innecesariamente en el despliegue principal. No hay una migración de almacenamiento pendiente para usar la configuración actual. Los hallazgos de seguridad previos se conservan, con su alcance, en [el informe](VERIFICATION.md).

## Configuración de una instalación nueva

1. Crear una aplicación desde este repositorio con **Docker Compose** y seleccionar `/compose.yaml`.
2. Definir las variables de `.env.example` en Coolify. Generar tres secretos distintos para `SECRET_KEY`, `DB_PASSWORD` y `DB_ROOT_PASSWORD`, por ejemplo con `python -c "import secrets; print(secrets.token_hex(32))"`. Usar hexadecimal para las contraseñas de base evita caracteres que requieran codificación en la URL. Para MinIO conservar las credenciales y el bucket existentes en `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME` (o `MINIO_BUCKET`) y `MINIO_SECURE`; ajustar únicamente `MINIO_ENDPOINT` a una dirección alcanzable desde los contenedores.
3. Establecer `SITE_URL` al dominio HTTPS final, sin una ruta adicional. Se usa también durante la compilación para las etiquetas canónicas y sociales.
4. Asignar ese dominio **solamente al servicio `frontend`, puerto 80**. No publicar puertos de MariaDB, Redis, MinIO, backend o worker. Coolify termina TLS y Nginx dirige `/api`, `/admin`, `/media` y `/static` hacia Flask.
5. Configurar SMTP y la dirección `ADMIN_NOTIFICATION_EMAIL`. `MAIL_USE_TLS=true` normalmente corresponde a STARTTLS/587; para TLS implícito/465 usar `MAIL_USE_SSL=true` y `MAIL_USE_TLS=false`. No activar ambas opciones. Confirmar estos valores con el proveedor.
6. Mantener `FORCE_HTTPS=true`. `TRUSTED_PROXY_COUNT=2` corresponde al recorrido cliente → proxy de Coolify → Nginx → Flask. Si se agrega otro proxy, revisar el número exacto de saltos; no confiar arbitrariamente en cabeceras del cliente.
7. Desplegar. El backend aplica las migraciones y verifica/crea el bucket antes de arrancar Gunicorn. El frontend y el worker esperan su comprobación de salud.
8. Desde el terminal del contenedor backend, crear la cuenta institucional con `flask create-admin USUARIO CORREO CONTRASEÑA true`. No usar la cuenta ni contraseña de QA en producción. Evitar dejar la contraseña en historial de una terminal compartida.
9. Abrir `/admin`, completar contraseña, captcha y 2FA, y hacer una postulación de aceptación usando un correo controlado por la Intendencia.

Coolify usa los healthchecks definidos en Compose para este tipo de aplicación. La configuración sigue la documentación de [Docker Compose en Coolify](https://coolify.io/docs/applications/builds/docker-compose). La confianza en proxies debe coincidir con la topología real, como indica [Flask ProxyFix](https://flask.palletsprojects.com/en/stable/deploying/proxy_fix/).

**No agregar `deploy/compose.test.yaml` en producción.** Ese archivo abre puertos locales, desactiva HTTPS y sustituye el correo institucional por Mailpit.

## Conexión al MinIO existente

`localhost:9000` es correcto cuando Flask corre directamente en el equipo. Dentro de Docker, `localhost` corresponde al propio contenedor. Para el MinIO publicado en el mismo host usar `MINIO_ENDPOINT=host.docker.internal:9000` y `MINIO_SECURE=false`; Compose incluye el mapeo `host-gateway` para backend y worker. Esta conexión se probó contra el contenedor existente sin cambiarlo. El endpoint se expresa como `host:puerto`, sin esquema ni ruta de bucket.

Si MinIO es otro recurso de Coolify, conectar la aplicación a su red mediante **Advanced > Docker compose > Predefined network > Connect to predefined network** y usar el nombre real generado para ese servicio y su puerto interno. Verificar el nombre, porque Coolify puede agregar un prefijo. Este comportamiento está documentado en [redes de Compose en Coolify](https://coolify.io/docs/applications/builds/docker-compose#compose-networking). Con un servidor remoto usar su hostname y el valor de TLS correspondiente.

El bucket debe ser el que ya contiene las imágenes del proyecto. No montar su directorio de datos en un segundo servidor ni iniciar `backend/compose.local-storage.yaml` en una estación que ya tiene MinIO. Las URL públicas de la aplicación usan `/media`; no requieren cambiar `MINIO_PUBLIC_URL` ni hacer público el bucket.

## Base existente

Antes de migrar, obtener una copia de MariaDB y del almacenamiento de imágenes y ensayar la restauración en una instancia aislada. La base local configurada en `backend/.env` se consultó en modo de lectura: conecta, tiene dos eventos y está en la revisión `a83bd5e91200`. No se migró ni se modificó esa base durante esta comprobación.

- Consultar `flask db current` para conocer la revisión instalada.
- Si está en `607d234605dd`, la nueva migración agrega la cola de correo, claves de reintento y amplía el nombre del destinatario a 120 caracteres.
- Si está en la revisión inicial `d6d3c6d243b2`, hay columnas antiguas `datetime_text`. Sus valores deben estar en `YYYY-MM-DD` antes de convertirlos a fechas. La migración comprueba todos los valores antes de modificar tablas y se detiene indicando tabla e ID ante texto ambiguo, por ejemplo “Viernes de noche”. No inventa fechas ni descarta registros.
- Si una migración antigua quedó parcialmente aplicada, revisar la estructura con una copia de la base antes de continuar; no hacer `stamp` ni borrar columnas a ciegas.
- No usar `db.create_all()` para actualizar producción. No regenerar la migración inicial.
- Para revertir una migración con datos, restaurar una copia verificada junto con la versión de aplicación correspondiente. No confiar en un downgrade destructivo de columnas o de la cola.

## Correo, imágenes y disponibilidad

El SMTP de `backend/.env` pasó conexión TLS y autenticación sin enviar mensajes. En ese archivo aún no está definido `ADMIN_NOTIFICATION_EMAIL`: completar el destinatario de los avisos administrativos antes de usar esa función. La revisión de postulaciones en el panel funciona sin ese aviso. La entrega y ubicación de correos reales deben verificarse en la aceptación final.

Ejecutar **una sola instancia de `mail-worker`**. Consulta la cola cada cinco segundos; tras un fallo reintenta con espera creciente hasta una hora. La entrega de correo es “al menos una vez”: un cierre del proceso después de que SMTP acepta el mensaje y antes de confirmar el estado en base puede repetir un correo. Eso no duplica la postulación.

En `/admin/email/queue`, un superadministrador puede revisar pendientes, intentos y errores, y adelantar el siguiente reintento. Revisar esa pantalla si dejan de llegar confirmaciones. La entrega de SMTP no garantiza que el proveedor destinatario coloque el mensaje en la bandeja principal; completar la aceptación real y la configuración del dominio de correo.

Las respuestas manuales y los códigos 2FA se envían con un timeout de conexión y comunican errores al operador. No se registran como enviados si SMTP rechaza el envío. Los códigos 2FA no se imprimen en logs, expiran a los diez minutos y se bloquean después de cinco errores.

Las imágenes se mantienen en un bucket privado. Flask entrega únicamente imágenes vinculadas a eventos publicados, o a administradores autenticados. El navegador no necesita acceder al hostname interno `minio` ni recibe enlaces que expiren a las 24 horas. El historial de postulaciones puede conservar imágenes que deban reutilizarse; definir una política institucional de retención de datos e imágenes y vigilar el espacio disponible.

Al rechazar o archivar, la decisión se confirma en base antes de eliminar una imagen que ya no esté en uso. Si falla la limpieza del almacenamiento, la postulación permanece cerrada y el identificador del archivo queda registrado en la auditoría para su eliminación posterior. Una falla de base no destruye la imagen recibida.

El backend y el worker ejecutan con usuario sin privilegios, filesystem de solo lectura, `/tmp` temporal, todas las capacidades retiradas y `no-new-privileges`. Sus healthchecks usan Python; la imagen final no incluye pip ni curl. Nginx y Redis aplican los parches disponibles de sus distribuciones durante la construcción. Estas medidas no sustituyen la evaluación de vulnerabilidades de los componentes restantes.

Si Redis falla, se conservan límites locales por proceso para no interrumpir los formularios. Esa protección provisional no tiene la misma agregación global que Redis. MariaDB usa comprobación de conexiones antes de reutilizarlas y reciclado del pool; ver [SQLAlchemy, recuperación de conexiones](https://docs.sqlalchemy.org/en/20/core/pooling.html#disconnect-handling-pessimistic).

## Recepción IMAP del panel

`IMAP_SERVER` y `IMAP_PORT` deben corresponder al servidor IMAP real, que puede ser distinto del SMTP. La autenticación usa `MAIL_USERNAME` y `MAIL_PASSWORD`. La sincronización manual importa mensajes de los últimos siete días de remitentes guardados en la agenda, conserva UIDs estables y evita duplicados. Un fallo de conexión se muestra como error. Un proveedor que requiera OAuth en lugar de contraseña/app password necesita esa integración adicional; no se probó un buzón institucional real.

## Operación y aceptación final

- Vigilar `/healthz` (conexión a base), estado de contenedores, cola pendiente, disco y copias de seguridad. El healthcheck de la aplicación no certifica por sí solo SMTP ni IMAP.
- Respaldar el volumen `database` y el almacenamiento del servidor MinIO existente; guardar los secretos por separado y probar restauraciones. El Compose principal no administra ese almacenamiento. No ejecutar `docker compose down -v` sobre datos que deban conservarse.
- Antes de una actualización, ejecutar CI y conservar una copia de datos. Reconstruir el frontend si cambia el dominio.
- Validar en el dominio real: TLS, acceso móvil, postulación con imagen, recepción de ambos correos, 2FA, publicación, archivo, recuperación de imagen y sincronización IMAP si se utilizará.
- El captcha aritmético y los límites frenan envíos triviales, pero no equivalen a un servicio especializado contra bots. No se ofrece una certificación de seguridad ni una garantía de disponibilidad absoluta.

La infraestructura y las credenciales finales deben verificarse en Coolify antes de abrir el servicio al público. Las pruebas locales no sustituyen esa aceptación externa.
