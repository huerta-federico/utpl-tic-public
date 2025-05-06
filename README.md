# Readme

Este repositorio provee los recursos e instrucciones para implementar un despliegue escalable de Nextcloud en un cluster Kubernetes con EKS de AWS. Incluye también la instalación de Collabora Online, Notify-push, Talk-HPB y almacenamiento de objetos con AWS S3.

Es importante realizar los ajustes necesarios para adaptar el despliegue para cada caso de implementación específico, como los dominios web, puertos, ARNs de AWS, etc.

La arquitectura general del despliegue se muestra en `info/Diagrama de microservicios.png`

Este proyecto tomó inspiración en el artículo "Nextcloud scale-out using Kubernetes" publicado por Marko Skender.

<https://faun.pub/nextcloud-scale-out-using-kubernetes-93c9cac9e493>

## Aviso

Este proyecto es de carácter personal y académico. No está afiliado, respaldado ni mantenido por Nextcloud GmbH ni por ninguna de sus entidades asociadas.

Su propósito es exclusivamente educativo y experimental, y se comparte con la intención de servir como referencia para quienes estén explorando despliegues auto-gestionados de Nextcloud sobre infraestructura en la nube.

No se ofrecen garantías de funcionamiento, seguridad o soporte. Es probable que existan oportunidades de mejora, por lo que cualquier sugerencia, corrección o contribución es bienvenida.

### Licencia

Este proyecto está disponible bajo la Licencia MIT, lo que significa que puedes utilizar, modificar y distribuir libremente el código, siempre y cuando mantengas la atribución al autor original. El software se proporciona "tal cual", sin garantías de ningún tipo, y se utiliza bajo tu propia responsabilidad.

## Estructura del proyecto

```plaintext
.
├── autoscaler
│   ├── _default.yaml
│   └── autoscaler.md
├── cluster
│   ├── cluster.md
│   ├── cluster.yaml
│   ├── iam_policy.json
│   └── storage-class.yaml
├── collabora
│   ├── _default.yaml
│   ├── collabora.md
│   └── values.yaml
├── docker
│   ├── nextcloud
│   │   ├── apache-nextcloud.conf
│   │   ├── Dockerfile
│   │   └── supervisord.conf
│   ├── notify-push
│   │   └── Dockerfile
│   ├── nutcracker
│   │   ├── Dockerfile
│   │   └── nutcracker.conf
│   ├── talk-hpb
│   │   ├── Dockerfile
│   │   ├── healthcheck.sh
│   │   ├── server.conf.in
│   │   ├── start.sh
│   │   └── supervisord.conf
│   ├── turn-api
│   │   ├── node_modules
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   ├── index.js
│   │   ├── package-lock.json
│   │   └── package.json
│   └── docker.md
├── info
│   ├── arquitectura.md
│   ├── Diagrama de microservicios.png
│   └── preparacion.md
├── logs
│   └── ...
├── mariadb
│   ├── _default.yaml
│   └── mariadb.md
├── nextcloud
│   ├── nextcloud-hpa.yaml
│   ├── nextcloud-ing.yaml
│   ├── nextcloud-storage.yaml
│   ├── nextcloud-svc.yaml
│   ├── nextcloud.md
│   └── nextcloud.yaml
├── notify-push
│   ├── notify-hpa.yaml
│   ├── notify-push.md
│   ├── nextcloud-svc.yaml
│   └── notify.yaml
├── redis
│   ├── _default.yaml
│   └── redis.md
├── secretos
│   └── secretos.md
├── talk
│   ├── turn-api
│   │   ├── turn-api-svc.yaml
│   │   ├── turn-api.md
│   │   └── turn-api.yaml
│   ├── talk-cm.yaml
│   ├── talk-ing.yaml
│   ├── talk-svc.yaml
│   ├── talk.md
│   └── talk.yaml
├── test
│   ├── debug.yaml
│   ├── scale-test.txt
│   └── test.md
└── README.md
```

## Herramientas necesarias

- Docker Desktop
- AWS CLI
- EKSCTL
- kubectl
- OpenSSL
- Helm
- Repositorio Helm de Bitnami
- Base64
- nodeJS, NPM

## Orden de instalación

Ir a cada carpeta en este orden, leer cada archivo MD y realizar los pasos indicados. Realizar los ajustes necesarios.

1. docker
2. info/preparacion
3. cluster
4. autoscaler
5. secrets
6. mariadb
7. redis
8. nextcloud
9. notify-push
10. collabora
11. talk-hpb
12. test (opcional)
