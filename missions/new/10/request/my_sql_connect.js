const mysql = require("mysql2");
const pool = mysql.createPool({
    connectionLimit: 200,    
    host: "localhost",
    user: "sui_user",
    database: "sui_bot",
    password: "Tarab@739739739"
})

pool.getConnection((error) => {
    if(error){
        return console.log("Ошибка подключения");
    }else{
        return console.log("Подключение установлено!");
    }
})

module.exports = pool
