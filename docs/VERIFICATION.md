# Informe de verificación del Tablón Cultural

## Revisión actual: 8 de octubre de 2026

**Conclusión: el funcionamiento comprobado y la construcción Docker pasan las verificaciones, incluyendo el MinIO existente de `backend/.env`.** La revisión inicial omitió comprobar ese servicio y agregó una construcción de almacenamiento al Compose principal. Se corrigió ese desvío: el despliegue ahora conecta al servicio existente sin recrearlo ni administrar sus datos. No se realizó un despliegue público ni se envió correo institucional. La aceptación del dominio y SMTP finales y los hallazgos de seguridad documentados siguen pendientes; las pruebas no certifican ausencia absoluta de errores.

### Comprobación del entorno ya configurado

- Se inspeccionó el contenedor `minio` existente (`aec34d708b5f`). Estaba detenido y se inició sin recrearlo, cambiar su imagen, comando o bind mount en `Documents/Docker/MinIO`.
- Las credenciales de `backend/.env` autenticaron correctamente. El bucket `tablon-cultural-uploads` existe y no tiene política pública (`NoSuchBucketPolicy`). No se cambiaron permisos, credenciales ni variables de ese archivo.
- `tests/integration/existing_storage.py` comprobó el circuito de imágenes con ese servidor: postulación, vista administrativa privada, aprobación/publicación, reemplazo de imagen, archivo, republicación, eliminación, rechazo y creación directa de evento. La última prueba se ejecutó tanto en Windows como en la imagen Linux del backend con filesystem de solo lectura y capacidades retiradas.
- Cada ejecución completa creó cuatro objetos temporales y eliminó únicamente sus propias claves. Los dos objetos preexistentes conservaron clave, tamaño y ETag. La base del circuito fue SQLite en memoria y el correo estuvo suprimido.
- La base configurada se inspeccionó en modo de lectura: conexión y `/healthz` correctos, revisión `a83bd5e91200`, esquema coincidente con los modelos, dos eventos y cero postulaciones. Ambos eventos están publicados, pero tienen fechas pasadas; por eso `/api/events` no los muestra hoy. Sus dos imágenes existen en el bucket configurado. No se ejecutaron migraciones ni se escribieron registros en esa base.
- SMTP aceptó conexión TLS con certificado verificado, autenticación y `NOOP` con los valores existentes. No se enviaron mensajes. `ADMIN_NOTIFICATION_EMAIL` no está definido en `backend/.env`, por lo que falta el destinatario para el aviso administrativo; las postulaciones quedan igualmente disponibles en el panel. `IMAP_SERVER` tampoco está definido; la sincronización de buzón es una función adicional que requiere ese valor.
- Redis configurado en `localhost:6379` no respondía porque su contenedor `redis` estaba detenido. Se inició el mismo contenedor sin recrear su imagen ni su bind mount en `Documents/Docker/Redis`; `PING` respondió correctamente. No se borraron claves ni se vació el almacenamiento.
- El Compose principal se validó con ambas variantes `MINIO_BUCKET_NAME` y `MINIO_BUCKET`, conservando endpoint, credenciales y bucket configurados. No contiene un servicio `minio` ni un volumen `images`. Desde Docker se probó `host.docker.internal:9000`; `localhost:9000` sigue siendo el endpoint válido para el backend ejecutado directamente en el equipo.

### Evidencia de esta revisión

| Verificación | Resultado |
| --- | --- |
| Pytest en Windows | 100 aprobadas |
| Pytest en la imagen Linux final | 100 aprobadas; 27,04 s |
| Vitest | 24 aprobadas |
| Astro/TypeScript y compilación | Sin errores, advertencias ni sugerencias; frontend y CSS administrativo construidos |
| Playwright | 10 aprobadas; Chromium, Firefox y emulación Pixel 7 |
| Docker Compose | Construcción y arranque correctos; servicios con healthcheck saludables |
| MariaDB | Migración nueva, conversión de datos históricos y detención ante fechas ambiguas aprobadas en una instancia desechable; esquema del QA sin diferencias |
| Recuperación | Publicación administrativa concurrente, reintentos concurrentes, caídas de SMTP/MariaDB/Redis/MinIO y reinicios aprobados; última ejecución 126,0 s |
| MinIO existente de `backend/.env` | Circuito completo aprobado en Windows y Linux; objetos anteriores conservados |
| Almacenamiento construido desde fuente, solo QA | Misma versión y commit que el anterior; lectura de una imagen preexistente de QA aprobada |
| npm audit y pip-audit | Cero vulnerabilidades conocidas reportadas en las dependencias del proyecto |

