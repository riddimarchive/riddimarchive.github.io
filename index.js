// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const createConnection = require('./js/dbconnect');
const request = require('request');
const path = require('path');
const createError = require('http-errors');
const querie = require('./js/makequery');
const has = require('./js/hash');
const session = require('express-session');
const passport = require('passport');

 
// create new express app and save it as "app"
const app = express();

//passport config
require('./js/passport')(passport);

// server configuration
const port = process.env.PORT || 80

//set pug as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//bodyparser - obtain info from post requests in req.body
app.use(express.urlencoded({ extended: false }));

//express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// create public folders in express
app.use(express.static('public'));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//init get - load home page
app.get('/', (req, res) => {
  res.render('homepage',{
    title:'Riddim Archive Index'
  });

  console.log("Homepage Pug Loaded!!!");

  // error page route
  app.use((req, res, next) => {
    return next(createError(404, 'File Not Found'));
  });

  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = status;
    console.log("Status: " + status);
    console.log("Message: " + res.locals.message);
    res.status(status);
    res.render('error');
  });

});

app.get('/home', (req, res) => {
  res.render('homepage',{
    title:'Riddim Archive Index'
  });

  console.log("Returned Home!!!");

});

app.get('/faq', (req, res) => {
  res.render('faq',{
    title:'Riddim Archive FAQ'
  });
});

app.get('/login', (req, res) => {
  res.render('login',{
    title:'Riddim Archive Login',
    username: '',
    er: ''
  });
});


app.post('/login', (req, res, next) => {

  var { username, password } = req.body;

  //if username and password are blank
  //render with error "Fill in all fields!"
  //else: do query function

  if(!username || !password){
            var er = "Fill in all Fields!";

            res.render('login', {
              username: username,
              er: er
            });
    }else{

      passport.authenticate('local', {
        successRedirect: '/admlogin',
        failureRedirect: '/login'
      })(req, res, next);

    }

});

//test get 2 - standard artist page
app.get('/artist/:name', function(req,res){

  var art_name = req.params.name;
  

  async function artistPageResponse(aname){
      try{

          var name = aname;
          var artist = {};
          var tracks = [];

          var db = createConnection();

          await querie.connect(db);
          let result = await querie.getArtistInfo(db, name);

          artist.id = result[0].id;
          artist.artist_name = result[0].artist_name;
          artist.crew = result[0].crew;
          artist.country = result[0].country;

          let tresult = await querie.getAllTracksFromArtist(db, name);

          for (var i = 0; i < tresult.length; i++) {
            var row = {
              'track_name':tresult[i].track_name,
              'artist_name':tresult[i].artist_name,
              'drive_url': 'https://drive.google.com/uc?export=download&id=' + tresult[i].drive_url
            }
            tracks.push(row);
          }

          await querie.end(db);

          res.render('artist',{
            artist_name: name,
            artist: artist,
            tracks: tracks
          });

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }

  artistPageResponse(art_name);

});


// make the server listen to requests
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

module.export = app;
