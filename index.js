// import express (after npm install express)
const express = require('express');
const fs = require('fs');

// create new express app and save it as "app"
const app = express();

// server configuration
const PORT = 8080;

// create a route for the app
app.use(express.static('public'));
app.get('/', (req, res) => {
  	res.writeHead(200, { 'Content-Type': 'text/html'});
  	fs.readFile('index.html', function(error, data){
  		if(error){
  			res.writeHead(404);
  			res.write('File No Found Yo')
  		}else{
  			res.write(data);
  		}
  		res.end();
  	});
});
/*
// make the server listen to requests
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});
*/