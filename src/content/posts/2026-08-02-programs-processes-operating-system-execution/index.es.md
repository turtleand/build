---
title: "Programas, procesos y ejecución del sistema operativo"
description: "Cómo las instrucciones estáticas se convierten en un servidor en ejecución, qué contiene un proceso y dónde media el sistema operativo entre el código y el hardware."
date: 2026-08-02
tags: ["sistemas operativos", "servidores", "ingeniería de software"]
featured: false
draft: false
locale: es
translationKey: programs-processes-operating-system-execution
slug: 2026-08-02-programas-procesos-ejecucion-sistema-operativo
learningModule:
  id: programs-to-http
  lesson: 1
---

Un servidor comienza como instrucciones almacenadas en algún lugar. Esas instrucciones no hacen nada hasta que un sistema en ejecución las carga, les asigna recursos y las programa en un procesador.

El modelo central es:

```text
programa almacenado
        ↓ inicio
el sistema operativo crea un proceso
        ↓ planificación
la CPU ejecuta las instrucciones del proceso
        ↓ llamadas al sistema
el sistema operativo realiza trabajo protegido
```

Esta es la lección 1 de un recorrido de 12 lecciones desde la ejecución de un programa hasta el ciclo de vida completo de una solicitud HTTP. Los sockets, las conexiones, los bytes y HTTP pertenecen a un proceso en ejecución que pide al sistema operativo que gestione recursos en su nombre.

## Un programa no es un proceso

Un **programa** es un conjunto de instrucciones en una forma almacenada. Puede ser un ejecutable compilado, un script, bytecode o una colección de archivos cargados por un entorno de ejecución.

Un **proceso** es una instancia de ejecución gestionada por el sistema operativo.

La distinción importa porque un programa puede producir varios procesos. Si inicias el mismo programa de servidor tres veces, las instrucciones almacenadas pueden ser idénticas, pero el sistema operativo crea tres contextos de ejecución separados.

Cada proceso normalmente tiene su propio:

- Espacio de direcciones virtual para código, datos, pilas y heaps
- Uno o más hilos que pueden planificarse
- Identificador de proceso, normalmente llamado PID
- Tabla de recursos abiertos, representados en sistemas tipo Unix mediante descriptores de archivo
- Identidad de seguridad, límites, entorno y estado de trabajo actual

Por tanto, un proceso es más que código en movimiento. Es código más el contexto gestionado necesario para ejecutarlo.

## Qué sucede cuando se inicia un programa

La ruta exacta depende de la plataforma y del entorno de ejecución, pero la secuencia duradera es:

1. Un usuario, shell, gestor de servicios u otro proceso solicita un inicio.
2. El sistema operativo crea un nuevo contexto de proceso.
3. Establece memoria virtual y carga el ejecutable o intérprete.
4. Prepara la pila inicial, los argumentos, el entorno y los recursos heredados.
5. Crea el primer hilo y lo deja listo para ejecutarse.
6. El planificador asigna tiempo de CPU al hilo.
7. La CPU empieza a ejecutar instrucciones en el punto de entrada del programa.

En un sistema tipo Unix, la creación de procesos y la carga de programas suelen explicarse mediante operaciones como `fork()` y `execve()`. El mecanismo exacto es menos importante aquí que el límite: el código de aplicación no se asigna memoria física, no elige tiempo de CPU sin restricciones ni toma control directo de los dispositivos. El sistema operativo establece y aplica el contexto de ejecución.

## Qué media el sistema operativo

El sistema operativo ofrece abstracciones controladas sobre hardware compartido.

| Necesidad de la aplicación | Abstracción del sistema operativo |
|---|---|
| Tiempo en un procesador | Hilos, planificación, prioridades |
| Memoria | Espacios de direcciones virtuales, páginas, protección |
| Datos almacenados | Archivos y directorios |
| Comunicación de red | Sockets y pilas de red |
| Acceso a dispositivos | Controladores e interfaces de dispositivos |
| Aislamiento y autoridad | Procesos, usuarios, permisos, límites |

Esta mediación cumple dos objetivos.

Primero, hace utilizable el hardware. Un servidor no necesita conocer el protocolo eléctrico de un adaptador de red. Escribe bytes mediante una interfaz de socket, y el sistema operativo junto con el controlador gestionan las capas inferiores.

Segundo, protege el sistema. Un proceso no debería poder sobrescribir la memoria de otro proceso ni controlar un dispositivo sin permiso.