Las 100 pruebas Linux repiten las de Windows; no se cuentan como casos distintos. Los diez escenarios de navegador incluyen creación directa de eventos con imagen, postulación y confirmaciones SMTP, acceso con 2FA, publicación, edición, archivo, eliminación y rechazo con motivo. También se comprobó un tablón con nueve eventos y títulos/descripciones largos en los tres perfiles de navegador. No se observaron errores JavaScript de página en el recorrido completo.

### Defectos comprobados y corregidos en esta revisión

- Un formulario administrativo anterior podía convertir una postulación ya rechazada o archivada en un evento. Ahora se vuelve a comprobar el estado bajo bloqueo de fila en base.
- Una postulación cerrada podía reabrirse por una petición anterior, republicarse desde el listado de eventos o volver a revisión al eliminar su evento. Ahora las decisiones finales se conservan en esos recorridos.
- Volver una postulación a revisión dejaba su evento publicado. Ahora se archiva; publicar explícitamente su evento vuelve a marcar la postulación como aprobada.
- La pantalla de postulaciones decía «publicado» cuando el evento estaba archivado. Ahora muestra el estado real del evento.
- Se eliminaba físicamente una imagen antes de confirmar el rechazo en base. Ahora la eliminación sucede después del commit; ante errores de limpieza se registra el objeto pendiente en auditoría.
- Un salto de línea en el nombre del evento generaba un asunto de correo inválido. Ahora el asunto se normaliza y se entrega correctamente.
- Textos largos sin espacios quedaban recortados en el detalle móvil. Ahora se ajustan al ancho; una dirección vacía muestra la localidad.
- Para CI se conserva la construcción de MinIO desde el commit original de su versión histórica. Se usa exclusivamente en el entorno de pruebas; el servicio ya configurado no necesita reconstruirse para probar ni desplegar la aplicación.

Se añadieron doce casos de regresión Python, se amplió el recorrido administrativo de navegador y se incorporaron pruebas reales de migraciones y publicación concurrente en MariaDB. Los cambios funcionales se probaron primero contra el comportamiento defectuoso y después de la corrección.

### Hallazgos previos de seguridad de las imágenes

El escaneo con Trivy 0.75.0 de los componentes construidos detectó avisos que las auditorías npm/Python no cubren. Nginx se actualizó a 1.30.5 y se aplicaron parches Alpine; las imágenes del frontend y Redis pasaron sin hallazgos altos o críticos. Se retiraron pip y curl del backend y se restringió su ejecución en Compose. Redis aplica parches Alpine conservando la versión 7.4 y su formato de persistencia; las pruebas de caída y reconexión pasaron también con esa imagen actualizada.

En el backend quedaron **44 observaciones altas de paquetes Debian, correspondientes a ocho CVE distintos**, sin versión de corrección indicada por el escáner para esa distribución. No hubo hallazgos altos/críticos en sus paquetes Python. La imagen MariaDB de origen reportó 22 observaciones altas en la biblioteca estándar de Go de sus herramientas auxiliares; ese recuento no demuestra una vulnerabilidad explotable del servidor SQL. No se realizó una prueba de penetración ni se asumió que todo aviso de una biblioteca sea accesible desde la aplicación.

