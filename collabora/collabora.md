# Collabora Online server

Para habilitar la edición de documentos se usará Nextcloud Office el cual requiere de un servidor dedicado de Collabora Online.

Documentación: <https://sdk.collaboraonline.com/docs/installation/Kubernetes.html>

## Instalación

### 1. Obtener y configurar Helm Chart

1. Obtener el chart de Helm para Collabora si se necesita el Chart completo

    ```bash
    helm show values collabora/collabora-online > office.yaml
    ```

2. Modificar `values.yaml` para:
    1. Incluir el dominio principal de Nextcloud
    2. Incluir el dominio principal de Collabora
    3. Ajustar las rutas y anotaciones de Ingress
    4. Referenciar el secreto con las credenciales
    5. Ajustar recursos y réplicas. No se recomienda escalado automático por el momento.

### 2. Instalar Helm Chart

```bash
helm install --namespace collabora collabora-online collabora/collabora-online -f values.yaml
```

### 3. Instalar app Nextcloud Office

1. Instalar la aplicación Nextcloud Office en Nextcloud.
2. Ingresar la URL interna del servicio (URL de K8S completa) de Collabora en la sección Office del panel de admin de Nextcloud.
3. Verificar la detección del servidor.
4. Intentar abrir un documento ODT o DOCX.

### 4. Configuración WOPI

1. Configurar una IP de WOPI aleatoria
2. Intentar abrir un documento
3. Obtener IP verdadera del ALB de Collabora (ver mensajes de errores de conexión en logs de Nextcloud).
4. Ingresar la IP en wopi_allow_hosts.

### Limitación

Una gran limitación actual es que el proceso de configuración de `wopi_allow_hosts` es manual. Esto se debe a que ALB no genera IPs públicas de forma convencional por lo que el servidor de Collabora tiene una IP pública volátil y abstracta. ALB tiene un DNS que genera dos IPs (una por AZ), y además genera una IP internas. La IP interna es única IP válida para ingresar en `wopi_allow_hosts` y solo se podrá visualizar en el log de Nextcloud.

Automatizar este proceso requiere de scripts avanzados, una refactorización del despliegue en su totalidad, migración a otro tipo de LB o creación de una regla WAF para validar el ingreso con una cabecera HTTP.

#### `wopi_allow_hosts` con cabeceras HTTP (opcional)

Crear SecretoSuperSeguro, una cadena aleatoria y larga de caracteres, símbolos y números.

Crear regla WAF de tipo "Rule builder" en el ALB de Nextcloud para permitir el tráfico que tenga el siguiente HTTP header. Bloquear el resto de tráfico.

```plain
Inspect: HTTP Header
Header name: X-Collabora-WOPI-Secret
String match: SecretoSuperSeguro
```

Añadir HTTP header con el secreto en el SPEC de Collabora. Aplicar y verificar cambios.

```yaml
collabora:
  extra_params: >-
    --o:ssl.enable=false
    --o:ssl.termination=true
    --o:num_prespawn_children=4
    --o:net.add_http_header_on_wopi_request="X-Collabora-WOPI-Secret:SecretoSuperSeguro"
```
