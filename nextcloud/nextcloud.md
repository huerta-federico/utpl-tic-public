# Nextcloud

Aplicación PHP/Apache basada en imagen oficial de Nextcloud.

## 1. Almacenamiento EFS

1. Crear volumen EFS
2. Crear punto de acceso al EFS con permisos 33:33 750
3. Crear un SG que permita trafico en el protocolo NFS unicamente desde el SG del cluster EKS
4. Asignar el SG creado a las subredes del AP
5. Anadir politica IAM a grupo de nodo para usar EFS (ClientFullAccess)

## 2. Storage Class EFS

Nextcloud, al user multi-pod, necesita almacenamiento de multiple lectura y escritura por lo que se debe crear un volumen EFS en AWS, crear un punto de acceso al EFS con montaje en `/carpeta` y permisos UID y GID 750. Así, el usuario 'usuario-unix' podrá utilizar el volumen correctamente.

Después, se debe crear el storage class con acceso `readWriteMany`, la ID del volumen EFS y la ID del punto de acceso.

Finalmente, se crea el PVC que Nextcloud usará.

```bash
kubectl create -f nextcloud-storage.yaml
```

## 3. Desplegar Nextcloud

Ejecutar en orden todos los archivos YAML dentro de K8S con el comando `kubectl create -f <nombre de archivo>`.

1. `deploy.yaml`
2. `hpa.yaml`
3. `svc.yaml`

## 4. Dominio público y SSL/TLS

El siguiente proceso puede ser realizado para Nextcloud, Collabora Online y el servidor Talk al mismo tiempo.

1. Obtener un FQDN con un proveedor DNS.
2. Desde AWS CM (Certificate Manager) y solicitar un certificado SSL/TLS.
3. El nombre y valor cNAME debe ser ingresado en la plataforma del proveedor DNS.
4. Esperar al proceso de validación.
5. Una vez que el certificado SSL/TLS ha sido generado, obtener la ID ARN del certificado.
6. Ingresar el ARN del certificado en la anotación correspondiente del Ingress.
7. Ingresar el FQDN en las reglas del host de Ingress.
8. Desplegar Ingress `ing.yaml`

Conseguir dirección cNAME del Ingress (ALB) de Nextcloud y crear un record CNAME en el proveedor DNS. AWS no genera IPs públicas de forma convencional, sino que utiliza DNS.

```kubectl get ingress -n <namespace>```

### Seguridad SSL/TLS

Para la implementación del protocolo TLS 1.3 se incluye la siguiente anotación a nivel de Ingress:

`ELBSecurityPolicy-TLS13-1-2-2021-06`

Para seguridad adicional respecto a CA se debe configurar un record CAA en el proveedor DNS:

`0 issue "amazon.com"`

## 5. Verificación de despliegue

Verificar el estado de los objetos creados utilizando comandos apropiados como:

```bash
kubectl get all -o wide # Muestra información de los recursos principales
kubectl get <nombre de recurso> -o wide # Muestra información de recursos específicos
kubectl logs <nombre de pod> # Muestra logs de una pod en particular
kubectl exec -it <nombre de pod> -- sh # Abre una terminal shell en una pod
```

## 6. Acceder a Nextcloud

Abrir en el navegador de Internet:

<https://dominio_de_nextcloud.com>

## 7. Terminar la configuración inicial

1. Crear usuario administrador con nombre de usuario y contraseña
2. Ingresar parámetros de conexión de la BD
    - user: `user`
    - user-password: `password`
    - database: `database`
    - host: `servicio_local.my-cluster.svc.cluster.local:puerto`
3. Seguir los pasos del proceso de bienvenida de Nextcloud

## 8. Configuraciones manuales de Nextcloud

Ciertas configuraciones deben ser realizadas de forma manual. Para esto, se abre una sesión Shell dentro de una pod de Nextcloud.

```bash
kubectl exec -ti <nombre de pod de Nextcloud> -- sh
```

Editar el archivo `config.php`

```bash
nano config/config.php
```

### Configuración del Redis Cluster

Añadir y/o editar las siguientes líneas en `config.php`

