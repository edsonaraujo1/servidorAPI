//index.js
const express = require('express') 
const cors = require('cors');
const app = express() 
var cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const fs   = require('fs');
const port = process.env.PORT || 3333;
const programs = require('./services/server');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser()); 

//rota protegida
app.get('/', verifyJWT, (req, res, next) => { 
    var token = req.headers['x-access-token']; 
    console.log("Retorna o Status!");
    res.status(200).json([{id:1, auth: true, status: 'Valido', token: token}]);
    
}) 

//rota protegida
app.get('/status', verifyJWT, (req, res, next) => { 
    var token = req.headers['x-access-token']; 
    console.log("Retorna o Status!");
    res.status(200).json([{id:1, auth: true, status: 'Valido', token: token}]);
    
}) 

/* GET Obtem todos os Dados da tabela Usuario - rota protegida */
app.get('/clientes', async function(req, res, next) { 
    var token = req.headers['x-access-token']; 
    try {
        res.json(await programs.getMultiple(req.query.page));
      } catch (err) {
        console.error(`Erro ao obter dados do server`, err.message);
        next(err);
      }
    console.log("Retornou todos clientes!");
    
}); 

/* INSERT Insere dados na Tabela USUARIO */
app.post('/user', async function(req, res, next) {
    var token = req.body.token;
    try {
      //if (!token)
         //return res.status(401).send({ auth: false, message: 'Token não informado ou Invalido.' }); 
      res.json(await programs.insert(req.body));
    } catch (err) {
      console.error(`Erro ao criar dados no server`, err.message);
      next(err);
    }
  });

/* LOGIN faz login e gera Token de acesso */
app.post('/login', async function(req, res, next) { 
    if(req.body.email != null && req.body.senha != null){ 
        return res.json(await programs.login(req.body));
    }
    return res.status(401).send('Login inválido!'); 
});    

/* LOGOUT Sair da Sessão de Usuário */
app.post('/logout', function(req, res) { 
    console.log("Fez logout e cancelou o token!");
    res.status(200).send({ auth: false, token: null }); 
});

//função que verifica se o Token esta OK
function verifyJWT(req, res, next){ 
    var token = req.headers['x-access-token']; 
    if (!token) 
        return res.status(401).send({ auth: false, message: 'Token não informado ou Invalido.' }); 
    
    var publicKey  = fs.readFileSync('./public.key', 'utf8');
    jwt.verify(token, publicKey, {algorithm: ["RS256"]}, function(err, decoded) { 
        if (err) 
            return res.status(500).send({ auth: false, message: 'Token inválido.' }); 
        
        req.userId = decoded.id; 
        console.log("User Id: " + decoded.id)
        console.log("User   : " + decoded.user)
        next(); 
    }); 
}    

function verifyJWT2(req, res, next){ 
    var token = req.body.token; 
    if (!token) 
        return res.status(401).send({ auth: false, message: 'Token não informado ou Invalido.' }); 
    
    var publicKey  = fs.readFileSync('./public.key', 'utf8');
    jwt.verify(token, publicKey, {algorithm: ["RS256"]}, function(err, decoded) { 
        if (err) 
            return res.status(500).send({ auth: false, message: 'Token inválido.' }); 
        
        req.userId = decoded.id; 
        console.log("User Id: " + decoded.id)
        console.log("User   : " + decoded.user)
        next(); 
    }); 
}    

app.listen(port, '0.0.0.0', () => {
    console.log(`Aplicativo sendo executado em http://localhost:${port}/server`)
  });
  