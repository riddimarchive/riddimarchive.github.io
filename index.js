// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const createConnection = require('./js/dbconnect');
const request = require('request');
const path = require('path');
const createError = require('http-errors');
const querie = require('./js/makequery');
 
// create new express app and save it as "app"
const app = express();

// server configuration
const port = process.env.PORT || 80

//set pug as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

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


//test get - first artist page
app.get('/a3', function(req,res){

  //declare array - query will be stored here
  var artist = {};
  var tracks = [];


  async function serverResponse(){
      try{

          var db = createConnection();

          await querie.connect(db);
          let result = await querie.getArtistInfo(db, 'AD');

          artist.id = result[0].id;
          artist.artist_name = result[0].artist_name;
          artist.crew = result[0].crew;
          artist.country = result[0].country;

          let tresult = await querie.getAllTracksFromArtist(db, 'AD');

          for (var i = 0; i < tresult.length; i++) {
            var row = {
              'track_name':tresult[i].track_name,
              'artist_name':tresult[i].artist_name,
              'drive_url':tresult[i].drive_url
            }
            tracks.push(row);
          }

          await querie.end(db);

          console.log(artist);
          console.log(tracks);

          res.render('a3',{
            artist_name:'A3',
            artist: artist,
            tracks: tracks
          });

      }catch(err){
        res.render('error');
      }

  }

  serverResponse();

});

// make the server listen to requests
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

module.export = app;