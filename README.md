# Readme

Este repositorio provee los recursos e instrucciones para implementar un despliegue escalable de Nextcloud en un cluster Kubernetes con EKS de AWS. Incluye también la instalación de Collabora Online, Notify-push, Talk-HPB y almacenamiento de objetos con AWS S3.

Es importante realizar los ajustes necesarios para adaptar el despliegue para cada caso de implementación específico, como los dominios web, puertos, ARNs de AWS, etc.

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