```php
 'memcache.locking' => '\\OC\\Memcache\\Redis',
 'memcache.distributed' => '\\OC\\Memcache\\Redis',
 'redis.cluster' => [
    'seeds' => [
      'servicio_headless.redis-cluster-headless.cluster.svc.cluster.local:puerto',
      '',
      '',
      '',
      '',
      '',
    ],
  'password' => 'myredispassword',
  'timeout' => 1.5,
  'read_timeout' => 1.5,
  'failover_mode' => 1,
  ],
```

### Configuración de seguridad (HTTPS, HSTS)

Añadir y/o editar las siguientes líneas para forzar HTTPS, proxies aceptados y cabeceras HTTP seguras.

```php
'overwrite.cli.url' => 'https://<dominio>',
'overwritehost' => '<dominio>',
  'overwriteprotocol' => 'https',
  'trusted_domains' => 
  array (
    0 => '<dominio>',
  ),
  'trusted_proxies' => 
  array (
    0 => '<VPC CIDR>',
    1 => '127.0.0.1',
    2 => '::1',
  ),
  'forwarded_for_headers' => 
  array (
    0 => 'HTTP_X_FORWARDED_FOR',
  ),
  'auth.bruteforce.protection.enabled' => true,
  'http.timeout' => 120,
```

#### Nota acerca de HTTPS, TLS y HSTS

Nextcloud detecta incorrectamente la implementación de HSTS y mostrará una advertencia:

```plaintext
Some headers are not set correctly on your instance - The `Strict-Transport-Security` HTTP header is not set (should be at least `15552000` seconds). For enhanced security, it is recommended to enable HSTS. For more details see the documentation ↗.
```

Sin embargo, esto es un falso positivo demostrable a través de pruebas con un navegador donde se pueden observar las cabeceras correctas de HSTS. Los comandos `curl` deben ejecutarse en `CMD` porque no funcionan correctamente en `PowerShell`

Para elimintar la advertencia se puede añadir la siguiente línea **al final** del archivo `.htaccess` ubicado en el directorio principal de Nextcloud

```bash
nano .htaccess
```

```php
Header set Strict-Transport-Security "max-age=15552000; includeSubDomains; preload"
```

### Configuración mediante OCC

Los comandos OCC se ejecutan a través de php

```bash
php occ <comando>
```

#### Ventana de mantenimiento

```bash
php occ config:system:set maintenance_window_start --type=integer --value=1
```

O añadir manualmente la siguiente línea al archivo `config.php`:

```php
  'maintenance_window_start' => 1,
```

#### Migraciones de Mimetype

```bash
php occ maintenance:repair --include-expensive
```

#### Creación de índices adicionales

```bash
php occ db:add-missing-indices
```

## Extras

### Configuración de almacenamiento de objetos en AWS S3

Se puede cambiar el directorio de datos para almacenar los archivos en AWS S3. No recomendado por ahora.

Modificar `config.php` para añadir almacenamiento de objetos a través de una bucket en AWS S3 para almacenar los archivos de usuarios (previamente cifrados mediante E2E de Nextcloud).

```php
'datadirectory' => '/var/www/html/my.next.cloud/data',
  'objectstore' => array(
        'class' => '\\OC\\Files\\ObjectStore\\S3',
        'arguments' => array(
                'bucket' => 'bucket_name',
                'autocreate' => true,
                'key'    => 'mykey',
                'secret' => 'mysecret',
                'port' => 443,
                'use_ssl' => true,
                'hostname' => 's3.eu-central-1.amazonaws.com',
                'region' => 'eu-central-1'
                
        ),
  ),
```

### Actualizaciones de Nextcloud

1. Modificar el Dockerfile para incluir una nueva versión de la imagen.
2. Construir y publicar la imagen de la nueva versión.
3. Modificar el archivo YAML de Nextcloud para referenciar la nueva versión.
4. Aplicar los cambios con `kubectl -f apply <archivo.yaml>`
5. Reiniciar el despliegue con `kubectl rollout restart deploy <nombre de despliegue>`
6. Verificar estado de nuevas pods.
7. Verificar nueva versión de Nextcloud en el panel web de administrador.

```bash
php occ status
php occ setupchecks
php occ files:scan --all
php occ maintenance:repair --include-expensive
```
