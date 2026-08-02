---
title: "Programs, Processes, and Operating-System Execution"
description: "How static instructions become a running server, what a process contains, and where the operating system mediates between application code and hardware."
date: 2026-08-02
tags: ["operating systems", "servers", "software engineering"]
featured: false
draft: false
locale: en
translationKey: programs-processes-operating-system-execution
slug: 2026-08-02-programs-processes-operating-system-execution
learningModule:
  id: programs-to-http
  lesson: 1
---

A server begins as instructions stored somewhere. Those instructions do nothing until a running system loads them, gives them resources, and schedules them on a processor.

The core model is:

```text
program on storage
        ↓ launch
operating system creates a process
        ↓ schedule
CPU executes the process's instructions
        ↓ system calls
operating system performs protected work
```

This is lesson 1 of a 12-lesson path from program execution to the complete HTTP request lifecycle. Sockets, connections, bytes, and HTTP all belong to a running process that asks the operating system to manage resources on its behalf.

## A program is not a process

A **program** is a set of instructions in a stored form. It might be a compiled executable, a script, bytecode, or a collection of files loaded by a runtime.

A **process** is an operating-system-managed instance of execution.

The distinction matters because one program can produce several processes. If you start the same server program three times, the stored instructions may be identical, but the operating system creates three separate execution contexts.

Each process normally has its own:

- Virtual address space for code, data, stacks, and heaps
- One or more threads that can be scheduled
- Process identifier, often called a PID
- Table of open resources, represented on Unix-like systems by file descriptors
- Security identity, limits, environment, and current working state

A process is therefore more than code currently moving. It is code plus the managed context required to run it.

## What happens when a program starts

The exact path depends on the platform and runtime, but the durable sequence is:

1. A user, shell, service manager, or another process requests a launch.
2. The operating system creates a new process context.
3. It establishes virtual memory and loads the executable or interpreter.
4. It prepares the initial stack, arguments, environment, and inherited resources.
5. It creates the first thread and makes that thread eligible to run.
6. The scheduler gives the thread time on a CPU.
7. The CPU begins executing instructions at the program's entry point.

On a Unix-like system, process creation and program loading are often discussed through operations such as `fork()` and `execve()`. The exact mechanism is less important here than the boundary: application code does not assign itself physical memory, choose unrestricted CPU time, or directly take ownership of devices. The operating system establishes and enforces the execution context.

## What the operating system mediates

The operating system provides controlled abstractions over shared hardware.

| Application needs | Operating-system abstraction |
|---|---|
| Time on a processor | Threads, scheduling, priorities |
| Memory | Virtual address spaces, pages, protection |
| Stored data | Files and directories |
| Network communication | Sockets and network stacks |
| Device access | Drivers and device interfaces |
| Isolation and authority | Processes, users, permissions, limits |

This mediation serves two goals.

First, it makes hardware usable. A server does not need to know the electrical protocol of a network adapter. It writes bytes through a socket interface, and the operating system plus device driver handle lower layers.

Second, it protects the system. One process should not be able to overwrite another process's memory or control a device without permission.

## The OS is not executing every instruction for the program

Saying that the operating system sits between programs and hardware is useful, but it can become misleading if taken literally.

Most ordinary application instructions run directly on the CPU in **user mode**. The operating system does not interpret each addition, comparison, or function call.

The kernel becomes involved when protected coordination is required, including:

- A process makes a **system call** to request an operating-system service
- The CPU receives an interrupt from a device or timer
- An instruction triggers a fault, such as accessing an unmapped memory page
- The scheduler pauses one runnable thread and selects another

So the more precise model is:

> Application code runs directly within boundaries established by the operating system. It crosses into the kernel when it needs protected resources or system-wide coordination.

## How this becomes a running server

A server is not a special kind of program at rest. It becomes a server through what its process does after startup.

A simplified sequence is:

```text
load program
  → create process
  → initialize runtime and application state
  → ask the OS for a socket
  → ask the OS to associate it with an address
  → ask the OS to listen
  → wait for and handle connections
```

The first three steps explain execution. The remaining steps introduce the communication path developed in later lessons.

The process owns application-level state, such as routing rules or request handlers. The operating system owns protected mechanisms, such as scheduling, memory mappings, socket state, and network buffers. A framework can hide many calls, but it cannot remove this boundary.

## A small observation exercise

Python includes a simple HTTP server that is useful for observing a process. It is for local learning, not production use.

Start it in one terminal:

```bash
python3 -m http.server 8000
```

In another terminal, find the process:

```bash
pgrep -af "python3 -m http.server 8000"
```

Use the PID from that output to inspect its managed state:

```bash
ps -o pid,ppid,stat,comm,args -p <PID>
ls -l /proc/<PID>/fd
```

On Linux, `/proc/<PID>/fd` exposes links representing the process's open file descriptors. You will normally see standard input, output, error, and a socket. The program asked for the socket, but the kernel maintains the underlying resource.

Stop the server with `Ctrl+C`. That signal reaches the process, the runtime exits, and the operating system reclaims its resources.

## Three distinctions to keep

1. **Program vs. process:** stored instructions are not the same as a live execution instance.
2. **User space vs. kernel space:** application instructions usually run directly, while protected operations cross into the kernel.
3. **Application state vs. operating-system state:** the server controls its own logic, while the operating system controls shared resources and isolation.

These distinctions prevent a common mistake: imagining that a framework, runtime, process, operating system, and CPU are one undivided machine. They are cooperating layers with different responsibilities.

## Next: why processes need communication paths

Process isolation is valuable because it limits accidental and unauthorized interference. Isolation also creates the next problem: separate processes cannot simply reach into one another's memory whenever they want.

The next lesson introduces inter-process communication, the controlled mechanisms that allow isolated processes to exchange information.

## Sources

- Linux manual page for [`execve(2)`](https://man7.org/linux/man-pages/man2/execve.2.html)
- Linux manual overview of [`proc(5)`](https://man7.org/linux/man-pages/man5/proc.5.html)
- Linux manual overview of [`sched(7)`](https://man7.org/linux/man-pages/man7/sched.7.html)
- *Operating Systems: Three Easy Pieces*, [Processes chapter](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf)
