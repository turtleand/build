---
title: "The First Process of Our Python Web Server"
description: "In the first of 12 lessons on building a web server, write a Python process that answers PING and inspect it while it waits for the next request."
date: 2026-08-02
tags: ["operating systems", "servers", "software engineering", "python"]
featured: false
draft: false
locale: en
translationKey: programs-processes-operating-system-execution
slug: 2026-08-02-programs-processes-operating-system-execution
learningModule:
  id: programs-to-http
  lesson: 1
---

By the end of this series, a browser will be able to ask our Python web server for a page. Today you’ll play the part of the client. You’ll type a request, get a reply, then leave the server waiting while you find its process in a second terminal.

This gives us a piece we can build on. Receiving a request, deciding what to return, and waiting for another request already make sense with a keyboard on one end. Later we’ll move that conversation onto a socket and give it HTTP syntax.

## Write the first request loop

You’ll need Python 3 and a terminal on Linux or macOS. In an empty directory, create a file named `server.py` with this code.

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

We’ve made one decision about the format of a request. It ends at a newline. The loop removes that newline before it passes the request to `reply`. Keeping this rule outside `reply` means we can test what the server says independently of how the request gets there.

The program writes the PID, its process identifier, to standard error. It writes replies to standard output. Both streams normally appear in the same terminal, but a client that reads standard output should receive just one reply per request. `flush=True` makes each reply available to that client as soon as we print it, even when the output goes through a pipe.

## Be the first client

From the directory containing the file, run this command.

```bash
python3 server.py
```

The first line will say something like `server pid=4172`. Keep your own number for the next step. Type `PING` and press Return, try `HELLO`, then send `PING` again. Your terminal echoes what you type, so you’ll see both sides of the exchange.

```text
PING
PONG
HELLO
ERR unknown request
PING
PONG
```

Leave this terminal open after the second `PONG`. The same running program has answered three requests. What is it doing between replies?

## Find the process while it waits

Open a second terminal. Replace `4172` in this command with the PID your server printed.

```bash
ps -p 4172 -o pid,ppid,stat,command
```

Look for your PID and `server.py` in the same row. `PPID` identifies the parent process, usually the shell that launched Python. The state in `STAT` will typically include `S` for sleeping. The interpreter reached the next read on standard input. Until input arrives, the kernel can leave that thread asleep and schedule other work. Go back to the first terminal and send another `PING`. The waiting thread can now run and produce another `PONG`.

There are two different lifetimes here. The code in `server.py` stays on disk. Running `python3 server.py` starts a **process** in which the interpreter executes those instructions. Start a second copy while the first is waiting and the two copies will have different PIDs. Each has its own memory and its own place in the loop.

The split also explains where the operating system fits. The CPU runs the interpreter’s instructions in user mode as Python compares the request with `"PING"`. When it needs more input, the interpreter can ask the kernel to read through a **file descriptor**, a small number that identifies an open resource in that process. For a program launched in this terminal, descriptor 0 reads from the terminal. In the next lesson the same descriptor will read from a pipe.

## Finish the session

In the terminal running the server, press Ctrl+D on an empty line. This lets the read return end-of-file. The loop ends, Python exits, and the shell prompt comes back. If you started a second copy, finish it the same way.

Repeat the `ps` command for the first PID. Its row should be gone. The operating system has reclaimed the process’s memory and closed its descriptors, and the file on disk is ready to run again.

Keep `server.py`. In the next lesson, a second Python program will send `PING` through a pipe and read `PONG` back. What changes is who supplies the next line. The request handler you just wrote can stay exactly as it is.

## Sources

- Python documentation on [standard input, output and error](https://docs.python.org/3/library/sys.html#sys.stdin)
- Linux manual on [reading from a file descriptor](https://man7.org/linux/man-pages/man2/read.2.html)
- *Operating Systems: Three Easy Pieces*, [The Abstraction: The Process](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf)
