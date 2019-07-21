const jwt = require('jsonwebtoken')

// =============
// Verificar Token
//============
let verificaToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });

};

// =============
// Verificar Admin_ROLE
//============
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    console.log('usuario token: ' + JSON.stringify(usuario));

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'ROLE de usuario no valido'
            }
        });
    }
};

// =============
// Verificar token para imagen
//============
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

module.exports = { verificaToken, verificaAdminRole, verificaTokenImg }