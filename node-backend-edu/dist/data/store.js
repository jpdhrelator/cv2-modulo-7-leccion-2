/** Base de datos en memoria. Se reinicia cada vez que levantas el servidor. */
const ahora = () => new Date().toISOString();
export const tickets = [
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
export const notas = [];
/** Contadores para los identificadores. */
let siguienteTicket = tickets.length + 1;
let siguienteNota = 1;
export const nuevoIdTicket = () => siguienteTicket++;
export const nuevoIdNota = () => siguienteNota++;
export const generarCodigo = (id) => `TK-${String(id).padStart(4, '0')}`;
export const marcaDeTiempo = ahora;