**La imagen de QA de MinIO construida desde fuente reportó seis observaciones críticas y cuarenta altas**, incluyendo dependencias y defectos propios de MinIO. Este recuento corresponde a esa imagen, no a un escaneo del contenedor existente: la misma versión de MinIO se compiló con Go 1.26.7 en QA y con Go 1.24.6 en el contenedor existente. El puerto del MinIO de QA no está publicado; el existente publica 9000/9001. Las pruebas funcionales no descartan los avisos de seguridad de esa versión. Ver [el estado oficial del proyecto](https://github.com/minio/minio) y los avisos de [subidas sin firma](https://github.com/minio/minio/security/advisories/GHSA-hv4r-mvr4-25vw) y [Snowball](https://github.com/minio/minio/security/advisories/GHSA-9c4q-hq6p-c237). El caso de util-linux del backend puede consultarse en [Debian Security Tracker](https://security-tracker.debian.org/tracker/CVE-2026-76642).

La integración solicitada usa el MinIO existente y está comprobada. No se requiere elegir ni migrar a otro almacenamiento para usar esa configuración. No se sustituyó su servicio ni se migraron sus datos. La evaluación de los avisos documentados y la aceptación real del dominio HTTPS, SMTP/2FA y backups corresponden al entorno final de producción.

Los logs actuales están en `backend-tests.log`, `linux-tests.log`, `e2e-tests.log`, `migration-tests.log`, `recovery-tests.log`, `docker-up.log`, `storage-build.log` y `typecheck.log`. La última ejecución de navegador posterior a la corrección de Compose terminó con 10 pruebas aprobadas en 1,4 minutos. Los resultados JSON de Trivy permanecen en `node_modules/.cache/tablon-audit/`, ignorados por Git. Las pruebas reproducibles están en el README y GitHub Actions; el CI remoto aún requiere subir los cambios del repositorio.

## Informe histórico del 24 de septiembre de 2026

Lo que sigue conserva la evidencia anterior. La conclusión de la revisión del 8 de octubre prevalece sobre su evaluación de preparación para producción.

Fecha: 24 de septiembre de 2026. Alcance: frontend público, API, administración activa, correo, imágenes, migraciones y despliegue Docker del repositorio local.

**Resultado:** se corrigieron los defectos encontrados y todas las suites ejecutadas terminaron sin fallos. Se construyó y probó la aplicación completa en contenedores Linux. Queda preparada para desplegar y completar la aceptación en Coolify con el dominio, los datos y el correo institucionales. No se realizó un despliegue público ni se modificó una base institucional.

Esto es evidencia de los escenarios comprobados, no una garantía matemática de cero errores futuros o disponibilidad absoluta. La aceptación externa y las copias de seguridad forman parte de la puesta en producción.

## Resultados ejecutados

| Verificación | Resultado | Alcance |
| --- | --- | --- |
| Pytest en Windows | 88 aprobadas, 24,43 s | API, validaciones, administración, seguridad, correo, almacenamiento y migraciones |
| Pytest dentro de la imagen Linux final | Las mismas 88 aprobadas, 15,86 s | Compatibilidad del backend construido para despliegue |
| Vitest | 24 aprobadas | Fechas, contrato de datos y validación del frontend |
| Astro/TypeScript | 0 errores, 0 advertencias, 0 sugerencias | 26 archivos comprobados |
| Playwright | 7 aprobadas, 39,0 s | Chromium, Firefox y emulación móvil Pixel 7 |
| Compilación | Correcta | Frontend, CSS del administrador y las imágenes Docker |
| Migraciones | Correctas | Instalación nueva en MariaDB; esquema sin operaciones pendientes en `flask db check` |
| Dependencias npm | 0 vulnerabilidades conocidas reportadas | `npm audit`, dependencias de producción y desarrollo |
| Dependencias Python | 0 vulnerabilidades conocidas reportadas | `pip-audit -r backend/requirements.txt` en el entorno local |
| Recuperación con servicios reales | Todos los escenarios aprobados, 114,5 s | MariaDB, Redis, MinIO, SMTP y reinicio de aplicación |

Las 88 pruebas Linux repiten las de Windows; no se cuentan como casos funcionales distintos. Los avisos de Playwright sobre `NO_COLOR`/`FORCE_COLOR` pertenecen a la salida de terminal, no a errores de la aplicación. No se realizó una auditoría de CVE de todo el sistema operativo de las imágenes ni una prueba formal de penetración.

## Flujo completo comprobado en navegador

Chromium ejecutó el recorrido completo contra Nginx, Gunicorn, MariaDB, Redis, MinIO y Mailpit reales:

1. Completar la postulación con imagen, fecha, correo y captcha.
2. Recibir el comprobante y verificar la llegada de correo al servidor SMTP de pruebas.
3. Iniciar sesión administrativa con contraseña, captcha y código 2FA recibido por correo.
4. Abrir la solicitud, recuperar su imagen y convertirla en evento publicado.
5. Ver el evento y su imagen desde el sitio público y abrir su detalle.
6. Editarlo, archivarlo, comprobar que desaparece de la API pública y volver a publicarlo.
7. Eliminarlo y cerrar sesión.

El recorrido comprueba que no se produzcan errores JavaScript de página. Se inspeccionaron capturas del administrador y del detalle del evento. Los escenarios públicos de navegación, validación, disposición móvil y recuperación de errores de API también pasaron en Firefox y Chromium móvil. La emulación móvil no equivale a una prueba física en todos los teléfonos, ni incluye Safari.

## Defectos corregidos y protección añadida

### Formularios y contrato entre frontend y backend

Se unificaron nombres, campos opcionales, valores nulos, localidades, fechas y restricciones de tamaño. Las imágenes admitidas son JPEG, PNG o WebP de hasta 2 MiB y 20 megapíxeles, con inspección de contenido y correspondencia de extensión y MIME. Los formularios administrativos aplican las mismas restricciones relevantes.

Se corrigieron el manejo de multipart, la recepción de enlaces, las etiquetas de accesibilidad y la presentación de errores del servidor. Una respuesta inválida, un archivo rechazado o un fallo de almacenamiento no se muestran como un envío satisfactorio. El formulario conserva los datos ante errores y muestra el comprobante al completarse.

Una clave de idempotencia y una restricción única en base evitan duplicar una solicitud cuando se reintenta el mismo envío. Una clave reutilizada con otro contenido se rechaza. El navegador conserva la clave mientras la página permanece abierta; cerrar o recargar la página y volver a enviar constituye un envío nuevo.

### Recepción y notificaciones

La solicitud y sus notificaciones se guardan en una misma transacción. Un worker separado entrega los correos y reintenta los fallos. SMTP dejó de ser un punto que pudiera invalidar la recepción de una solicitud ya válida. El administrador puede consultar los pendientes y solicitar un reintento.

Se corrigieron errores ocultos de correo y una plantilla que referenciaba un campo de fecha obsoleto. Los envíos manuales fallidos no se registran como enviados. Se añadió timeout de SMTP y se retiró el registro de códigos 2FA en logs.

La cola usa entrega al menos una vez: una interrupción entre la aceptación SMTP y la confirmación en base puede repetir un correo. No duplica la postulación. La configuración actual requiere una sola instancia del worker.

### Publicación y filtro automático por fecha

Las fechas se interpretan según `America/Montevideo`. El tablón devuelve únicamente eventos publicados con fecha entre hoy y hoy + 15 días, ambos inclusive. La agenda devuelve todos los publicados desde hoy. Los eventos pasados dejan de aparecer por la consulta, sin depender de un cron ni eliminar registros.

Se probaron límites inclusivos, estados archivados y el cambio de día entre UTC y Uruguay. Las respuestas de eventos no se almacenan en caché y el frontend vuelve a consultar cada 60 segundos y al recuperar el foco, sujeto a la programación de pestañas del navegador.

Las imágenes públicas se sirven mediante una ruta estable de la aplicación desde un bucket privado. Se eliminaron dependencias de enlaces temporales y hostnames internos de MinIO. Solo se exponen imágenes de eventos publicados o a administradores autenticados.

### Administración

Se comprobaron páginas protegidas, roles, cuentas inactivas, altas y ediciones, conversión de postulaciones, estados, publicación, archivo, eliminación, contactos, respuestas, cola de correo y cierre de sesión.

Se corrigieron formularios de archivo/publicación sin CSRF, controles de permisos, edición de campos, errores de subida de imágenes y conversiones repetidas. Rechazar o archivar exige motivo y mantiene coherencia con el evento vinculado; aprobar exige publicación. Los códigos 2FA caducan, tienen límite de intentos y no pueden reutilizarse. Se corrigieron riesgos de inyección en detalles de auditoría y exportaciones CSV.

El panel sirve su CSS y JavaScript localmente. La sincronización IMAP utiliza UIDs estables, deduplicación y lectura sin modificar mensajes; los errores se muestran al operador. Las pruebas IMAP usaron un servidor simulado, no el buzón institucional.

### Docker, persistencia y migraciones

Se incorporaron Dockerfiles, Compose, Nginx, comprobaciones de salud, usuario de backend sin privilegios, volúmenes persistentes y ejemplos de variables. El único servicio que necesita dominio público es el frontend, puerto 80. La configuración de producción exige secretos y HTTPS.

La nueva migración agrega la cola y la protección de reintentos. La conversión histórica de texto a fecha comprueba los datos antes de cambiar tablas y se detiene ante valores ambiguos, evitando inventar fechas o perder información. Se probaron migraciones nuevas y datos antiguos representativos; una base institucional existente requiere ensayo con su propia copia.

## Pruebas de interrupción y concurrencia

El script `tests/integration/recovery.py` actuó exclusivamente sobre el proyecto Docker aislado `tablon-qa`:

| Escenario provocado | Resultado observado |
| --- | --- |
| Cuatro envíos simultáneos con la misma clave | Una sola solicitud y un mismo comprobante |
| Detención del servidor SMTP | La API siguió aceptando solicitudes; notificaciones pendientes en base |
| Restauración de SMTP | Entrega mediante reintento automático |
| Detención de MariaDB | Estado 503 en salud y consulta de eventos, sin falso éxito |
| Restauración de MariaDB | Reconexión del pool y recepción de nuevas solicitudes |
| Detención de Redis | Los formularios continuaron con limitación local de respaldo |
| Detención de MinIO | Las solicitudes sin imagen continuaron disponibles |
| Reinicio del backend y worker | Persistieron datos y protección contra duplicados |
| Veinte lecturas concurrentes | Todas respondieron 200 |

Estas pruebas no afirman que se pueda escribir sin base de datos ni subir imágenes sin almacenamiento. Una dependencia caída produce un error recuperable donde resulte indispensable. Veinte lecturas concurrentes constituyen una comprobación básica, no un dimensionamiento de capacidad ni una prueba de carga prolongada.

## Evidencia y repetición

Los comandos reproducibles están en [README](../README.md). Las suites viven en `backend/tests/`, `tests/` y la configuración de Vitest/Playwright. La nueva integración de GitHub Actions reproduce las comprobaciones en Linux; aún no se ejecutó remotamente porque estos cambios permanecen en el repositorio local.

La ejecución dejó evidencia local ignorada por Git: `backend-tests.log`, `linux-tests.log`, `frontend-tests.log`, `e2e-tests.log`, `recovery-tests.log`, `typecheck.log`, `npm-audit.json`, `python-audit.json`, `migration-check.log`, `playwright-report/` y `test-results/`. No se incorporan secretos ni datos de prueba a las imágenes.

## Aceptación pendiente antes de abrir producción

1. Configurar Coolify con dominio HTTPS y secretos propios; comprobar TLS y la cantidad real de proxies.
2. Verificar el SMTP institucional, recepción de confirmaciones y 2FA, y sincronización IMAP si se utilizará. Un proveedor que exija OAuth necesita una integración adicional.
3. Si existe una base anterior, respaldarla junto con las imágenes, probar la restauración y ensayar la migración sobre una copia.
4. Repetir en el dominio final una postulación con imagen, recepción de correos, acceso administrativo, publicación y archivo; establecer vigilancia de salud, disco, cola y backups.

El procedimiento y las variables están en [Despliegue y operación](DEPLOYMENT.md). No se usó correo institucional real, no se ensayó la restauración de datos institucionales y no se accedió a una instancia de Coolify durante esta verificación.
