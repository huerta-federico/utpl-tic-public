# Autoscaler

Es un módulo de K8S que permite escalar los nodos del clúster bajo dos condiciones:

- Escalado ascendente: Existen pods pendientes que no han sido desplegados por falta de recursos en el clúster
- Escalado descendente: Existen nodos que están subutilizados y cuyos pods pueden moverse a otros nodos.

Documentación: <https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md>

## Instalación

Estás instrucciones son generales y siempre se debe verificar la documentación.

### 1. Crear cuenta de servicio

```bash
eksctl create iamserviceaccount `
  --cluster my-nextcloud `
  --namespace kube-system `
  --name cluster-autoscaler `
  --attach-policy-arn arn:aws:iam::aws:policy/AutoScalingFullAccess `
  --approve `
  --override-existing-serviceaccounts
```

### 2. Añadir el rol IAM al despliegue

```bash
kubectl -n kube-system annotate serviceaccount cluster-autoscaler `
  eks.amazonaws.com/role-arn=arn:aws:iam::<ACCOUNT_ID>:role/eksctl-my-nextcloud-cluster-ServiceRole-<RANDOM>
```

### 3. Obtener manifiesto de autoscaler

```bash
curl -o cluster-autoscaler.yaml https://raw.githubusercontent.com/kubernetes/autoscaler/cluster-autoscaler-1.32.0/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-one-asg.yaml
```

### 4. Modificar las líneas

```yaml
command:
  - ./cluster-autoscaler
  - --v=4
  - --stderrthreshold=info
  - --cloud-provider=aws
  - --skip-nodes-with-local-storage=false
  - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/my-nextcloud
```

```yaml
containers:
  - image: registry.k8s.io/autoscaling/cluster-autoscaler:v1.32.0 # Versión de autoscaler deseada
```

### 5. Desplegar Autoscaler

```bash
kubectl create -f cluster-autoscaler.yaml
```

### 6. Configurar escalado en los deployments

Tiempo de esperar antes de cerrar un pod

```yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 30
```

Permite que el pod pueda ser eyectado de un nodo.

```yaml
spec:
  template:
    metadata:
      annotations:
        cluster-autoscaler.kubernetes.io/safe-to-evict: "true"
```

Sondas de salud de un pod básicas

```yaml
spec:
  template:
    spec:
      containers:
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 30
            periodSeconds: 20
```
