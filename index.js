// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const db = require('./js/dbconnect');
const request = require('request');
const path = require('path');
const createError = require('http-errors');

// create new express app and save it as "app"
const app = express();

// server configuration
const port = process.env.PORT || 80

app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');


// create a route for the app
app.use(express.static('public'));
console.log("public acquired");
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



  /*
  	res.writeHead(200, { 'Content-Type': 'text/html'});
  	fs.readFile('index.html', function(error, data){
  		if(error){
  			res.writeHead(404);
  			res.write('File No Found Yo');
  		}else{
        console.log("WRITING DATA YO");
  			res.write(data);
  		}
  		res.end();
    */
});

app.get('/a3', function(req,res){

  //declare array - query will be stored here
  var artist = [];
  var tracks = [];

  //connect to db
  db.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected to the DB!!!');
  });

  //first query - get artist info
  db.query('SELECT * FROM artists WHERE artist_name = "A3"', (error, result, fields) => {
    if (error) {
      console.error('An error occurred while executing the query');
      throw error;
    }
    console.log(result);
    var info = {
        'id':result[0].id,
        'artist_name':result[0].artist_name,
        'crew':result[0].crew,
        'country':result[0].country
      }
      //Add object into array
      artist.push(info);
      console.log("vvv artist");
      console.log(artist);

  });

  //second query - get tracks from that artist
  db.query('SELECT * FROM tracks WHERE artist_name = "AD"', (error, result, fields) => {
    if (error) {
      console.error('An error occurred while executing the query');
      throw error;
    }
    console.log(result);
    for (var i = 0; i < result.length; i++) {
      var row = {
        'track_name':result[i].id,
        'artist_name':result[i].artist_name,
        'drive_url':result[i].drive_url
      }
      //Add object into array
      tracks.push(row);
      console.log("vvv tracks");
      console.log(tracks);
    }
  });

  //end connection
  db.end((err) =>{
  if(err){
    console.log('cant end connecty');
    return;
  }
  console.log('Connection ended yo');
  });

  res.render('a3',{
    artist_name:'A3',
    artist: artist,
    tracks: tracks
  });

});

/*
//make databate connection
db.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected to the DB!!!');
});

//test query
db.query('SELECT artist_name FROM artists', (error, artists, fields) => {
  if (error) {
    console.error('An error occurred while executing the query');
    throw error;
  }
  console.log(artists);
});

//end database connection
db.end((err) =>{
  if(err){
    console.log('cant end connecty');
    return;
  }
  console.log('Connection ended yo');
});
*/
// make the server listen to requests
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

module.export = app;