import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { notas, nuevoIdNota, marcaDeTiempo } from '../data/store.js';
const router = Router();
/**
 * Notas internas de conocimiento cero.
 *
 * El servidor guarda el paquete cifrado tal cual llega y NO puede leerlo:
 * la frase de paso nunca sale del navegador del usuario. Si alguien roba
 * esta base de datos, se lleva ruido.
 *
 * Por eso el servidor SÓLO valida la FORMA del paquete, nunca su contenido.
 */
const ES_BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
function validarPaquete(cuerpo) {
    const errores = {};
    if (typeof cuerpo?.titulo !== 'string' || cuerpo.titulo.trim().length < 3) {
        errores.titulo = 'El título es obligatorio (mínimo 3 caracteres).';
    }
    const paquete = cuerpo?.paquete;
    if (!paquete || typeof paquete !== 'object') {
        errores.paquete = 'Falta el paquete cifrado. Debe ser un objeto con salt, iv y dato.';
        return errores;
    }
    ['salt', 'iv', 'dato'].forEach(campo => {
        const valor = paquete[campo];
        if (typeof valor !== 'string' || valor.length === 0) {
            errores[`paquete.${campo}`] = `El campo "${campo}" es obligatorio.`;
        }
        else if (!ES_BASE64.test(valor)) {
            errores[`paquete.${campo}`] = `El campo "${campo}" debe venir codificado en Base64.`;
        }
    });
    // Señal de que el cliente mandó texto plano por error.
    if (typeof paquete.dato === 'string' && paquete.dato.length < 12) {
        errores['paquete.dato'] = 'El dato cifrado es sospechosamente corto. ¿Estás enviando el texto sin cifrar?';
    }
    return errores;
}
/** GET /api/notas — sólo las notas del usuario autenticado. */
router.get('/', authenticateJWT, (req, res) => {
    const propias = notas.filter(n => n.autor === req.user?.username);
    res.json({ datos: propias, total: propias.length });
});
/** POST /api/notas — recibe el paquete YA cifrado por el cliente. */
router.post('/', authenticateJWT, (req, res) => {
    const errores = validarPaquete(req.body);
    if (Object.keys(errores).length > 0) {
        return res.status(422).json({
            message: 'El paquete cifrado no tiene el formato esperado.',
            errores
        });
    }
    const nueva = {
        id: nuevoIdNota(),
        titulo: String(req.body.titulo).trim(),
        paquete: {
            salt: req.body.paquete.salt,
            iv: req.body.paquete.iv,
            dato: req.body.paquete.dato
        },
        autor: req.user?.username,
        creadoEn: marcaDeTiempo()
    };
    notas.push(nueva);
    res.status(201).json(nueva);
});
/** DELETE /api/notas/:id — sólo el autor puede borrar la suya. */
router.delete('/:id', authenticateJWT, (req, res) => {
    const indice = notas.findIndex(n => n.id === Number(req.params.id));
    if (indice === -1) {
        return res.status(404).json({ message: 'La nota no existe.' });
    }
    if (notas[indice].autor !== req.user?.username) {
        return res.status(403).json({ message: 'Sólo puedes eliminar tus propias notas.' });
    }
    notas.splice(indice, 1);
    res.json({ message: 'Nota eliminada.' });
});
export default router;
