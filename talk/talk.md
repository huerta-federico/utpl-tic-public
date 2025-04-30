# Talk High Performance Backend

Nextcloud Talk High Performance Backend o HPB es un servidor backend encargado de gestionar las conexiones entre clientes durante las llamadas o videoconferencias. Tiene varios módulos pero los principales son:

- HPB Signaling: servidor principal (basado en Janus) que establece conexiones WebSocket entre participantes de una llamada. Es necesario para llamadas entre múltiples participantes, porque su ausencia causaría que cada participante deba subir un flujo de audio y video por cada otro participante en la llamada.
- Stun: servicio dedicado al descubrimiento de IPs a través de NATs o Firewalls estrictos. Esencial cuando los participantes se encuentran fuera de la red local.
- Turn: servicio que cumple una función similar a Signaling, solo que se enfoca en crear las conexiones WebSocket en el puerto 443 cuando se presentan Firewalls estrictos o restricciones de puertos. Su ausencia causaría que participantes con Firewalls estrictos no puedan entrar a la llamada, caso común en redes corporativas.
- TURN REST API: Es un backend sencillo para que Janus obtenga credenciales válidas para conectarse al servidor STUN/TURN

Talk-HPB: <https://github.com/nextcloud-snap/nextcloud-snap/wiki/How-to-configure-talk-HPB-with-Docker>'
Talk-Container: <https://github.com/nextcloud/all-in-one/tree/main/Containers/talk>
Janus: <https://github.com/meetecho/janus-gateway/tree/master>

**Importante:** Los servicios STUN y TURN corren en el mismo servidor COTURN

## Proceso de conexión

El proceso de Talk para realizar la conexión es el siguiente:

1. Servidor HPB intenta crear conexión P2P en la red local entre los participantes.
2. Si un participante se encuentra en una red externa, el servidor STUN intenta resolver la IP externa y Talk intenta crear una conexión P2P directa.
3. Si el participante, además de estar en una red externa, está detras de Firewall estricto o tiene restriccions de puertos, el servidor TURN intenta crear una conexión con el participante en el puerto 443 y redirige su tráfico a los puertos WebSocket hacia el servidor HPB principal.

Fuente: <https://nextcloud-talk.readthedocs.io/en/latest/TURN/#turn-server-and-nextcloud-talk-high-performance-backend>

## HPB Signaling

Para instalar el servidor HPB Signaling, utilizamos el contenedor de Talk oficial de Nextcloud AIO (All-in-One), pero lo modificamos para habilitar TURN API REST. También se necesita de un dominio, un certificado TLS y unos secretos para realizar el cifrado de los flujos de datos.

### 1. Dominio y certificado

1. Obtener un dominio de Talk
2. Obtener un certificado TLS apuntando al dominio.

### 2. Configurar las variables ENV con los parámetros del despliegue

1. Dominio de Nextcloud
2. Puerto de Talk
3. Los secretos a través del secreto K8S

### Configurar configmap

Añadir los valores correctos al configmap que montará la configuración de Janus.
      stun_server = "dominio_de_turn.com"
      stun_port = puerto_de_stun
turn_rest_api = "<http://servicio-api.my-namespace.svc.cluster.local/turn-rest-api/>"
nat_1_1_mapping = "IPs_del_ALB"

### 3. Implementar despliegue

Ejecutar cada manifesto YAML

1. `hpb.yaml`
2. `hpb-hpa.yaml`
3. `hpb-svc.yaml`

### 4. Implementar ingress

1. Crear objeto Ingress ALB para exponer el dominio de Talk. `hpb-ing.yaml`

2. Apuntar el dominio hacia la dirección DNS del objeto Ingress.
3. Comprobar el servidor HPB Signaling con `curl https://mi_dominio_talk.com/api/v1/welcome`. La respuesta debería incluir `nextcloud-spreed-signaling":"Welcome","version":"2.0.2~docker`

### 5. Instalar app Talk

Buscar la app en la tienda de Nextcloud e instalarla

### 6. Configurar trusted_domains

Añadir el dominio de Talk a la lista de `trusted_domains` de Nextcloud en `config.php`

### 7. Configurar app Talk

Configurar Nextcloud con la URL del HPB `https://mi_dominio_talk.com` y el secreto Signaling.

## Turn

