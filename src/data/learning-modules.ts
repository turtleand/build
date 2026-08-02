import type { Locale } from '../utils/i18n';

type LocalizedText = Record<Locale, string>;

type LearningModuleLesson = {
  title: LocalizedText;
  description: LocalizedText;
  phase: number;
  slug?: Partial<Record<Locale, string>>;
};

type LearningModulePhase = {
  title: LocalizedText;
};

export type LearningModule = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  frame: Record<Locale, string[]>;
  phases: LearningModulePhase[];
  lessons: LearningModuleLesson[];
};

const learningModules: Record<string, LearningModule> = {
  'programs-to-http': {
    id: 'programs-to-http',
    title: {
      en: 'From program to HTTP',
      es: 'Del programa a HTTP',
    },
    description: {
      en: 'Build one continuous model of how a server starts, connects, exchanges bytes, and returns an HTTP response.',
      es: 'Construye un modelo continuo de cómo un servidor arranca, se conecta, intercambia bytes y devuelve una respuesta HTTP.',
    },
    frame: {
      en: ['Program', 'Process', 'Kernel'],
      es: ['Programa', 'Proceso', 'Kernel'],
    },
    phases: [
      {
        title: {
          en: 'Execution foundations',
          es: 'Fundamentos de ejecución',
        },
      },
      {
        title: {
          en: 'Connections',
          es: 'Conexiones',
        },
      },
      {
        title: {
          en: 'Data flow',
          es: 'Flujo de datos',
        },
      },
      {
        title: {
          en: 'Application protocol',
          es: 'Protocolo de aplicación',
        },
      },
    ],
    lessons: [
      {
        title: { en: 'Programs, processes, and the OS', es: 'Programas, procesos y el sistema operativo' },
        description: {
          en: 'How static instructions become a running server, and why the OS sits between programs and hardware.',
          es: 'Cómo las instrucciones estáticas se convierten en un servidor en ejecución y por qué el sistema operativo media entre los programas y el hardware.',
        },
        phase: 1,
        slug: {
          en: '2026-08-02-programs-processes-operating-system-execution',
          es: '2026-08-02-programas-procesos-ejecucion-sistema-operativo',
        },
      },
      {
        title: { en: 'Inter-process communication', es: 'Comunicación entre procesos' },
        description: {
          en: 'Why isolated processes need controlled ways to exchange information.',
          es: 'Por qué los procesos aislados necesitan formas controladas de intercambiar información.',
        },
        phase: 1,
      },
      {
        title: { en: 'Unix sockets and network sockets', es: 'Sockets Unix y sockets de red' },
        description: {
          en: 'The common socket abstraction, used locally or across networks.',
          es: 'La abstracción común de socket, utilizada localmente o a través de redes.',
        },
        phase: 2,
      },
      {
        title: { en: 'IP addresses and ports', es: 'Direcciones IP y puertos' },
        description: {
          en: 'How traffic identifies both a machine and a particular service.',
          es: 'Cómo el tráfico identifica tanto una máquina como un servicio concreto.',
        },
        phase: 2,
      },
      {
        title: { en: 'TCP connections and client-server roles', es: 'Conexiones TCP y roles de cliente-servidor' },
        description: {
          en: 'What a connection represents and how client and server responsibilities differ.',
          es: 'Qué representa una conexión y cómo se diferencian las responsabilidades del cliente y del servidor.',
        },
        phase: 2,
      },
      {
        title: { en: 'Listening and accepting', es: 'Escuchar y aceptar' },
        description: {
          en: 'How a server advertises availability and receives individual connections.',
          es: 'Cómo un servidor anuncia su disponibilidad y recibe conexiones individuales.',
        },
        phase: 2,
      },
      {
        title: { en: 'Reading and writing bytes', es: 'Leer y escribir bytes' },
        description: {
          en: 'How applications exchange byte streams through sockets and OS-managed buffers.',
          es: 'Cómo las aplicaciones intercambian flujos de bytes mediante sockets y búferes gestionados por el sistema operativo.',
        },
        phase: 3,
      },
      {
        title: { en: 'Blocking I/O', es: 'E/S bloqueante' },
        description: {
          en: 'Why a process may wait while reading, writing, or accepting connections.',
          es: 'Por qué un proceso puede esperar mientras lee, escribe o acepta conexiones.',
        },
        phase: 3,
      },
      {
        title: { en: 'Concurrency and event loops', es: 'Concurrencia y bucles de eventos' },
        description: {
          en: 'How servers make progress on multiple connections without confusing their state.',
          es: 'Cómo los servidores avanzan en varias conexiones sin confundir su estado.',
        },
        phase: 3,
      },
      {
        title: { en: 'HTTP requests and responses', es: 'Solicitudes y respuestas HTTP' },
        description: {
          en: 'How structured HTTP messages are encoded into ordinary bytes.',
          es: 'Cómo los mensajes HTTP estructurados se codifican en bytes ordinarios.',
        },
        phase: 4,
      },
      {
        title: { en: 'Keep-alive and frameworks', es: 'Keep-alive y frameworks' },
        description: {
          en: 'How connections can carry multiple exchanges and how frameworks hide lower layers.',
          es: 'Cómo las conexiones pueden transportar varios intercambios y cómo los frameworks ocultan las capas inferiores.',
        },
        phase: 4,
      },
      {
        title: { en: 'The complete request lifecycle', es: 'El ciclo de vida completo de una solicitud' },
        description: {
          en: 'Following one request from the client, through both operating systems and application code, then back.',
          es: 'Seguir una solicitud desde el cliente, a través de ambos sistemas operativos y el código de aplicación, y de vuelta.',
        },
        phase: 4,
      },
    ],
  },
};

export const getLearningModule = (id: string) => learningModules[id];
