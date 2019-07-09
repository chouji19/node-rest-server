const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarios')
const app = express()

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }


        let token = jwt.sign({
                usuario: usuarioDB
            },
            process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
        );

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        })

    });
})


//configuracion de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log('email :', payload.email);
    console.log('picture :', payload.picture);
    console.log('profile :', payload.profile);
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        img: payload.picture,
        email: payload.email,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    console.log('token: ' + JSON.stringify(token));
    let googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            err
        });
    })
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar la otra autenticación'
                    }
                });
            } else {
                let token = jwt.sign({
                        usuario: usuarioDB
                    },
                    process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
                );
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            //el usuario no existe en nuestra DB -- creamos un nuevo usuario
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.google = true;
            usuario.password = ":)";
            usuario.img = googleUser.img;

            usuario.save((err, usuarioDB) => {
                let token = jwt.sign({
                        usuario: usuarioDB
                    },
                    process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }
                );
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            });
        }
    })
})









module.exports = app;