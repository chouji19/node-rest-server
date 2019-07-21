const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuarios')
const Producto = require('../models/producto');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;
    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se a seleccionado ningun archivo'
            }
        });
    }

    //valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0)
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo no valido, solo se permito ' + tiposValidos.join(', ')
            }
        });


    let archivo = req.files.archivo;

    //Extensiones permitidas

    let extencionesValidas = ['png', 'jpg', 'gif'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extencionesValidas.indexOf(extension.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extensión no es valida'
            }
        });
    }

    //cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        if (tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo);
        else
            imagenProductos(id, res, nombreArchivo);


    });
});



function imagenProductos(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB)
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Imagen no existe'
                }
            });


        productoDB.img = nombreArchivo;
        borrarArchivo(nombreArchivo, 'productos');
        productoDB.save((err, productoGuardado) => {
            return res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    })
}

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB)
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Imagen no existe'
                }
            });


        usuarioDB.img = nombreArchivo;
        borrarArchivo(nombreArchivo, 'usuarios');
        usuarioDB.save((err, usuarioGuardado) => {
            return res.json({
                ok: true,
                Usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    })
}

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;