# Secretos

Crear un secreto mediante un YAML o directamente en la consola siguiendo los siguientes formatos.

Evitar ciertos símbolos especiales en las contraseñas porque pueden causar problemas.

Cadenas secretas pueden crearse utilizando `openssl rand -hex 32` y almacenarlas en un lugar seguro.

## Redis

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: redis-auth
  namespace: nextcloud
type: Opaque
stringData:
  REDIS_PASSWORD: string

```

## MariaDB

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mariadb-secret
  namespace: nextcloud
  labels:
    app: mariadb
type: Opaque
stringData:
  mariadb-root-password: string
  mariadb-password: string
  mariadb-galera-mariabackup-password: string
```

## Collabora

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: collabora-secret
  namespace: collabora
  labels:
    app: collabora
type: Opaque
stringData:
  username: string
  password: string
```

## Talk

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: talk-secret
  namespace: talk
  labels:
    app: talk
type: Opaque
stringData:
  TURN_SECRET: string
  SIGNALING_SECRET: string
  INTERNAL_SECRET: string
  TURN_REST_API_KEY: string

```