1. Obtener un dominio de Turn <mi_dominio_turn.com>
2. Crear instancia EC2 en una VPC aislada y subred pública. (Separación y protección del cluster principal)
3. Configurar grupo de seguridad para permitir tráfico de entrada en el puerto 443 en TCP y UDP.
4. Instalar coturn y CertManager (certbot) `sudo apt install coturn certbot -y`
5. Otorgar permiso a coturn para utilizar el puerto 443 `sudo setcap 'cap_net_bind_service=+ep' /usr/bin/turnserver`
6. Crear grupo de usuario tls-cert y añadir coturn al grupo.

    ```bash
    sudo groupadd tls-cert
    sudo usermod -a -G tls-cert turnserver
    ```

7. Crear certificado TLS con el dominio Turn y Certbot `sudo certbot certonly --manual --preferred-challenges dns -d mi_dominio_turn.com`
8. Seguir los pasos de Certbot para la creación de un record TXT, y verificación del dominio y otorgación del certificado TLS.
9. Crear carpeta para almacenar los certificados sin permisos root con `sudo mkdir /etc/turnserver-certs`
10. Crear hook para copiar los certificados a una carpeta sin permisos root (coturn se ejecuta como non-root):

    ```bash
    sudo nano /etc/letsencrypt/renewal-hooks/deploy/coturn-permissions.sh
    ```

    ```sh
    #!/bin/bash
    cp /etc/letsencrypt/live/mi_dominio_turn.com/fullchain.pem /etc/turnserver-certs/fullchain.pem
    cp /etc/letsencrypt/live/mi_dominio_turn.com/privkey.pem /etc/turnserver-certs/privkey.pem
    chown root:tls-cert /etc/turnserver-certs/*.pem
    chmod 640 /etc/turnserver-certs/*.pem
    systemctl restart coturn
    ```

    ```bash
    sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/coturn-permissions.sh
    ```

11. Ejecutar hook manualmente al ser la primera vez con `sudo /etc/letsencrypt/renewal-hooks/deploy/coturn-permissions.sh`
12. Crear llave dhparam `sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048`
13. Configurar `turnserver.conf`, creando, editando y/o removiendo el símbolo `#` de comentario.

    ```bash
    sudo nano /etc/turnserver.conf
    ```

    ```conf
    listening-port=puerto
    tls-listening-port=puerto
    listening-ip=IP_PRIVADA_DE_EC2
    relay-ip=IP_PRIVADA_DE_EC22
    external-ip=IP_PUBLICA_DE_EC2
    fingerprint
    lt-cred-mech
    realm=mi_dominio_nextcloud.com
    server-name=mi_dominio_turn.com

    use-auth-secret
    static-auth-secret=SECRETO_TURN

    cert=/etc/turnserver-certs/fullchain.pem
    pkey=/etc/turnserver-certs/privkey.pem

    cipher-list="HIGH"
    dh-file=/etc/ssl/certs/dhparam.pem

    no-multicast-peers
    log-file=/var/log/turnserver.log
    simple-log

    ```

14. Habilitar coturn con `sudo systemctl enable coturn` y reiniciarlo con `sudo systemctl restart coturn`.
15. Verificar logs con `sudo journalctl -u coturn -n 100` y SSL handshake con `openssl s_client -connect mi_dominio_turn.com:puerto`
16. Configurar Nextcloud Talk Turn server en modo `turn y turns` con la URL, puerto y protocolo TCP/UDP. Una conexión correcta tendrá un visto bueno verde.
17. Configurar Nextcloud Talk Stun server con la misma URL y puerto.

### Renovación TLS

Una limitación actual es la renovación automática del certificado TLS. Debido a que se usa validación DNS, la automatización requiere de configuraciones adicionales fuera del alcance del proyecto. Para solventar la situación, se requiere ejecutar de forma manual la renovación cada 2 o 3 meses, antes de la expiración del certificado vigente.

```bash
sudo certbot certonly --manual --preferred-challenges dns -d mi_dominio_turn.com # Seguir los pasos del asistente.
sudo /etc/letsencrypt/renewal-hooks/deploy/coturn-permissions.sh # Antes de ejecutar este comando, verificar si el renewal-hook fue ejecutado automáticamente durante el comando anterior. Omitir si es el caso.
```
