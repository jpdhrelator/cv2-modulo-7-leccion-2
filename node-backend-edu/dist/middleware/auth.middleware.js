import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config.js';
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }
        jwt.verify(token, getJwtSecret(), (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token inválido o expirado' });
            }
            req.user = user;
            next();
        });
    }
    else {
        res.status(401).json({ message: 'Token de autenticación faltante (Header Authorization: Bearer <token>)' });
    }
};
