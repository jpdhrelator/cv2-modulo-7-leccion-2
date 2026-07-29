export type Prioridad = 'baja' | 'media' | 'alta';
export type EstadoTicket = 'abierto' | 'en_proceso' | 'cerrado';

export interface Ticket {
    id: number;
    codigo: string;
    asunto: string;
    descripcion: string;
    prioridad: Prioridad;
    estado: EstadoTicket;
    solicitante: string;
    solucion: string | null;
    creadoEn: string;
    actualizadoEn: string;
}

/**
 * Nota cifrada en el CLIENTE.
 *
 * El servidor guarda `paquete` tal cual llega y jamás puede leer su contenido:
 * no conoce la frase de paso. Esto se llama almacenamiento de conocimiento cero.
 */
export interface PaqueteCifrado {
    salt: string;
    iv: string;
    dato: string;
}

export interface NotaCifrada {
    id: number;
    titulo: string;
    paquete: PaqueteCifrado;
    autor: string;
    creadoEn: string;
}

export const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta'];
export const ESTADOS: EstadoTicket[] = ['abierto', 'en_proceso', 'cerrado'];