## El sistema operativo no ejecuta cada instrucción por el programa

Decir que el sistema operativo está entre los programas y el hardware es útil, pero puede ser engañoso si se interpreta literalmente.

La mayoría de las instrucciones normales de una aplicación se ejecutan directamente en la CPU en **modo usuario**. El sistema operativo no interpreta cada suma, comparación o llamada a función.

El kernel interviene cuando se necesita coordinación protegida, por ejemplo:

- Un proceso hace una **llamada al sistema** para solicitar un servicio del sistema operativo
- La CPU recibe una interrupción de un dispositivo o temporizador
- Una instrucción provoca un fallo, como acceder a una página de memoria no asignada
- El planificador pausa un hilo ejecutable y selecciona otro

El modelo más preciso es:

> El código de aplicación se ejecuta directamente dentro de los límites establecidos por el sistema operativo. Entra en el kernel cuando necesita recursos protegidos o coordinación de todo el sistema.

## Cómo esto se convierte en un servidor en ejecución

Un servidor no es un tipo especial de programa en reposo. Se convierte en servidor por lo que hace su proceso después del inicio.

Una secuencia simplificada es:

```text
cargar programa
  → crear proceso
  → inicializar el entorno y el estado de la aplicación
  → pedir un socket al sistema operativo
  → pedir al sistema operativo que lo asocie con una dirección
  → pedir al sistema operativo que escuche
  → esperar y gestionar conexiones
```

Los primeros tres pasos explican la ejecución. Los pasos restantes introducen la ruta de comunicación que se desarrolla en las siguientes lecciones.

El proceso posee el estado de la aplicación, como las reglas de enrutamiento o los manejadores de solicitudes. El sistema operativo posee mecanismos protegidos, como la planificación, los mapas de memoria, el estado de los sockets y los búferes de red. Un framework puede ocultar muchas llamadas, pero no puede eliminar este límite.

## Un pequeño ejercicio de observación

Python incluye un servidor HTTP sencillo que sirve para observar un proceso. Es para aprendizaje local, no para producción.

Inícialo en una terminal:

```bash
python3 -m http.server 8000
```

En otra terminal, encuentra el proceso:

```bash
pgrep -af "python3 -m http.server 8000"
```

Usa el PID de esa salida para inspeccionar su estado gestionado:

```bash
ps -o pid,ppid,stat,comm,args -p <PID>
ls -l /proc/<PID>/fd
```

En Linux, `/proc/<PID>/fd` expone enlaces que representan los descriptores de archivo abiertos del proceso. Normalmente verás la entrada, salida y error estándares, además de un socket. El programa pidió el socket, pero el kernel mantiene el recurso subyacente.

Detén el servidor con `Ctrl+C`. Esa señal llega al proceso, el entorno de ejecución sale y el sistema operativo recupera sus recursos.

## Tres distinciones que debes conservar

1. **Programa frente a proceso:** las instrucciones almacenadas no son lo mismo que una instancia de ejecución activa.
2. **Espacio de usuario frente a espacio del kernel:** las instrucciones de la aplicación suelen ejecutarse directamente, mientras que las operaciones protegidas entran en el kernel.
3. **Estado de la aplicación frente a estado del sistema operativo:** el servidor controla su propia lógica, mientras que el sistema operativo controla los recursos compartidos y el aislamiento.

Estas distinciones evitan un error común: imaginar que un framework, un entorno de ejecución, un proceso, un sistema operativo y una CPU son una sola máquina indivisible. Son capas que cooperan con responsabilidades diferentes.

## A continuación: por qué los procesos necesitan rutas de comunicación

El aislamiento de procesos es valioso porque limita las interferencias accidentales y no autorizadas. Ese aislamiento también crea el siguiente problema: los procesos separados no pueden acceder a la memoria de otros cuando quieran.

La próxima lección introduce la comunicación entre procesos, los mecanismos controlados que permiten a los procesos aislados intercambiar información.

## Fuentes

- Página del manual de Linux para [`execve(2)`](https://man7.org/linux/man-pages/man2/execve.2.html)
- Vista general del manual de Linux para [`proc(5)`](https://man7.org/linux/man-pages/man5/proc.5.html)
- Vista general del manual de Linux para [`sched(7)`](https://man7.org/linux/man-pages/man7/sched.7.html)
- *Operating Systems: Three Easy Pieces*, [capítulo sobre procesos](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf)
