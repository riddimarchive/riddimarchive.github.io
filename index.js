// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const db = require('./js/dbconnect');
const request = require('request');
const path = require('path');

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

  var test;

  db.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected to the DB!!!');
});

  db.query('SELECT * FROM artists WHERE artist_name = "A3"', (error, result, fields) => {
  if (error) {
    console.error('An error occurred while executing the query');
    throw error;
  }
  console.log(result);
  test = result[0].id;
  console.log("Test in" + test);
  console.log(result[0].artist_name);
});

  db.end((err) =>{
  if(err){
    console.log('cant end connecty');
    return;
  }
  console.log('Connection ended yo');
});

  console.log("Test out" + test);
  res.render('a3',{
    artist_name:'A3',
    id: test
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