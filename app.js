const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const http = require('http').Server(app);
const jsonfile = require('jsonfile');
const dateFormat = require('dateformat');
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

const file = './public/data.json'

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    console.log('message: ' + JSON.stringify(msg));
    let myData = jsonfile.readFileSync(file);
    msg.date = dateFormat(msg.date, "dddd, dd-mm-yyyy, HH:MM:ss");

    // append message to json table
    myData[myData.length] = msg;
    jsonfile.writeFile(file, myData, function(err) {
      if (err) console.error(err);
    });

    io.emit('chat message', msg);
  });


});

app.get('/messages', function(req, res) {
  res.json(jsonfile.readFileSync(file));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(3000);
module.exports = app;
