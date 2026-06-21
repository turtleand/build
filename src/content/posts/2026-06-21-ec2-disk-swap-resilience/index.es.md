---
title: "Resiliencia en EC2 con disco y swap: margen antes de la emergencia"
description: "Un runbook práctico para expandir el disco de una EC2 antes de aumentar swap, para que servidores pequeños sobrevivan presión temporal sin tratar swap como RAM real."
date: 2026-06-21
tags: ["aws", "linux", "operaciones", "resiliencia"]
featured: false
draft: false
image:
  src: /images/posts/security.svg
  alt: "Ícono de escudo que representa resiliencia de infraestructura"
locale: es
translationKey: ec2-disk-swap-resilience
slug: 2026-06-21-ec2-disk-swap-resilience-es
---

Los servidores pequeños suelen fallar por razones aburridas.

Crece una cache de build. Se acumulan logs. La automatización con navegador genera un pico de memoria. Un proceso Node, un job Python o un servicio de agentes necesita más espacio de lo habitual por un rato. La máquina no falla porque la arquitectura sea dramática. Falla porque ya no quedaba margen.

Para una instancia EC2 pequeña, una mejora práctica de resiliencia es simple:

1. Expandir primero el disco raíz.
2. Después aumentar swap.

El orden importa. Swap necesita espacio en disco. Crear un swapfile grande antes de expandir un filesystem raíz casi lleno puede empeorar el problema original.

## Qué aporta el margen en disco

El margen en disco convierte crecimiento normal en mantenimiento, no en emergencia.

Pasar un volumen raíz de un tamaño pequeño, por ejemplo `20 GB`, a uno con más margen, por ejemplo `40 GB`, le da al sistema espacio para artefactos de build, caches, logs, instalaciones de paquetes y archivos temporales. No hace que el servidor sea más rápido por sí solo. Hace que el trabajo normal sea menos frágil.

Ese es el punto. Un servidor no debería volverse inestable porque un workflow normal produjo un poco más de salida de lo esperado.

## Qué aporta swap

Swap le da al kernel una válvula de presión.

Si el uso de memoria sube por un pico temporal, un swapfile de `8 GB` puede permitir que la máquina se vuelva lenta y se recupere, en lugar de matar un proceso de inmediato. Eso puede proteger servicios de agentes, herramientas Node, automatización con navegador, herramientas de build y jobs Python contra fallas abruptas por falta de memoria.

Un modelo mental útil es:

```text
pico de memoria -> lentitud temporal -> swap absorbe presión -> el servicio sobrevive
```

Sin suficiente colchón, el camino puede verse así:

```text
pico de memoria -> OOM kill -> muerte del servicio -> recuperación manual
```

## La advertencia

Swap es un colchón contra caídas, no RAM real adicional.

Si la carga necesita continuamente más memoria que la instancia tiene, más swap puede convertir una caída rápida en thrashing sostenido de disco. El servidor puede parecer congelado por más tiempo porque mueve páginas de memoria entre RAM y disco constantemente.

Eso no es resiliencia. Es un problema de tamaño.

Usá swap para picos ocasionales. Si la presión de memoria es constante, reducí la carga, corregí la fuga o pasá a una instancia con más RAM.

## Forma segura del runbook

Después de expandir el volumen EBS en AWS, verificá el dispositivo, el nombre de la partición y el tipo de filesystem dentro de la instancia. Los nombres NVMe pueden variar según la instancia y la AMI, y el filesystem determina qué comando usar para crecerlo.

Una forma común para el volumen raíz empieza así:

```bash
lsblk
df -hT /
sudo growpart /dev/nvme0n1 1
```

Después, crecé el filesystem con el comando que corresponda a `/`.

Para `ext4`:

```bash
sudo resize2fs /dev/nvme0n1p1
```

Para `xfs`:

```bash
sudo xfs_growfs -d /
```

Después verificá el resultado:

```bash
df -hT /
```

El resultado esperado es que `/` muestre el filesystem con el tamaño más grande después de expandir la partición y el filesystem.

Después, reemplazá el swapfile chico por uno más grande:

```bash
sudo swapoff /swapfile
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
swapon --show
free -h
```

Si `/etc/fstab` ya contiene una entrada para el swapfile, suele verse así:

```text
/swapfile none swap sw 0 0
```

Esa entrada hace que el swapfile persista después de reiniciar. Verificala antes de asumir persistencia.

## Ajuste opcional

Un valor bajo de swappiness le dice a Linux que prefiera RAM durante operación normal y use swap de forma más conservadora:

```bash
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf
sudo sysctl --system
```

Esto apoya el comportamiento buscado:

1. Mantenerse rápido durante el uso normal.
2. Volverse más lento durante presión temporal.
3. Recuperarse en lugar de morir.

## Bottom line

El margen en disco evita que el crecimiento normal se convierta en una emergencia.

Swap les da a los picos temporales de memoria un lugar donde ir.

Juntos, hacen que una instancia EC2 pequeña sea más tolerante, siempre que el equipo recuerde el límite: swap ayuda con picos, no con cargas permanentemente mal dimensionadas.
