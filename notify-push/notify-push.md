# Notify push

Un servidor Notify push acelera en gran medida el rendimiento de notificaciones y los cambios de estado de archivos y carpetas gracias a que asume la responsabilidad de estos procesos en lugar del contenedor principal de Nextcloud. Además, en lugar de que los clientes hagan peticiones continuas al servidor preguntando si han habido nuevos cambios, el servidor push envía notificaciones a los clientes SOLO cuando se han realizado cambios. Así, se reduce el número de peticiones que el servidor Nextcloud recibe y el servidor puede utilizar la capacidad de procesamiento liberada para otras tareas.

Documentación: <https://github.com/nextcloud/notify_push>

## 1. Instalación

1. Crear y publicar imagen Docker con el binario de notify_push.
2. Construir un despliegue de Notify push
    1. Utilizar la imagen creada
    2. Montar la PVC de Nextcloud (push necesita leer el config.php de Nextcloud)
    3. Añadir una ENV para establecer la URL interna de Nextcloud (soluciona errores de proxy inverso no confiado)
3. Desplegar despliegue y servicio de Notify push
4. Modificar Ingress principal para redireccionar la ruta `/push` al servicio del servidor push.
5. Ejecutar los siguientes comandos OCC
    1. `php occ app:enable notify_push` (App store/ Organization / Client push)
    2. `php occ notify_push:setup https://dominio_de_nextcloud.com/push`
6. El resultado correcto es:

    ```plain
    ✓ redis is configured
    ✓ push server is receiving redis messages
    ✓ push server can load mount info from database
    ✓ push server can connect to the Nextcloud server
    ✓ push server is a trusted proxy
    ✓ push server is running the same version as the app
      configuration saved
    ```

## 2. Verificación

Para ver las métricas del servidor push se utiliza `php occ notify_push:metrics`. Un ejemplo de resultados es:

```plain
Active connection count: 3
Active user count: 1
Total connection count: 8
Total database query count: 2
Events received: 17
Messages sent: 3
```
