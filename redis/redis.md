# Redis-Cluster

- Repositorio en DockerHub: <https://hub.docker.com/r/bitnami/redis-cluster>
- Repositorio en GitHub: <https://github.com/bitnami/charts/tree/main/bitnami/redis-cluster>

## 1. Obtener y configurar Helm Chart

Obtener plantilla de Redis Cluster por Bitnami:

```bash
helm show values bitnami/redis-cluster > redis-cluster-values.yaml
```

Modificar valores como usuario root, contraseña para usar secreto de K8S, replicas, etc.

## 3. Instalar

Una vez configurado apropiadamante, ejecutar la instalación con:

```bash
helm install redis-cluster bitnami/redis-cluster -f values.yaml --namespace nextcloud
```

## 4. Verificar Redis

Verificar la información del clúster de Redis con el siguiente comando:

```bash
kubectl exec -it redis-cluster-0 -- redis-cli -a myredispassword cluster info 
```

## Actualizar redis

```bash
helm upgrade redis-cluster bitnami/redis-cluster -f values.yaml
```

## Gestión de sesión con Redis

Redis Cluster no soporte la gestión de sesión PHP de Nextcloud porque este tipo de transacciones son incompatibles con Redis Cluster o Array, los cuales usan multiples master/réplicas. Puede implementarse solo cuando existe un único master, sea un servidor único de Redis o un clúster de Redis Sentinel (distinto a Redis Cluster). Será parte de arquitectura mejorada.

En su lugar, se ha implementado una anotación a nivel de Ingress para mantener sesiones abiertas.
