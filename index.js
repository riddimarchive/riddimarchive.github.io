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

app.get('/login', (req, res) => {
  res.render('login',{
    title:'Riddim Archive Login',
    username: '',
    er: ''
  });
});

app.post('/login', (req, res) => {

  var { username, password } = req.body;

  async function hashAndCheckResults(pass){
      try{
          var thepass = pass;
          var user = {};

          var hashedpassword;

          //get hash password
          hashedpassword = await has.hashPass(thepass);
          console.log("Hashed is>>>: " + hashedpassword);

          //start connection and make queries
          var db = createConnection();

          await querie.connect(db);
          let result = await querie.getUserInfo(db, username);
          //end connection
          await querie.end(db);

          //check - user in database?
          if (result.length < 1){
            var er = "USER NOT FOUND";

            res.render('login', {
              username: username,
              er: er
            });

          }else{

                //store info
                user.username = result[0].username;
                user.access_level = result[0].access_level;
                user.password = result[0].password;

                //run hash compare - get boolean isMatch
                let isMatch = await has.passCheck(password, user.password);

                //check - password is correct?
                if(isMatch){
                    console.log("all passes checked, logging in");
                    //checkaccesslevel
                    //renderpageaccordingly
                    //for now - lets just do admin
                    res.render('admlogin', {
                      username: username,
                      user: user
                    });
                }else{
                    var er = "Wrong Password";

                    res.render('login', {
                      username: username,
                      er: er
                    });
                }

          }//result length else

      }catch(err){
          console.log(err);
      }
  }

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

      hashAndCheckResults(password);

    }

});

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
