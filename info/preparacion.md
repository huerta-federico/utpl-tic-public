# Componentes y configuraciones preliminares

Herramientas y configuraciones necesarias antes de iniciar el despliegue.

## AWS CLI

Para usar los comandos de AWS-CLI, kubectl y eksctl se deben instalar estos componentes, configurarlos, añadir credenciales y ajustar contextos.

Documentación: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>

1. Instalar AWS CLI
2. Copiar credenciales CLI
3. Verificar credenciales con `aws sts get-caller-identity`
4. Instalar kubernetes-cli
5. Instalar EKSCTL
6. Agregar eksctl a la variable `path` del sistema

## Configurar Helm

Se instala Helm usando chocolatey en Windows.\

Documentación: <https://helm.sh/docs/>

También se añade el repositorio de Bitnami.

Documentación: <https://bitnami.com/>
Plantillas de recursos computacionales: <https://github.com/bitnami/charts/blob/main/bitnami/common/templates/_resources.tpl#L15>

```bash
choco install kubernetes-helm
helm version
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

## Instalar base64 para facilitar el uso de comandos Bitnami

```bash
choco install base64
```
