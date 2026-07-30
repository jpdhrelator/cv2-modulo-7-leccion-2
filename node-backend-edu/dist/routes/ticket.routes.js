import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roles.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';
import { tickets, nuevoIdTicket, generarCodigo, marcaDeTiempo } from '../data/store.js';
import { PRIORIDADES, ESTADOS } from '../models/ticket.model.js';
const router = Router();
/* ------------------------------------------------------------------ */
/* Validación: devuelve un mapa campo → mensaje                        */
/* ------------------------------------------------------------------ */
function validarTicket(cuerpo, parcial = false) {
    const errores = {};
    const tiene = (campo) => cuerpo?.[campo] !== undefined;
    if (!parcial || tiene('asunto')) {
        const asunto = cuerpo?.asunto;
        if (typeof asunto !== 'string' || asunto.trim().length === 0) {
            errores.asunto = 'El asunto es obligatorio.';
        }
        else if (asunto.trim().length < 8) {
            errores.asunto = 'El asunto debe tener al menos 8 caracteres.';
        }
        else if (asunto.trim().length > 90) {
            errores.asunto = 'El asunto no puede superar los 90 caracteres.';
        }
    }
    if (!parcial || tiene('descripcion')) {
        const desc = cuerpo?.descripcion;
        if (typeof desc !== 'string' || desc.trim().length < 15) {
            errores.descripcion = 'La descripción debe tener al menos 15 caracteres.';
        }
    }
    if (!parcial || tiene('prioridad')) {
        if (!PRIORIDADES.includes(cuerpo?.prioridad)) {
            errores.prioridad = `La prioridad debe ser una de: ${PRIORIDADES.join(', ')}.`;
        }
    }
    if (!parcial || tiene('solicitante')) {
        const sol = cuerpo?.solicitante;
        if (typeof sol !== 'string' || sol.trim().length < 3) {
            errores.solicitante = 'El solicitante es obligatorio (mínimo 3 caracteres).';
        }
    }
    if (tiene('estado') && !ESTADOS.includes(cuerpo.estado)) {
        errores.estado = `El estado debe ser uno de: ${ESTADOS.join(', ')}.`;
    }
    return errores;
}
/**
 * Express tipa los parámetros de ruta como `string | string[]`, porque una
 * ruta puede repetir el mismo nombre. Normalizamos en un solo lugar en vez
 * de forzar el tipo en cada handler.
 */
