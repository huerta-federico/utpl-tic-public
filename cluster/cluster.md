# Clúster K8S

El clúster K8S se implementa utilizando EKSCTL, una herramienta CLI para agilizar el uso de EKS.

Documentación: <https://eksctl.io/>

## Implementación

### 1. Crear clúster en EKS con EKSCTL

Definir un archivo `cluster.yaml` con las configuraciones apropiadas en base a la documentacion de eksctl y crear el clúster con esas especificaciones.

```bash
eksctl create cluster -f cluster.yaml
```

### 2. Seleccionar cluster EKS

```bash
aws eks update-kubeconfig --region region-code --name my-cluster
```

### 3. Crear namespaces

```bash
kubectl create namespace nextcloud talk collabora testing
```

### 4. Seleccionar namespace (opcional)

Configurar contexto del namespace

 ```bash
 kubectl config set-context --current --namespace=nextcloud # Es el namespace que más usaremos
 ```

### 5. Crear almacenamiento persistente

Crear storage class con binding automática para que los contenedores puedan crear PVC durante la creación. El proveedor será AWS-EBS.

```bash
kubectl create -f storage-class.yaml
```

### 6. Instalación manual de Metric-server (opcional)

Instalar servidor de métricas, necesario para HPA y Autoscaler

Documentación: <https://github.com/kubernetes-sigs/metrics-server>

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.7.0.2/components.yaml # innecesario, EKSCTL debería instalarlo
```

### 7. Instalar AWS LB

Permite desplegar ALB y NLB en AWS mediante objetos Ingress.

Doc: <https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html>

Preparar proveedor IAM OIDC

```bash
eksctl utils associate-iam-oidc-provider --cluster my-cluster --approve # innecesario, EKSCTL debería instalarlo
```

Descargar e instalar política AWS LB

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.12.0/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
```

Instalar Helm Charts de EKS

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks
kubectl create namespace kube-system # innecesario, EKSCTL debería crearlo
```

Crear cuenta IAM para el controlador AWS LB

```bash
eksctl create iamserviceaccount `
    --cluster=my-cluster `
    --namespace=kube-system `
    --name=aws-load-balancer-controller `
    --attach-policy-arn=<arn de la política creada> `
    --override-existing-serviceaccounts `
    --region us-east-1 `
    --approve
```

Instalar AWS LB Controller con Helm

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=my-cluster --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller
kubectl get deployment -n kube-system aws-load-balancer-controller
```

Verificar AWS LB

```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

## Comandos de utilidad de EKSCTL

Escalar nodos. Innecesario en nodos gestionados con Autoscaler.

```bash
eksctl scale nodegroup --cluster my-cluster --name encrypted-nodes --nodes=3
eksctl get nodegroup --cluster my-cluster --region us-east-1 --name encrypted-nodes
```
