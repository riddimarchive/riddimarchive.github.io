// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const createConnection = require('./js/dbconnect');
const request = require('request');
const path = require('path');
const createError = require('http-errors');
const querie = require('./js/makequery');
const has = require('./js/hash');

 
// create new express app and save it as "app"
const app = express();

// server configuration
const port = process.env.PORT || 80

//set pug as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

//bodyparser - obtain info from post requests in req.body
app.use(express.urlencoded({ extended: false }));

// create public folders in express
app.use(express.static('public'));

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

app.get('/admin', (req, res) => {
  res.render('admin',{
    title:'Riddim Archive Admin Login'
  });
});

app.post('/admin', (req, res) => {
  var { username, password } = req.body;
  let errors = [];
  console.log(username + " <username");
  console.log(password + " <password");

  async function hashy(pass){
      try{
          var thepass = pass;
          var user = {};
          var hashedpassword;

          //get hash password

          hashedpassword = await has.hashPass(thepass);

          //start connection and make queries

          var db = createConnection();

          await querie.connect(db);
          let result = await querie.getUserInfo(db, username);

          //store results in user

          user.username = result[0].username;
          user.access_level = result[0].access_level;
          user.password = result[0].password;

          //end connection
          await querie.end(db);

          console.log(user);

          res.send(user.access_level + "access_level");


      }catch(err){
          console.log(err);
      }
  }

  hashy(password);

});





  /*
  if(!username || !password){
    errors.push({ msg : 'Please Enter in ALL fields'});
  }
  */
  //make query, check if password matches

  //res.send('Items submitted - Check COnsolee');

  //decrypt pass with bcrypt
  //make query of users table - select * from users
  //use function similar
  //authenticate via passport




//test get 2 - standard artist page
app.get('/artist/:name', function(req,res){

  console.log("req name is" + req.params.name);
  var art_name = req.params.name;
  console.log("art_name is " + art_name);
  

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

          console.log(artist);
          console.log(tracks);

          res.render('artist',{
            artist_name:name,
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