const idDesde = (valor) => Number(String(valor));
const buscarTicket = (valor) => tickets.find(t => t.id === idDesde(valor));
/* ------------------------------------------------------------------ */
/* GET /api/tickets/resumen  — PÚBLICO, con límite de peticiones       */
/*                                                                     */
/* OJO AL ORDEN: esta ruta va ANTES que /:id. Si la pusieras después,  */
/* Express interpretaría "resumen" como un id y nunca llegarías acá.   */
/* ------------------------------------------------------------------ */
router.get('/resumen', rateLimit(5, 30), (req, res) => {
    const porEstado = ESTADOS.reduce((acc, estado) => {
        acc[estado] = tickets.filter(t => t.estado === estado).length;
        return acc;
    }, {});
    const porPrioridad = PRIORIDADES.reduce((acc, prioridad) => {
        acc[prioridad] = tickets.filter(t => t.prioridad === prioridad).length;
        return acc;
    }, {});
    const abiertos = tickets.filter(t => t.estado !== 'cerrado');
    res.json({
        total: tickets.length,
        porEstado,
        porPrioridad,
        pendientesCriticos: tickets.filter(t => t.estado !== 'cerrado' && t.prioridad === 'alta').length,
        masAntiguoAbierto: abiertos.length
            ? abiertos.reduce((a, b) => (a.creadoEn < b.creadoEn ? a : b)).codigo
            : null,
        generadoEn: marcaDeTiempo()
    });
});
/* ------------------------------------------------------------------ */
/* GET /api/tickets — PÚBLICO. Filtros, búsqueda, orden y paginación.  */
/*                                                                     */
/* La respuesta NO es un arreglo pelado: es un objeto con `datos` y    */
/* `meta`. Eso obliga al cliente a leer la forma real de la respuesta  */
/* antes de asumir nada.                                               */
/* ------------------------------------------------------------------ */
router.get('/', (req, res) => {
    const { estado, prioridad, buscar, orden = 'recientes', pagina = '1', porPagina = '5' } = req.query;
    let resultado = [...tickets];
    if (estado) {
        if (!ESTADOS.includes(estado)) {
            return res.status(400).json({
                message: `Filtro de estado inválido. Valores aceptados: ${ESTADOS.join(', ')}.`
            });
        }
        resultado = resultado.filter(t => t.estado === estado);
    }
    if (prioridad) {
        if (!PRIORIDADES.includes(prioridad)) {
            return res.status(400).json({
                message: `Filtro de prioridad inválido. Valores aceptados: ${PRIORIDADES.join(', ')}.`
            });
        }
        resultado = resultado.filter(t => t.prioridad === prioridad);
    }
    if (buscar) {
        const q = buscar.toLowerCase();
        resultado = resultado.filter(t => t.asunto.toLowerCase().includes(q) ||
            t.descripcion.toLowerCase().includes(q) ||
            t.solicitante.toLowerCase().includes(q) ||
            t.codigo.toLowerCase().includes(q));
    }
    const pesoPrioridad = { alta: 3, media: 2, baja: 1 };
    if (orden === 'antiguos') {
        resultado.sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
    }
    else if (orden === 'prioridad') {
        resultado.sort((a, b) => pesoPrioridad[b.prioridad] - pesoPrioridad[a.prioridad]);
    }
    else {
        resultado.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
    }
    const total = resultado.length;
    const tam = Math.min(Math.max(parseInt(porPagina, 10) || 5, 1), 50);
    const totalPaginas = Math.max(Math.ceil(total / tam), 1);
    const pag = Math.min(Math.max(parseInt(pagina, 10) || 1, 1), totalPaginas);
    const desde = (pag - 1) * tam;
    // Cabecera personalizada: sólo es legible desde JavaScript porque
    // server.ts la expone en la configuración de CORS.
    res.setHeader('X-Total-Registros', String(total));
    res.json({
        datos: resultado.slice(desde, desde + tam),
        meta: {
            pagina: pag,
            porPagina: tam,
            total,
            totalPaginas,
            hayAnterior: pag > 1,
            haySiguiente: pag < totalPaginas
        }
    });
});
/* ------------------------------------------------------------------ */
/* GET /api/tickets/:id — PÚBLICO                                      */
/* ------------------------------------------------------------------ */
router.get('/:id', (req, res) => {
    const ticket = buscarTicket(req.params.id);
    if (!ticket) {
        return res.status(404).json({ message: `No existe el ticket con id ${req.params.id}.` });
    }
    res.json(ticket);
});
/* ------------------------------------------------------------------ */
/* POST /api/tickets — PROTEGIDO. Devuelve 422 con errores por campo.  */
/* ------------------------------------------------------------------ */
router.post('/', authenticateJWT, (req, res) => {
    const errores = validarTicket(req.body);
    if (Object.keys(errores).length > 0) {
        return res.status(422).json({
            message: 'Algunos campos tienen problemas. Revísalos.',
            errores
        });
    }
    const id = nuevoIdTicket();
    const ahora = marcaDeTiempo();
    const nuevo = {
        id,
        codigo: generarCodigo(id),
        asunto: String(req.body.asunto).trim(),
        descripcion: String(req.body.descripcion).trim(),
        prioridad: req.body.prioridad,
        estado: 'abierto',
        solicitante: String(req.body.solicitante).trim(),
        solucion: null,
        creadoEn: ahora,
        actualizadoEn: ahora
    };
    tickets.push(nuevo);
    res.status(201).json(nuevo);
});
/* ------------------------------------------------------------------ */
/* PATCH /api/tickets/:id — PROTEGIDO. Actualización parcial.          */
/* ------------------------------------------------------------------ */
router.patch('/:id', authenticateJWT, (req, res) => {
    const ticket = buscarTicket(req.params.id);
    if (!ticket) {
        return res.status(404).json({ message: `No existe el ticket con id ${req.params.id}.` });
    }
    if (ticket.estado === 'cerrado') {
        return res.status(409).json({
            message: 'No se puede modificar un ticket cerrado. Reábrelo primero.',
            estadoActual: ticket.estado
        });
    }
    const errores = validarTicket(req.body, true);
    if (Object.keys(errores).length > 0) {
        return res.status(422).json({ message: 'Algunos campos tienen problemas. Revísalos.', errores });
    }
    const permitidos = ['asunto', 'descripcion', 'prioridad', 'estado', 'solicitante'];
    permitidos.forEach(campo => {
        if (req.body[campo] !== undefined) {
            ticket[campo] = typeof req.body[campo] === 'string'
                ? req.body[campo].trim()
                : req.body[campo];
        }
    });
    ticket.actualizadoEn = marcaDeTiempo();
    res.json(ticket);
});
/* ------------------------------------------------------------------ */
/* POST /api/tickets/:id/cerrar — PROTEGIDO. Acción, no CRUD.          */
/* ------------------------------------------------------------------ */
router.post('/:id/cerrar', authenticateJWT, (req, res) => {
    const ticket = buscarTicket(req.params.id);
    if (!ticket) {
        return res.status(404).json({ message: `No existe el ticket con id ${req.params.id}.` });
    }
    if (ticket.estado === 'cerrado') {
        return res.status(409).json({
            message: `El ticket ${ticket.codigo} ya estaba cerrado.`,
            estadoActual: ticket.estado
        });
    }
    const solucion = req.body?.solucion;
    if (typeof solucion !== 'string' || solucion.trim().length < 10) {
        return res.status(422).json({
            message: 'Para cerrar un ticket debes registrar la solución aplicada.',
            errores: { solucion: 'La solución debe tener al menos 10 caracteres.' }
        });
    }
    ticket.estado = 'cerrado';
    ticket.solucion = solucion.trim();
    ticket.actualizadoEn = marcaDeTiempo();
    res.json({ message: `Ticket ${ticket.codigo} cerrado correctamente.`, ticket });
});
/* ------------------------------------------------------------------ */
/* POST /api/tickets/:id/reabrir — PROTEGIDO                           */
/* ------------------------------------------------------------------ */
router.post('/:id/reabrir', authenticateJWT, (req, res) => {
    const ticket = buscarTicket(req.params.id);
    if (!ticket) {
        return res.status(404).json({ message: `No existe el ticket con id ${req.params.id}.` });
    }
    if (ticket.estado !== 'cerrado') {
        return res.status(409).json({
            message: `Sólo se pueden reabrir tickets cerrados. Este está "${ticket.estado}".`,
            estadoActual: ticket.estado
        });
    }
    ticket.estado = 'abierto';
    ticket.solucion = null;
    ticket.actualizadoEn = marcaDeTiempo();
    res.json({ message: `Ticket ${ticket.codigo} reabierto.`, ticket });
});
/* ------------------------------------------------------------------ */
/* DELETE /api/tickets/:id — PROTEGIDO + SÓLO ROL admin                */
/*                                                                     */
/* El usuario "operador" recibe 403 aquí. Ese 403 NO significa sesión  */
/* expirada: significa permiso insuficiente. El cliente tiene que      */
/* distinguirlos.                                                      */
/* ------------------------------------------------------------------ */
router.delete('/:id', authenticateJWT, requireRole('admin'), (req, res) => {
    const indice = tickets.findIndex(t => t.id === idDesde(req.params.id));
    if (indice === -1) {
        return res.status(404).json({ message: `No existe el ticket con id ${req.params.id}.` });
    }
    const [eliminado] = tickets.splice(indice, 1);
    res.json({ message: `Ticket ${eliminado.codigo} eliminado.`, id: eliminado.id });
});
export default router;
