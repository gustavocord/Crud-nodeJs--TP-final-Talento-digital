var express = require('express');
var app = express();
var session = require('express-session');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');
var path = require('path');


//setting
app.set('views', path.join(__dirname, 'views'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones
app.use(session({secret: 'UnaClaveMuySecreta'}));
// Handlebars
app.engine(
    "hbs",
    hbs({
    
      partialsDir: [path.join(__dirname, 'views/partials')],
      extname: ".hbs",
      layoutsDir: path.join(__dirname, 'views/layouts'),
      defaultLayout: "main"
    })
  );
app.set('view engine', 'hbs');

// Recibir información desde formulario y JSON
app.use(express.urlencoded());
app.use(express.json());
// Base de datos
mongoose.connect('mongodb://localhost:27017/tp_novedad', {useNewUrlParser: true, useUnifiedTopology: true});

var usuarioSchema = mongoose.Schema({
    usuario: String,
    email: String,
    password: String
});
var novedadSchema = mongoose.Schema({
    novedad : String,
    firma : String,
    fecha : String
})
var Novedad = mongoose.model('Novedad', novedadSchema);

var Usuario = mongoose.model('Usuario', usuarioSchema);

app.get('/', function(req, res) {
    res.render('index');
});


//usuario
app.get('/ver_registracion', function(req, res) {
    res.render('registro');
});

app.post('/registracion', async function(req, res) {
    var errores=[];

    if( req.body.usuario == ""){
        errores.push("Falta el usuario");
    }

    if(req.body.password == ""){
        errores.push("Falta la contraseña");
    }

    if(req.body.email == ""){
        errores.push("Falta el email");
    }

    if(errores.length > 0){
        res.render('registro', {errores});
        return;
    }

    var usr = new Usuario();
    usr.usuario = req.body.usuario;
    usr.email = req.body.email;
    usr.password = req.body.password;
    await usr.save();
    res.redirect('/ver_login');
});

app.post('/api/registracion', async function(req, res) {
   
    var usr = new Usuario();
    usr.usuario = req.body.usuario;
    usr.email = req.body.email;
    usr.password = req.body.password;
    await usr.save();
    res.json(usr);
});

app.get('/ver_login', function(req, res) {
    res.render('login');
});

app.post('/login', async function(req, res) {
  
    var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
    if (usr) {
        req.session.usuario_id = usr._id;
        res.redirect('/agregar_novedad');
    } else {
        res.render('login', {mensaje_error: 'Usuario/password incorrecto', usuario: req.body.usuario});
    }
})

app.post('/api/login', async function (req, res) {
  
    var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
    if (usr) {
        req.session.usuario_id = usr._id;
        res.json(usr);
        
    } else {
        res.status(404).send();
    }
    
});



////////////Novedades

app.get('/agregar_novedad', function(req, res) {
    res.render('agregar_novedad');
});

app.get('/lista_novedades', async function(req, res) {
    var novedades=await Novedad.find();
    res.render('lista_novedades',{novedades });
});


app.post('/agregar_novedad', async function(req, res) {
    var errores =[];
  
    
    if( req.body.novedad == ""){
        errores.push("debe completar el campo de novedad");
    }

    if(req.body.firma == ""){
        errores.push("debe dejar una firma");
    }
    var datos = new Date;
    var fecha= datos.getDate()+"-" + (datos.getMonth()+1)+ "-"+ datos.getFullYear();
    var hora =  datos.getHours()+ ":" + datos.getMinutes() +":" + datos.getSeconds();

    var nov = new Novedad();
    nov.novedad = req.body.novedad;
    nov.firma = req.body.firma;
    nov.fecha= fecha + " " + hora ;
    await nov.save();
 
    var novedades=await Novedad.find();
    
    if (errores==0){
      
        res.render('lista_novedades',{novedades});

        
      
    }
    else{
        res.render('agregar_novedad', {errores});
        return;
    }
   
    
});


app.post('/api/agregar_novedad', async function(req, res) {
   
    var nov = new Novedad();
    nov.novedad = req.body.novedad;
    nov.firma = req.body.firma;
  
    await nov.save();
    res.json(nov);
});






app.listen(3000, function() {
    console.log('Corriendo en el puerto 3000');
});