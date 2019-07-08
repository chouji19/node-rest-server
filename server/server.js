const express = require('express')

const app = express()
require('./config/config')

const bodyParser = require('body-parser')
const mongoose = require('mongoose');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Configuracion Local de rutas
app.use(require('./routes/index'))


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');

});

app.listen(process.env.PORT, () => console.log('Escuchando Puerto 3000'));