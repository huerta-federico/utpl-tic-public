# Arquitectura

El despliegue de Nextcloud será orientado a Microservicios utilizando una imagen Docker personalizada pero basada en la imagen oficial. Los contenedores serán orquestrados mediante Kubernetes. Kubernetes además permite aplicar el concepto de IaC lo que facilita la migración del despliegue a cualquier tipo de infraestructura sea un servidor local, en la nube (AWS) o híbrido.

## Abreviaturas

- **LB**: Balanceador de carga
- **ALB**: Balanceador de carga de Amazon
- **AZ**: Availability Zone o zona de disponibilidad
- **EKS**: Elastic Kubernetes Service
- **K8S**: Kubernetes
- **CLI**: Command-line interface, o interfaz de comandos de línea
- **BD**: Base de datos
- **TLS**: Transport Layer Security
- **SSL**: Secure Sockets Layer
- **CA**: Certificate Authority
- **IaC**: Infraestructure as Code
- **FQDN**: Fully Qualified Domain Name
- **NC**: Nextcloud
- **HPB**: High Performance Backend
- **TURN**: Traversal Using Relays around NAT
- **STUN**: Session Traversal Utilities for NAT
- **WSS**: Web Socket Secure

## Componentes principales

### Nextcloud

- Contenedor de Nextcloud en base a Apache y PHP-FPM

### MariaDB Galera Cluster

- Despliegue mediante Helm Chart de Bitnami.
- Cluster multi-master con 3 nodos primarios
- Escritura, lectura y sincronización simultánea.

Almacena metadatos de Nextcloud.

### Redis Cluster

- Despliegue mediante Helm Chart de Bitnami
- Cluster con Sharding y no Sentinel.
- 3 nodos primarios, 1 réplica por nodo primario.
- Aumenta significativamente el rendimiento de Nextcloud a través de cache y mecanismos de bloqueo de archivos.

### Notify-push

Servicio para enviar notificaciones push a los usuarios. Es una imagen Docker sencilla.

### Talk-HPB

Backend para Talk basado en Talk AIO.

#### TURN REST API

API sencilla para generar credenciales TURN.

### Turn-server

Servidor STUN/TURN independiente (en una VM EC2) que ejecuta y expone coturn (o eturnal).

### Almacenamiento persistente

Los volúmenes de persistencia (PVC) en el cluster aseguran la persistencia de datos frente al reinicio y estado efemereo de las pods. Son aplicables a Nextcloud, Redis y MariaDB.

### Escalado horizontal

#### Aplicaciones

El escalado se realiza mediante un HPA que escala el número de réplicas en base al uso promedio del CPU entre todas las réplicas. Se puede establecer un mínimo y máximo de réplicas y cual porcentaje del uso de CPU es el objetivo.

Ciertas aplicaciones no consumen mucho CPU ni RAM, sino ancho de banda. Escalado dinámico requiere herramientas de monitoreo más avanzadas.

#### Bases de datos

El escalado de MariaDB, PostgreSQL o Redis debe gestionarse de forma manual porque la replicación en BDs son usualmente más complicadas por el hecho que deben establecerse nodos maestros, esclavos, etc.

- MariaDB, en caso de ser externa, puede escalarse mediante Galera Cluster o un SaaS como AWS RDS.
- PostgreSQL puede aumentar el número de réplicas aunque por el momento, se recomienda solo dos réplicas.
- Un clúster de Redis requiere un mínimo de 6 nodos (3 maestros y 3 réplicas, una réplica por cada maestro). Se puede aumentar el número de nodos pero se debe reconfigurar el clúster cada vez que se lo hace.
- MariaDB Galera Cluster con Helm Chart se puede escalar de forma manual aunque se debe tener cuidado con la configuración del clúster y el proceso bootstrap.

## Cumplimiento de seguridad, privacidad, disponibilidad y escalabilidad

Kubernetes es IaC, transferible fácilmente a cualquier proveedor IaaS.

AWS ofrece EKS (Elastic Kubernetes Service) el cual garantiza:

- Seguridad en AWS
  - Seguridad a través de su firewall, controles de acceso, etc.
  - Almacenamiento redundante en S3 y EFS. Varias zonas de disponibilidad distantes geográficamente. Replicación automática.
  - Adicionalmente, se puede configurar respaldos extras.
  - Credenciales internas de K8S y BDs almacenadas con secretos K8S, cifradas y hasheadas.
  - Se puede forzar autenticación 2FA en cuenta admin de AWS y usuarios de Nextcloud.
  - Cuenta AWS adicional dedicada únicamente al clúster K8S con permisos mínimos y separada del admin AWS principal (mediante IAM)
  - EKS asegura redundancia/respaldo del nodo maestro o controlador.

- Privacidad
  - HTTPS forzado en configuración de aplicación e Ingress (LB en AWS o local)
  - Certificado TLS auto-firmado (fácilmente se cambia por uno válido)
  - HSTS forzado en Ingress
  - Cifrado a nivel de aplicación con Nextcloud. Cualquier archivo subido es cifrado.
  - Nextcloud es FOSS y no envía datos/metadatos a terceros.
  - AWS no tiene acceso a los datos confidenciales dentro del clúster

- Disponibilidad
  - Todo el despliegue utiliza contenedores con varias replicas. Una réplica cae, otra toma su puesto, y K8S inicia una nueva réplica automáticamente. PostgreSQL clúster realiza lo mismo.
  - A través de AWS y su infraestructura redundante (Availability zones). Siempre hay dos zonas mínimas, o dos Datacenters. 99.99% de disponibilidad con dos zonas, 99.999% con tres zonas.
  - Actualizaciones rollout o en cadena. Se actualiza una réplica a la vez, y solo si la actualización fue exitosa, se elimina una réplica con la versión anterior, así hasta que todas las réplicas estén actualizadas.
  - EKS asegura disponibilidad del nodo maestro o controlador.

- Escabilidad
  - El despliegue en K8S usa HPA (Horizontal Pod Autoscaling) a nivel de aplicación. A nivel de BD, se puede aumentar el número de réplicas manualmente.
  - Las pods en el despliegue se pueden modificar para pedir más recursos de CPU y memoria (no recomendado, mejor aumentar número de pods)
  - Mediante el servicio *elástico* EKS donde puedo aumentar el número de nodos (VMs o intancias EC2) manualmente o de forma automática mediante 'Auto-scaling'.
  - Se puede realizar escalado vertical u horizontal en EKS. Inclusive se puede variar el tamaño de VMs de forma dinámica. Una instancia de 10 hilos, 16 GB RAM, y otra 4 hilos, 8 GB RAM, dependiendo de la carga en el clúster.
  - EKS puede escalar automáticamente el número de réplicas del LB o Ingress para soportar más peticiones.

## Cumplimiento de arquitectura mejorada

- Quitar las BDs del clúster e implementarlas externamente mediante SaaS como AWS RDS.
- Utilizar Terraform para automatizar aún más la implementación mediante IaC más robusto.
- Seguridad: Replicación más robusta, respaldos más extensos, infraestructura local y cerrada al público.
- Privacidad: Cifrado de extremo a extremo, limitar Nextcloud a redes privadas (VPNs, vLANs)
- Escalabilidad: EKS Auto-scaling, Nextcloud Global Scale, bases de datos server-less (muy caras)
- Mejor gestión de sesiones PHP mediante Redis Sentinel. Actualmente incompatible con Redis Cluster.
