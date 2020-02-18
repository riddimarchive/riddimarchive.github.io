//Index/Main JS
//module reqs: express and express session, fs, http request, path and errors, and passport
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const request = require('request');
const path = require('path');
const createError = require('http-errors');
const passport = require('passport');

//file reqs: database connect, query functions, hash functions
const createConnection = require('./js/dbconnect');
const querie = require('./js/makequery');
const has = require('./js/hash');


 
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

//GET REQUEST - INIT
//render homepage, handle page errors
app.get('/', (req, res) => {
  res.render('homepage',{
    title:'Riddim Archive Index'
  });

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


//GET REQUEST - HOMEPAGE
app.get('/home', (req, res) => {

  res.render('homepage',{
    title:'Riddim Archive Index'
  });

});


//GET REQUEST - FAQ PAGE
app.get('/faq', (req, res) => {

  res.render('faq',{
    title:'Riddim Archive FAQ'
  });

});


//GET REQUEST - LOGIN PAGE
app.get('/login', (req, res) => {

  res.render('login',{
    title:'Riddim Archive Login',
    username: '',
    er: ''
  });

});


//GET REQUEST - USER DASHBOARD
app.get('/dashboard', (req, res) => {
  
  //handle non-login requests, go back to home
  if(req.user === undefined){

    res.render('login',{
      title:'Riddim Archive Login',
      username: '',
      er: ''
    });

  }else{

    //store user returned by passport (req.user)
    var thelevel = req.user.access_level;
    var theid = req.user.id;
    var theusername = req.user.username;

    //redirect by permission level
    switch(thelevel) {
      case 3:
        res.render('admdash',{
          username: theusername,
          access_level: thelevel,
          id: theid
        });
        break;
      case 2:
        res.render('moddash',{
          username: theusername,
          access_level: thelevel,
          id: theid
        });
        break;
      case 1:
        res.render('userdash',{
          username: theusername,
          access_level: thelevel,
          id: theid
        });
        break;
      default:
        res.render('login',{
          title:'Riddim Archive Login',
          username: '',
          er: ''
        });
    }//end switch
  }//end else

});//end dashboard get request


//GET REQUEST - TRACK CRUD PAGE
app.get('/trackcrud', (req, res) => {

  if(req.user === undefined){
    console.log("User does not Exist");
    res.redirect('/login');
  }else{

      if(req.user.access_level > 1){
    
        res.render('trackcrud',{
          username: ''
        });
    
      }else{
        console.log("User does not have Access");
        res.redirect('/login');
      }
  }

});


//GET REQUEST - USER CRUD PAGE
app.get('/usercrud', (req, res) => {

  if(req.user === undefined){
    console.log("User does not Exist");
    res.redirect('/login');
  }else{

      if(req.user.access_level > 1){
    
        res.render('usercrud',{
          username: ''
        });
    
      }else{
        console.log("User does not have Access");
        res.redirect('/login');
      }
  }

});


//GET REQUEST - LOGOUT
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/home');
});


//GET REQUEST - ARTIST PAGE
app.get('/artist/:name', function(req,res){

  //store name from url
  var art_name = req.params.name;
  
  //make queries, get all artist/track info and render artist page
  async function artistPageResponse(aname){
      try{

          var name = aname;
          var artist = {};
          var tracks = [];

          var db = createConnection();

          await querie.connect(db);
          let result = await querie.getArtistInfo(db, name);

          //store artist query result
          artist.id = result[0].id;
          artist.artist_name = result[0].artist_name;
          artist.crew = result[0].crew;
          artist.country = result[0].country;

          let tresult = await querie.getAllTracksFromArtist(db, name);

          //store track query results
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


//POST REQUEST - LOGIN FORM
//check for field entry, authenticate and redirect with passport
app.post('/login', (req, res, next) => {

  var { username, password } = req.body;

  if(!username || !password){
            var er = "Fill in all Fields!";

            res.render('login', {
              username: username,
              er: er
            });
    }else{
      passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login'
      })(req, res, next);

    }

});

//POST REQUEST - Track Create
//check for field entry, authenticate and redirect with passport
app.post('/trackcreate', (req, res, next) => {

  var { track_name, artist_name, drive_url } = req.body;

  if(!track_name || !artist_name || !drive_url){
            var er = "Fill in all Fields!";

            res.render('trackcrud', {
              er: er
            });
    }else{
      res.send("Track name is " + track_name + ", Artist Name is " + artist_name + ", drive_url Name is " + drive_url);

    }

});


//Server Request Handler
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

//export app
module.export = app;