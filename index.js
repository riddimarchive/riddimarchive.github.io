// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const db = require('./js/dbconnect');
const db2 = require('./js/dbconnect');
const request = require('request');
const path = require('path');
const createError = require('http-errors');

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

  //connect to db2
  db2.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected to the DB!!!');
  });

  //second query - get tracks from that artist
  db2.query('SELECT * FROM tracks WHERE artist_name = "AD"', (error, result, fields) => {
    if (error) {
      console.error('An error occurred while executing the query');
      throw error;
    }
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
  
  //end connection
  db2.end((err) =>{
  if(err){
    console.log('cant end connecty');
    return;
  }
  console.log('Connection ended yo');
  });

  //not in scope - this returns nothing - FIX!!!
  console.log(artist);
  console.log(tracks);
  res.render('a3',{
    artist_name:'A3',
    artist: artist,
    tracks: tracks
  });

});

// make the server listen to requests
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

module.export = app;