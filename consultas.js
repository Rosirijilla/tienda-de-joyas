//Importar
const { Pool } = require('pg');

//Configurar pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

//Func. conseguir las joyas pero con los filtros
const obtenerJoyasFiltro = async ({precio_max, precio_min, categoria, metal})=>{
    let filtros = [];
    const values = [];
    const agregarFiltro = (campo, operador, valor) =>{
        values.push(valor);
        filtros.push(`${campo} ${operador} $${values.length}`);
    };
    
    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0){
        consulta += ` WHERE ${filtros.join(' AND ')}`;
    }

    const {rows} = await pool.query(consulta, values);
    return rows;
};

module.exports = { obtenerJoyasFiltro }; //Exportar