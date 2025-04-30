# Imágenes Docker

Creamos varias imágenes Docker personalizadas para desplegar las aplicaciones. Necesitamos Docker Desktop o similar para construir y publicar las imágenes.

```bash
docker build -t usuario_docker_hub/imagen:tag .
docker tag imagen:tag usuario_docker_hub/imagen:tag
docker push usuario_docker_hub/imagen:tag
```

Dentro de cada directorio se debe construir, etiquetar (solo la primera vez) y publicar la imagen:

Verificar que la construcción y publicación de la imagen hayan sido exitosas. Caso contrarior, revisar el log de Docker Desktop e implementar correcciones.

Documentación: <https://docs.docker.com/>

## Nextcloud

A la imagen docker oficial de Nextcloud, se han añadido ciertos paquetes y dependencias adicionales (entre ellas el editor de texto Nano) para automatizar los procesos de mantenimiento, habilitar funciones adicionales y facilitar la edición de archivos de configuración.

## Notify-Push

Contenedor sencillo que instala, ejecuta y expone al programa notify-push.

## Nutcracker (opcional)

LB para Redis Cluster en implementación de un Redis Array. Ignorar cuando se utiliza Redis Cluster mediante Helm Chart.

## talk-hpb (signaling)

Backend para Talk basado en Talk AIO de Nextcloud. Cambiado el OS base de Alpine a Debian, y realizado ajustes necesarios para habilitar TURN REST API para Janus, el servidor WEBRTC. Pendiente de finalizar arreglos y eliminar eturnal porque no se lo utiliza.

## turn-api

Backend API (desarrolado con Node.js) que ejecuta y exponer una TURN REST API. Esta API permite obtener credenciales efémeras para autenticar el servidor talk-hpb (signaling) en el servidor STUN/TURN.
