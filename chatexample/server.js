const express = require('express');
//Initialize express
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const passport = require('passport');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
var fs = require('fs');

const chat = require('./socket/chat');
require('./models/User');

//Load routes
const users = require('./routes/users');
const chats = require('./routes/chats');

//Port setup
const port = process.env.PORT || 3004;

//parsing middlewares
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

//CORS
app.use(cors());

//including models files.
fs.readdirSync("./models").forEach(function(file){
    if(file.indexOf(".js")){
      require("./models/"+file);
    }
  });

app.use(logger('dev'));

//DB Connection
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose.connect(db);
mongoose.connection.once('open', function() {
    console.log('Connected to mongodb....');
});

//Use routes
app.use('/api/users', users);
app.use('/api/chats', chats);

//http method override middleware
app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
}));

//session setup
var sessionInit = session({
    name : 'userCookie',
    secret : '9743-980-270-india',
    resave : true,
    httpOnly : true,
    saveUninitialized: true,
    store : new mongoStore({mongooseConnection : mongoose.connection}),
    cookie : { maxAge : 80*80*800 }
  });

app.use(sessionInit);

//Passport middleware
app.use(passport.initialize());

//Passport config
require('./config/passport')(passport);

//Passport config
// require('./config/passport')(passport);

const server = app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

const io = require('socket.io').listen(server);
chat(io);