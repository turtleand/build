import type { Locale } from '../utils/i18n';

type LocalizedText = Record<Locale, string>;

export type LearningModule = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  lessons: { title: LocalizedText; description: LocalizedText }[];
};

const learningModules: LearningModule[] = [
  {
    id: 'programs-to-http',
    title: {
      en: 'Build a web server from scratch',
      es: 'Construye un servidor web desde cero',
    },
    description: {
      en: 'Start with a Python process that answers PING. Extend it until two clients can request pages from it over HTTP.',
      es: 'Empieza con un proceso de Python que responde a PING. Amplíalo hasta que dos clientes puedan pedirle páginas por HTTP.',
    },
    lessons: [
      {
        title: { en: 'Start the server process', es: 'Arranca el proceso del servidor' },
        description: {
          en: 'Run server.py, find its process ID and send it a PING from the terminal.',
          es: 'Ejecuta server.py, identifica su proceso y envíale un PING desde la terminal.',
        },
      },
      {
        title: { en: 'Connect a client with pipes', es: 'Conecta un cliente mediante tuberías' },
        description: {
          en: 'Write a client that launches the same server, writes PING to its standard input and reads PONG back.',
          es: 'Escribe un cliente que arranque el mismo servidor, envíe PING por su entrada estándar y lea PONG como respuesta.',
        },
      },
      {
        title: { en: 'Exchange bytes over a socket pair', es: 'Intercambia bytes entre dos sockets' },
        description: {
          en: 'Give each side a connected socket and carry the same exchange over that pair.',
          es: 'Asigna a cada extremo un socket conectado y repite el intercambio a través de ese par.',
        },
      },
      {
        title: { en: 'Give the server an address', es: 'Asigna una dirección al servidor' },
        description: {
          en: 'Bind a TCP socket to the loopback interface and print the port the OS assigned.',
          es: 'Vincula un socket TCP a la interfaz local de loopback y muestra el puerto que le asignó el sistema.',
        },
      },
      {
        title: { en: 'Answer a client over TCP', es: 'Responde a un cliente por TCP' },
        description: {
          en: 'Listen on that port, connect from a second terminal and send PONG through the accepted socket.',
          es: 'Escucha en ese puerto, conéctate desde otra terminal y envía PONG por el socket de la conexión aceptada.',
        },
      },
      {
        title: { en: 'Keep listening between clients', es: 'Sigue escuchando entre conexiones' },
        description: {
          en: 'Close the first connection and accept a second one on the original listening socket.',
          es: 'Cierra la primera conexión y acepta una segunda con el mismo socket de escucha.',
        },
      },
      {
        title: { en: 'Read whole messages from a byte stream', es: 'Lee mensajes completos de un flujo de bytes' },
        description: {
          en: 'Keep a buffer until a newline arrives. Try splitting PING across two writes and sending two lines together.',
          es: 'Acumula bytes hasta recibir un salto de línea. Divide PING en dos escrituras y prueba a enviar dos líneas juntas.',
        },
      },
      {
        title: { en: 'Set a deadline for an idle client', es: 'Limita la espera de un cliente inactivo' },
        description: {
          en: 'Leave a client connected mid-line, observe the blocked read and set a timeout so the server can accept another client.',
          es: 'Deja una línea a medias, observa cómo se bloquea la lectura y fija un tiempo de espera para que el servidor pueda atender a otro cliente.',
        },
      },
      {
        title: { en: 'Serve two clients at once', es: 'Atiende a dos clientes a la vez' },
        description: {
          en: 'Use a selector and a buffer per connection so one client gets PONG while the other is still typing.',
          es: 'Usa un selector y un búfer por conexión para que un cliente reciba PONG mientras el otro sigue escribiendo.',
        },
      },
      {
        title: { en: 'Return the first HTTP response', es: 'Devuelve la primera respuesta HTTP' },
        description: {
          en: 'Read a GET request and its headers, then send a status line, a content length and a short page for the browser.',
          es: 'Lee una petición GET y sus cabeceras. Envía al navegador una línea de estado, la longitud del contenido y una página breve.',
        },
      },
      {
        title: { en: 'Route a second request on the same connection', es: 'Atiende otra petición en la misma conexión' },
        description: {
          en: 'Serve the home page and a 404 for an unknown path. Request both in sequence over one TCP connection.',
          es: 'Sirve la página de inicio y devuelve un 404 para una ruta desconocida. Pide ambas rutas por la misma conexión TCP.',
        },
      },
      {
        title: { en: 'Trace and test the complete request', es: 'Sigue y verifica la petición de principio a fin' },
        description: {
          en: 'Trace a request from accept to response and write a repeatable check for the status, headers and body with two connected clients.',
          es: 'Sigue una petición desde que se acepta la conexión hasta la respuesta y comprueba el estado, las cabeceras y el cuerpo en una prueba con dos clientes conectados.',
        },
      },
    ],
  },
];

export const getLearningModule = (id: string) => learningModules.find((module) => module.id === id);
