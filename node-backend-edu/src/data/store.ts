import { type Ticket, type NotaCifrada } from '../models/ticket.model.js';
import { type Persona } from '../models/persona.model.js';

/** Base de datos en memoria. Se reinicia cada vez que levantas el servidor. */

const ahora = () => new Date().toISOString();

export const tickets: Ticket[] = [
    {
        id: 1, codigo: 'TK-0001',
        asunto: 'La impresora del segundo piso no responde',
        descripcion: 'Enciende pero no aparece en la lista de dispositivos.',
        prioridad: 'media', estado: 'abierto',
        solicitante: 'Camila Rojas', solucion: null,
        creadoEn: '2026-07-20T13:05:00.000Z', actualizadoEn: '2026-07-20T13:05:00.000Z'
    },
    {
        id: 2, codigo: 'TK-0002',
        asunto: 'Correo institucional rechaza adjuntos',
        descripcion: 'Archivos sobre 5 MB devuelven error de cuota.',
        prioridad: 'alta', estado: 'en_proceso',
        solicitante: 'Diego Pino', solucion: null,
        creadoEn: '2026-07-21T09:30:00.000Z', actualizadoEn: '2026-07-22T11:00:00.000Z'
    },
    {
        id: 3, codigo: 'TK-0003',
        asunto: 'Solicitud de acceso a carpeta compartida',
        descripcion: 'Necesita permisos de lectura en la unidad de Contabilidad.',
        prioridad: 'baja', estado: 'cerrado',
        solicitante: 'Andrea Bouffanais', solucion: 'Permisos otorgados por el área de sistemas.',
        creadoEn: '2026-07-18T16:45:00.000Z', actualizadoEn: '2026-07-19T10:12:00.000Z'
    },
    {
        id: 4, codigo: 'TK-0004',
        asunto: 'Notebook no carga al conectarlo',
        descripcion: 'El cargador enciende pero la batería no sube del 3%.',
        prioridad: 'alta', estado: 'abierto',
        solicitante: 'Marcelo Vera', solucion: null,
        creadoEn: '2026-07-23T08:15:00.000Z', actualizadoEn: '2026-07-23T08:15:00.000Z'
    },
    {
        id: 5, codigo: 'TK-0005',
        asunto: 'Sala de reuniones sin señal de proyector',
        descripcion: 'El cable HDMI parece dañado en el conector.',
        prioridad: 'media', estado: 'abierto',
        solicitante: 'Paula Núñez', solucion: null,
        creadoEn: '2026-07-24T14:20:00.000Z', actualizadoEn: '2026-07-24T14:20:00.000Z'
    },
    {
        id: 6, codigo: 'TK-0006',
        asunto: 'Teclado con teclas repetidas',
        descripcion: 'Al escribir, algunas letras se duplican.',
        prioridad: 'baja', estado: 'en_proceso',
        solicitante: 'Ignacio Soto', solucion: null,
        creadoEn: '2026-07-24T17:40:00.000Z', actualizadoEn: '2026-07-25T09:05:00.000Z'
    },
    {
        id: 7, codigo: 'TK-0007',
        asunto: 'Sistema de asistencia marca doble entrada',
        descripcion: 'Registra dos veces la misma marcación de la mañana.',
        prioridad: 'alta', estado: 'abierto',
        solicitante: 'Valentina Cid', solucion: null,
        creadoEn: '2026-07-25T11:55:00.000Z', actualizadoEn: '2026-07-25T11:55:00.000Z'
    },
    {
        id: 8, codigo: 'TK-0008',
        asunto: 'Actualizar antivirus en equipos de recepción',
        descripcion: 'Las licencias vencen a fin de mes.',
        prioridad: 'media', estado: 'cerrado',
        solicitante: 'Rodrigo Lara', solucion: 'Licencias renovadas y equipos actualizados.',
        creadoEn: '2026-07-15T10:00:00.000Z', actualizadoEn: '2026-07-17T15:30:00.000Z'
    },
    {
        id: 9, codigo: 'TK-0009',
        asunto: 'Wi-Fi intermitente en bodega',
        descripcion: 'La señal se cae cada 10 minutos aproximadamente.',
        prioridad: 'media', estado: 'abierto',
        solicitante: 'Fernanda Aguilar', solucion: null,
        creadoEn: '2026-07-26T09:10:00.000Z', actualizadoEn: '2026-07-26T09:10:00.000Z'
    },
    {
        id: 10, codigo: 'TK-0010',
        asunto: 'Restablecer contraseña de usuario nuevo',
        descripcion: 'Ingreso de personal, requiere credenciales iniciales.',
        prioridad: 'baja', estado: 'abierto',
        solicitante: 'Tomás Herrera', solucion: null,
        creadoEn: '2026-07-26T15:25:00.000Z', actualizadoEn: '2026-07-26T15:25:00.000Z'
    },
    {
        id: 11, codigo: 'TK-0011',
        asunto: 'Monitor con líneas verticales',
        descripcion: 'Aparecen franjas de color en el tercio derecho.',
        prioridad: 'baja', estado: 'abierto',
        solicitante: 'Josefa Miranda', solucion: null,
        creadoEn: '2026-07-27T08:50:00.000Z', actualizadoEn: '2026-07-27T08:50:00.000Z'
    },
    {
        id: 12, codigo: 'TK-0012',
        asunto: 'Respaldo automático detenido hace 4 días',
        descripcion: 'El trabajo programado no se ejecuta desde el lunes.',
        prioridad: 'alta', estado: 'en_proceso',
        solicitante: 'Cristian Fuentes', solucion: null,
        creadoEn: '2026-07-27T12:35:00.000Z', actualizadoEn: '2026-07-27T13:00:00.000Z'
    }
];

