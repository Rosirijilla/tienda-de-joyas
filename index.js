//Importar
const express = require('express');
const fs = require('fs');
const app = express();
require('dotenv').config();
const { obtenerJoyasFiltro } = require('./consultas'); //Importar desde consultas.js


// Middlewares
app.use(express.json());
app.use(require('cors')());
app.use(require('helmet')());

//Reportes middleware
const registrarActividad = (req, res, next) =>{
    const ahora = new Date().toISOString();
    const log = ` [${ahora}] Ruta consultada: ${req.method} ${req.path}\n`;

    console.log(log);
    fs.appendFileSync('reporte.log', log); //Guardamos el log
    next();
};

app.use(registrarActividad);

//Hateoas
const cambiarHATEOAS = (joyas, limite)=>{
    return{
        total: joyas.length,
        results: joyas.slice(0, limite || joyas.length).map(j=>({
            name: j.nombre,
            href: `/joyas/${j.id}`,
        })),
    };
};

//Ruta get 
app.get('/joyas', async (req, res) =>{
    try{
        const {precio_max, precio_min, categoria, metal, limits} = req.query;

        const filtros = {
            precio_max: precio_max ? parseFloat(precio_max) : undefined,
            precio_min: precio_min ? parseFloat(precio_min) : undefined,
            categoria,
            metal,
        };


        const joyas = await obtenerJoyasFiltro(filtros); //Obtenemos joyas con filtros

        const limite = limits && !isNaN(limits) ? parseInt(limits) : undefined; //Formatear datos con hateoas
        const HATEOAS = cambiarHATEOAS(joyas, limite); //Formatear datos con hateoas

        res.json(HATEOAS);//Enviar hateoas en un json
    }catch(error){
        res.status(500).json({ error: "Error al obtener las joyas", details: error.message }); //Manejo errores
    }
});


// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto ${PORT} - http://localhost:${PORT}`);
});
