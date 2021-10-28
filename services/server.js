const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const cripto = require("./seguranca");
var jwt = require('jsonwebtoken');
const fs   = require('fs');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * 
    FROM usuario LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

async function insert(parametros){
    const senha = await cripto.criptografar(parametros.senha);
    console.log("SENHA CRYPTO: " + senha);
    const result = await db.query(
        `INSERT INTO usuario 
        (nome, email, senha) 
        VALUES 
        (?, ?, ?)`, 
        [
          parametros.nome,
          parametros.email,
          senha
        ]
      );
  
      let message = 'Erro na inclusão via POST';
  
      if (result.affectedRows) {
         message = 'Informações inseridas com sucesso!';
      }

      return message;
    
}

async function login(parametros){
  const senha = await cripto.criptografar(parametros.senha);
  const rows = await db.query(
    `SELECT id, nome, email, avatar FROM usuario 
    WHERE email = ? AND senha = ?`, 
    [
      parametros.email,
      senha
    ]
  );
  const data = helper.emptyOrRows(rows);

  if (isEmpty(data) == false){
     const id = data[0].id;  
     const user = data[0].nome;
  
     var privateKey  = fs.readFileSync('./private.key', 'utf8');
     var token = jwt.sign({ id, user }, privateKey, { 
         expiresIn: 300, // 5min 
         algorithm:  "RS256" //SHA-256 hash signature
     }); 
    
     console.log("Fez login e gerou token! para - " + id + " " + user);
    
     return { data, token }
  }else{
      let message = 'Usuário ou Senha Incorretos!';
      return message;
  }
  
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
}

module.exports = {
    getMultiple,
    insert,
    login
  }
  