export const notas: NotaCifrada[] = [];

/* ------------------------------------------------------------------ */
/* Registro de personal.                                               */
/*                                                                     */
/* Todos los RUT de esta lista son VÁLIDOS según el algoritmo módulo   */
/* 11. No están inventados: se calcularon con su dígito verificador    */
/* real. Si cambias un dígito a mano, el servidor va a rechazar esa     */
/* persona al intentar actualizarla — y estará en lo correcto.         */
/* ------------------------------------------------------------------ */
export const personas: Persona[] = [
    {
        id: 1, rut: '15782394-9',
        nombre: 'Camila', apellido: 'Rojas Fuentes',
        email: 'camila.rojas@empresa.cl', telefono: '+56912345678',
        cargo: 'Analista de Soporte', departamento: 'informatica', activo: true,
        creadoEn: '2026-03-04T13:20:00.000Z', actualizadoEn: '2026-03-04T13:20:00.000Z'
    },
    {
        id: 2, rut: '11445236-K',
        nombre: 'Diego', apellido: 'Pino Salazar',
        email: 'diego.pino@empresa.cl', telefono: '+56987654321',
        cargo: 'Jefe de Operaciones', departamento: 'operaciones', activo: true,
        creadoEn: '2025-11-18T09:05:00.000Z', actualizadoEn: '2026-05-22T11:40:00.000Z'
    },
    {
        id: 3, rut: '19023874-1',
        nombre: 'Andrea', apellido: 'Bouffanais Leiva',
        email: 'andrea.bouffanais@empresa.cl', telefono: null,
        cargo: 'Contadora', departamento: 'administracion', activo: true,
        creadoEn: '2026-01-09T16:45:00.000Z', actualizadoEn: '2026-01-09T16:45:00.000Z'
    },
    {
        id: 4, rut: '8765432-K',
        nombre: 'Marcelo', apellido: 'Vera Cortés',
        email: 'marcelo.vera@empresa.cl', telefono: '+56955512340',
        cargo: 'Gerente Comercial', departamento: 'ventas', activo: true,
        creadoEn: '2024-07-01T08:15:00.000Z', actualizadoEn: '2026-06-30T10:00:00.000Z'
    },
    {
        id: 5, rut: '20114558-9',
        nombre: 'Paula', apellido: 'Núñez Bravo',
        email: 'paula.nunez@empresa.cl', telefono: '+56944498765',
        cargo: 'Ejecutiva de Ventas', departamento: 'ventas', activo: true,
        creadoEn: '2026-02-14T14:20:00.000Z', actualizadoEn: '2026-02-14T14:20:00.000Z'
    },
    {
        id: 6, rut: '13998271-1',
        nombre: 'Ignacio', apellido: 'Soto Miranda',
        email: 'ignacio.soto@empresa.cl', telefono: '+56933321456',
        cargo: 'Encargado de Bodega', departamento: 'operaciones', activo: false,
        creadoEn: '2025-05-20T17:40:00.000Z', actualizadoEn: '2026-04-11T09:05:00.000Z'
    },
    {
        id: 7, rut: '17332019-1',
        nombre: 'Valentina', apellido: 'Cid Morales',
        email: 'valentina.cid@empresa.cl', telefono: '+56922234567',
        cargo: 'Analista de Personas', departamento: 'recursos_humanos', activo: true,
        creadoEn: '2025-09-30T11:55:00.000Z', actualizadoEn: '2026-07-02T15:10:00.000Z'
    },
    {
        id: 8, rut: '9884736-7',
        nombre: 'Rodrigo', apellido: 'Lara Espinoza',
        email: 'rodrigo.lara@empresa.cl', telefono: null,
        cargo: 'Administrador de Sistemas', departamento: 'informatica', activo: true,
        creadoEn: '2024-10-15T10:00:00.000Z', actualizadoEn: '2026-03-17T15:30:00.000Z'
    },
    {
        id: 9, rut: '21005463-4',
        nombre: 'Fernanda', apellido: 'Aguilar Ríos',
        email: 'fernanda.aguilar@empresa.cl', telefono: '+56911122334',
        cargo: 'Practicante de Informática', departamento: 'informatica', activo: false,
        creadoEn: '2026-06-01T09:10:00.000Z', actualizadoEn: '2026-07-15T09:10:00.000Z'
    },
    {
        id: 10, rut: '16447290-6',
        nombre: 'Tomás', apellido: 'Herrera Godoy',
        email: 'tomas.herrera@empresa.cl', telefono: '+56966677889',
        cargo: 'Asistente Administrativo', departamento: 'administracion', activo: true,
        creadoEn: '2026-04-26T15:25:00.000Z', actualizadoEn: '2026-04-26T15:25:00.000Z'
    },
    {
        id: 11, rut: '12345678-5',
        nombre: 'Josefa', apellido: 'Miranda Pavez',
        email: 'josefa.miranda@empresa.cl', telefono: '+56977788990',
        cargo: 'Diseñadora', departamento: 'ventas', activo: true,
        creadoEn: '2025-12-03T08:50:00.000Z', actualizadoEn: '2026-05-05T08:50:00.000Z'
    },
    {
        id: 12, rut: '7654321-6',
        nombre: 'Cristian', apellido: 'Fuentes Alarcón',
        email: 'cristian.fuentes@empresa.cl', telefono: '+56900011223',
        cargo: 'Jefe de Recursos Humanos', departamento: 'recursos_humanos', activo: true,
        creadoEn: '2023-08-21T12:35:00.000Z', actualizadoEn: '2026-07-20T13:00:00.000Z'
    }
];

/** Contadores para los identificadores. */
let siguienteTicket = tickets.length + 1;
let siguienteNota = 1;
let siguientePersona = personas.length + 1;

export const nuevoIdTicket = () => siguienteTicket++;
export const nuevoIdNota = () => siguienteNota++;
export const nuevoIdPersona = () => siguientePersona++;

export const generarCodigo = (id: number) => `TK-${String(id).padStart(4, '0')}`;

export const marcaDeTiempo = ahora;
