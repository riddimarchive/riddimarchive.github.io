// import express (after npm install express)
const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const con = require('./dbconnect');

// create new express app and save it as "app"
const app = express();

// server configuration
const port = process.env.PORT || 80

// create a route for the app
app.use(express.static('public'));
console.log("public acquired");
app.get('/', (req, res) => {
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
  	});
});

con.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected');
});

//connect to db
//direct copy from dbconnect.js
//After test, call the js file into here more cleanly
/*
const connecty = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connecty.connect((err) => {
  if(err){
    console.log('ERROR COULD NOT CONNECT NERD');
    return;
  }
  console.log('Connected to the DB!!!');
});

//test query

connecty.query('SELECT * FROM tracks', (error, tracks, fields) => {
  if (error) {
    console.error('An error occurred while executing the query');
    throw error;
  }
  console.log(tracks);
});

connecty.end((err) =>{
  if(err){
    console.log('cant end connecty');
    return;
  }
  console.log('Connection ended yo');
});



//end copy
*/

// make the server listen to requests
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});