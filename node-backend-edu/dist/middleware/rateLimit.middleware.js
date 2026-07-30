export const rateLimit = (maxPeticiones, ventanaSegundos) => {
    const memoria = new Map();
    return (req, res, next) => {
        const llave = req.ip || 'desconocido';
        const ahora = Date.now();
        const registro = memoria.get(llave);
        if (!registro || ahora > registro.reinicioEn) {
            memoria.set(llave, { conteo: 1, reinicioEn: ahora + ventanaSegundos * 1000 });
            return next();
        }
        registro.conteo++;
        if (registro.conteo > maxPeticiones) {
            const esperar = Math.ceil((registro.reinicioEn - ahora) / 1000);
            res.setHeader('Retry-After', String(esperar));
            return res.status(429).json({
                message: `Demasiadas peticiones. Espera ${esperar} segundos antes de volver a intentar.`,
                reintentarEn: esperar
            });
        }
        next();
    };
};
