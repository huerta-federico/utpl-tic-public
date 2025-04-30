# MariaDB Galera Cluster

Cluster de MariaDB en base a Galera y desplegado mediante Bitnami.

- Repositorio en DockerHub: <https://hub.docker.com/r/bitnami/mariadb-galera/>
- Repositorio en GitHub: <https://github.com/bitnami/containers/tree/main/bitnami/mariadb-galera>

La implementación de la BD puede variar en lo que respecta al motor de BD, el servidor, el número de réplicas, la ubicación de las instancias, etc. Nextcloud soporta MySQL/MariaDB, PostgreSQL y SQLite (no recomendado para producción).

- user: `usuario`
- user-password: `contraseña`
- database: `base_de_datos`
- host: `nombre_de_servicio.cluster.svc.cluster.local:puerto`

## 2. Obtener plantilla de MariaDB Galera Cluster por Bitnami

```bash
helm show values bitnami/mariadb-galera > mariadb-galera-values.yaml
```

## 3. Modificar plantilla

Modificar valores como usuario root, contraseña para usar secreto de K8S, nombre de base de datos, cifrado TLS entre réplicas, etc.

## 4. Instalar con Helm

Una vez configurado apropiadamante, ejecutar la instalación con:

```bash
helm install mariadb-galera bitnami/mariadb-galera -f values.yaml --namespace nextcloud
```

## 5. Verificar MariaDB Galera Cluster

Abrir una sesión mySQL en cualquiera de las pods.

```bash
kubectl exec -it mariadb-galera-0 -- mysql -uusuario -p # uusario no es un error, la primera u es de user
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

## Debug

### Comandos de MariaDB

Para entrar a la base de datos, primero se obtiene la contraseña (si fue auto-generada), se crea una sesión shell en una pod, y se ejecuta mysql.

```bash
echo "$(kubectl get secret --namespace default mariadb-galera -o jsonpath="{.data.mariadb-root-password}" | base64 -d)"
kubectl exec -ti mariadb-galera-0 -- sh
mysql -h mariadb-galera -P 3306 -uusuario -p
```

Una vez dentro de mysql se puede verificar la existencia de la BD nextcloud.

### Depuración de problemas de bootstrap

All the nodes with `safe_to_bootstrap: 0`

In this case the cluster was not stopped cleanly and you need to pick one to force the bootstrap from. The one to be chosen in the one with the highest `seqno` in `/bitnami/mariadb/data/grastate.dat`. The following example shows how to force bootstrap from node 3.

Revisar estado de boostrap

```bash
kubectl exec -it mariadb-galera-0 -n nextcloud -- cat /bitnami/mariadb/data/grastate.dat
```

```bash
helm upgrade mariadb-galera bitnami/mariadb-galera `
--set rootUser.password= `
--set galera.mariabackup.password= `
--set galera.bootstrap.forceBootstrap=true `
--set galera.bootstrap.bootstrapFromNode=0 `
--set galera.bootstrap.forceSafeToBootstrap=true `
--set podManagementPolicy=Parallel
```

### Editar MariaDB

Editar MariaDB

```bash
kubectl edit statefulset mariadb
```

#### Actualizar Helm chart

```bash
helm upgrade mariadb-galera bitnami/mariadb-galera -f values.yaml --namespace nextcloud
```
