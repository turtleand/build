---
title: "El primer proceso de nuestro servidor web en Python"
description: "En la primera de 12 entregas para construir un servidor web, escribe un proceso en Python que responda a PING y obsérvalo mientras espera la siguiente solicitud."
date: 2026-08-02
tags: ["sistemas operativos", "servidores", "ingeniería de software", "python"]
featured: false
draft: false
locale: es
translationKey: programs-processes-operating-system-execution
slug: 2026-08-02-programas-procesos-ejecucion-sistema-operativo
learningModule:
  id: programs-to-http
  lesson: 1
---

Al final de esta serie podrás pedirle una página a nuestro servidor web en Python desde un navegador. Hoy vas a hacer de cliente. Escribirás una solicitud, recibirás la respuesta y dejarás al servidor esperando mientras buscas su proceso desde otra terminal.

Con eso ya tendremos una pieza que aprovecharemos en las próximas entregas. Incluso con un teclado en un extremo, el servidor tiene que recibir una solicitud, decidir qué responder y esperar la siguiente. Más adelante llevaremos esa conversación a un socket y usaremos la sintaxis de HTTP.

## Escribe el primer bucle de solicitudes

Necesitas Python 3 y una terminal en Linux o macOS. En un directorio vacío, crea un archivo llamado `server.py` con este código.

```python
import os
import sys


def reply(request):
    if request == "PING":
        return "PONG"
    return "ERR unknown request"


def main():
    print(f"server pid={os.getpid()}", file=sys.stderr)
    for line in sys.stdin:
        request = line.rstrip("\n")
        print(reply(request), flush=True)


if __name__ == "__main__":
    main()
```

Nuestro formato tiene una regla sencilla. Cada solicitud termina con un salto de línea. El bucle lo quita antes de pasar la solicitud a `reply`. Al dejar esa regla fuera de la función, podemos probar qué responde el servidor sin preocuparnos por cómo le llegó la solicitud.

El programa escribe el PID, su identificador de proceso, en la salida de error estándar. Las respuestas van a la salida estándar. Ambas suelen aparecer en la misma terminal, pero un cliente que lea la salida estándar debe recibir una sola respuesta por solicitud. Con `flush=True`, el cliente puede leer cada respuesta en cuanto se escribe, incluso cuando la salida va por una tubería.

## Haz de cliente

Desde el directorio que contiene el archivo, ejecuta este comando.

```bash
python3 server.py
```

Verás una línea parecida a `server pid=4172`. Guarda tu número para el siguiente paso. Escribe `PING` y pulsa Intro, prueba con `HELLO` y vuelve a enviar `PING`. Como la terminal muestra lo que escribes, verás los dos lados de la conversación.

```text
PING
PONG
HELLO
ERR unknown request
PING
PONG
```

Deja la terminal abierta después del segundo `PONG`. El mismo programa en ejecución ha contestado tres solicitudes. ¿Qué hace entre una respuesta y la siguiente?

## Busca el proceso mientras espera

Abre una segunda terminal. Sustituye `4172` en este comando por el PID que imprimió tu servidor.

```bash
ps -p 4172 -o pid,ppid,stat,command
```

Busca tu PID y `server.py` en la misma fila. `PPID` identifica el proceso padre, normalmente el intérprete de comandos desde el que iniciaste Python. En la columna `STAT` suele aparecer una `S` de *sleeping* (dormido). El intérprete de Python ha llegado a la siguiente lectura de la entrada estándar. Hasta que lleguen datos, el núcleo del sistema operativo puede dejar ese hilo dormido y asignar la CPU a otras tareas. Vuelve a la primera terminal y envía otro `PING`. El hilo puede volver a ejecutarse y producir otro `PONG`.

Aquí hay dos cosas con tiempos de vida distintos. El código de `server.py` permanece en el disco. Al ejecutar `python3 server.py` se inicia un **proceso** en el que el intérprete ejecuta esas instrucciones. Si inicias una segunda copia mientras la primera espera, verás que tienen distintos PID. Cada una tiene su propia memoria y avanza por el bucle a su ritmo.

También se puede ver qué papel cumple el sistema operativo. La CPU ejecuta las instrucciones del intérprete en modo usuario cuando Python compara la solicitud con `"PING"`. Cuando necesita más datos, el intérprete puede pedirle al núcleo que lea a través de un **descriptor de archivo**, un número pequeño que identifica un recurso abierto en ese proceso. En un programa iniciado desde esta terminal, el descriptor 0 lee de la terminal. En la próxima entrega, el mismo descriptor leerá de una tubería.

## Cierra la sesión

En la terminal del servidor, pulsa Ctrl+D al comienzo de una línea vacía. Así, la operación de lectura devuelve un fin de archivo. El bucle termina, Python sale y reaparece el indicador de la terminal. Si iniciaste una segunda copia, ciérrala de la misma forma.

Repite el comando `ps` con el primer PID. Su fila debería haber desaparecido. El sistema operativo ha recuperado la memoria del proceso y ha cerrado sus descriptores. El archivo sigue en el disco, listo para otra ejecución.

Conserva `server.py`. En la próxima entrega, otro programa en Python enviará `PING` por una tubería y leerá `PONG` como respuesta. Cambiará quién escribe la siguiente línea. Podremos reutilizar la función `reply` tal como está.

## Fuentes

- Documentación de Python sobre la [entrada y las salidas estándar](https://docs.python.org/es/3/library/sys.html#sys.stdin)
- Manual de Linux sobre la [lectura desde un descriptor de archivo](https://man7.org/linux/man-pages/man2/read.2.html)
- *Operating Systems: Three Easy Pieces*, [capítulo sobre la abstracción del proceso](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf)
