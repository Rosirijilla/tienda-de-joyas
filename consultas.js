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
const obtenerJoyasFiltro = async ({precio_max, precio_min, categoria, metal, order_by})=>{
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

    //Agregar el orden
    if (order_by) {
        const [campo, orden] = order_by.split('_');
        const validarCampos = ['precio', 'nombre', 'stock', 'categoria', 'metal'];
        const validarOrden = ['ASC', 'DESC'];

        if (validarCampos.includes(campo) && validarOrden.includes(orden)){
            consulta += ` ORDER BY ${campo} ${orden}`;
        }
    }

    const {rows} = await pool.query(consulta, values);
    return rows;
};

module.exports = { obtenerJoyasFiltro }; //Exportar