
# Comandos debug

## Mostrar pods corriendo en un nodo

`kubectl get pods --all-namespaces -o wide --field-selector spec.nodeName=<nombre de pod>`

## Mostrar estado de Redis Cluster

`kubectl exec -it redis-cluster-0 -- redis-cli -a <password> cluster info`

## Mostrar estado de MariaDB Galera

Abrir una sesión mySQL en cualquiera de las pods.

```bash
kubectl exec -it mariadb-galera-0 -- mysql -unextcloud_db -p
```

Ejecutar los siguientes comandos SQL.

```sql
SHOW STATUS LIKE 'wsrep_cluster_status';
SHOW STATUS LIKE 'wsrep_%';
SELECT User FROM mysql.user;
```

Y verificar que los resultados sean:

- `wsrep_cluster_status → Primary`
- `wsrep_local_state_comment → Synced`
- `wsrep_ready → ON`

# Logs

## Obtener log de pod

`kubectl logs nombre_de_pod > logs/nextcloud-pod.txt`

## Obtener log de Nextcloud

```bash
kubectl cp nextcloud/nombre_de_pod:/var/www/html/data/nextcloud.log logs/nextcloud.log`
```

## Limpiar log de Nextcloud

Ir a `var/www/html/data` y ejecutar

```bash
truncate -s 0 data/nextcloud.log
```

# Tests

## Prueba de escalado automático

### Escalado de pods con HPA

Escalar las réplicas deploy scale-test

Observar el comportamiento del escalado

```bash
kubectl get hpa nextcloud-hpa --watch
```

Ver nuevas pods creadas

```bash
kubectl get pods
```

Para cancelar las peticiones presionar CTRL+C en la terminal donde se ejecutan.

Tomar en cuenta que se debe evitar tener otras conexiones abiertas a Nextcloud durante la prueba porque pueden afectar el comportamiento erróneamente. Esto quiere decir que se deben cerrar los navegadores web y evitar otros comandos `curl`

### Escalado de nodos con autoscaler

Crear la pod `scale-test`, la cual solicitará más recursos de lo que cualquier nodo puede servir, por lo que autoscaler intentará crear la cantidad máxima de nodos permitidos

```scale-test.yaml```

# Debug

## Advertencias cosméticas

La siguiente advertencia es cosmética y no tiene impacto funcional ni representa una vulnerabilidad. Este comportamiento se presenta por la forma en la que AWS genera el LB y la resolución de conexiones (DNS, dominios, etc) y servicios internos en EKS.

```plain
Could not check that your web server serves `.well-known` correctly. Please check manually. To allow this check to run you have to make sure that your Web server can connect to itself. Therefore it must be able to resolve and connect to at least one of its `trusted_domains` or the `overwrite.cli.url`. This failure may be the result of a server-side DNS mismatch or outbound firewall rule. For more details see the documentation ↗.
```

Las dos siguientes advertencias tampoco son críticas y pueden ser ignoradas por el momento:

```plain
Your installation has no default phone region set. This is required to validate phone numbers in the profile settings without a country code. To allow numbers without a country code, please add "default_phone_region" with the respective ISO 3166-1 code of the region to your config file. For more details see the documentation ↗.

You have not set or verified your email server configuration, yet. Please head over to the "Basic settings" in order to set them. Afterwards, use the "Send email" button below the form to verify your settings. For more details see the documentation ↗.
```

```plain
You have not set or verified your email server configuration, yet. Please head over to the "Basic settings" in order to set them. Afterwards, use the "Send email" button below the form to verify your settings. For more details see the documentation ↗
```

Ignorar, no es esencial.

```plain
No recording backend configured
```

Componente para grabar llamadas y videollamadas. Requiere de un servidor adicional con capacidades de procesamiento moderado y almacenamiento.

```plain
No SIP backend configured
```

Componente para soportar llamadas VoIP. Requiere grandes cambios y recursos sustancias para implementar.

# Verificar módulos de PHP

Con una terminal shell dentro de una pod de Nextcloud, para ver los módulos PHP instalados se usa el siguiente comando:

```bash
php -m
```

# Verificar Ingress

El objeto Ingress se crea en su propio namespace por lo que cualquier comando de kubectl debe incluir `-n ingress-nginx`

Reiniciar el controlador de ingress:

```bash
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
```

Conseguir IP del nginx-controller

```bash
kubectl get po -n ingress-nginx -o wide
```

Modificar la configuración de ingress-controller

```bash
kubectl edit configmap ingress-nginx-controller -n ingress-nginx
```

# Ver los recursos en todos los namespaces

```bash
kubectl get deploy --all-namespaces
```
