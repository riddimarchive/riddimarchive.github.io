//Index/Main JS
//module reqs: express and express session, fs, http request, path and errors, and passport
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const createError = require('http-errors');
const passport = require('passport');

//file reqs: database connect, query functions, hash functions
const createConnection = require('./js/dbconnect');
const conquerie = require('./js/conquery');
const artquerie = require('./js/artquery');
const trackquerie = require('./js/trackquery');
const userquerie = require('./js/userquery');
const has = require('./js/hash');
const emailer = require('./js/email');

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

//express file-upload
app.use(fileUpload());

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

//GET REQUESTS
//***********************

//GET REQUEST - INIT
//render homepage, handle page errors
app.get('/', (req, res) => {

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

  async function homeResponse(){
      try{
        var artists = [];
        var totw = [];
        var user_id = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        
        if(req.user !== undefined){
          user_id = req.user.id;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = {
            'track_name':result[i].track_name,
            'artist_name':result[i].artist_name,
            'drive_url': result[i].drive_url,
            'id': result[i].id
          }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = {
            'artist_name': tresult[i].artist_name
          }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;

        await conquerie.end(db);

        res.render('homepage',{
          title:'Riddim Archive Index',
          msg: "",
          artists: artists,
          currentuserid: user_id,
          randdriveurl: randdriveurl,
          randartistname: randartistname,
          randtrackname: randtrackname,
          totw: totw
        });

        }catch(err){
          console.log(err);
          res.render('error');
        }
  }

  homeResponse();

});


//GET REQUEST - FAQ PAGE
app.get('/faq', (req, res) => {
  
  res.render('faq',{
    title:'Riddim Archive FAQ'
  });

});


//GET REQUEST - LOGIN PAGE
app.get('/login', (req, res) => {

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
    var theusername = req.user.username;

    //redirect by permission level
    switch(thelevel) {
      case 3:
        res.render('admdash',{
          username: theusername
        });
        break;
      case 2:
        res.render('moddash',{
          username: theusername
        });
        break;
      case 1:
        res.render('userdash',{
          username: theusername
        });
        break;
    }//end switch
  }//end else
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
    var theusername = req.user.username;

    //redirect by permission level
    switch(thelevel) {
      case 3:
        res.render('admdash',{
          username: theusername
        });
        break;
      case 2:
        res.render('moddash',{
          username: theusername
        });
        break;
      case 1:
        res.render('userdash',{
          username: theusername
        });
        break;
    }//end switch
  }//end else
});


//GET REQUEST - CREATE ACCOUNT PAGE
app.get('/create', (req, res, next) => {

  res.render('create',{
    title:'Create Account',
    msg: ""
  });

});


//GET REQUEST - CHANGE PASSWORD PAGE
app.get('/changepass', (req, res, next) => {

  //handle non-login requests, go back to home
  if(req.user === undefined){
    res.render('login',{
      title:'Riddim Archive Login',
      username: '',
      er: ''
    });

  }else{
    var theusername = req.user.username;

    res.render('changepass',{
      title:'Change Password',
      msg: "",
      username: theusername
    });
  }
});


//GET REQUEST - TRACK CRUD PAGE
app.get('/trackcrud', (req, res) => {

  if(req.user === undefined){
    console.log("User does not Exist");
    res.redirect('/login');
  }else{

      if(req.user.access_level > 1){   
        res.render('trackcrud', {
              msg: "",
              msg2: ""
            });
      }else{
        console.log("User does not have Access");
        res.redirect('/login');
      }//end inner else
  }//end main else
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
      }//end inner else
  }//end main else
});


//GET REQUEST - FAVORITES PAGE
app.get('/favorites', (req, res) => {

  //handle non-login requests, go back to home
  if(req.user === undefined){
    res.render('login',{
      title:'Riddim Archive Login',
      username: '',
      er: ''
    });

  }else{
    var theusername = req.user.username;
    var user_id = req.user.id;

    async function favoritesPageResponse(user_id, theusername){
      try{

        var msg = "";
        var db = createConnection();
        var tracks = [];
        await conquerie.connect(db);

        let result = await userquerie.getUserFavorites(db, user_id);

        if(result.length === 0 || result === undefined){
          console.log("No Faves");
          msg = `You have no favorites, Add some in the Archive!`;

          await conquerie.end(db);
          
          res.render('favorites',{
            thetracks: tracks,
            currentuserid: user_id,
            username: theusername,
            msg:msg
          });
        }else{

          for (var i = 0; i < result.length; i++) {
            var row = {
              'track_name': result[i].track_name,
              'artist_name': result[i].artist_name,
              'drive_url': result[i].drive_url,
              'id': result[i].id
            }
            tracks.push(row);
          }

          await conquerie.end(db);

          res.render('favorites',{
            thetracks: tracks,
            currentuserid: user_id,
            username: theusername,
            msg: msg
          });
      }

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  favoritesPageResponse(user_id, theusername);

  }//end else
});


//GET REQUEST - ARTIST CRUD PAGE
app.get('/artcrud', (req, res) => {

  if(req.user === undefined){
    console.log("User does not Exist");
    res.redirect('/login');
  }else{

      if(req.user.access_level > 1){
    
        res.render('artcrud',{
          msg: "",
          msg2: ""
        });
    
      }else{
        console.log("User does not have Access");
        res.redirect('/login');
      }//end inner else
  }//end main else
});


//GET REQUEST - LOGOUT
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//GET REQUEST - ARTIST PAGE
app.get('/artist/:name', function(req,res){

  //store name from url
  var art_name = req.params.name;
  var user_id = "";

  if(req.user !== undefined){
    user_id = req.user.id;
  }

  
  //make queries, get all artist/track info and render artist page
  async function artistPageResponse(aname){
      try{

          var name = aname;
          var artist = {};
          var tracks = [];
          var info = "";
          var msg = "";

          var db = createConnection();
          await conquerie.connect(db);

          let result = await artquerie.getArtistInfo(db, name);
          info = `${result[0].info}`;

          let tresult = await trackquerie.getAllTracksFromArtist(db, name);
          for (var i = 0; i < tresult.length; i++) {
            var row = {
              'track_name':tresult[i].track_name,
              'artist_name':tresult[i].artist_name,
              'drive_url': tresult[i].drive_url,
              'crew': tresult[i].crew,
              'country': tresult[i].country,
              'artist_id': tresult[i].artist_id,
              'id': tresult[i].id
            }
            tracks.push(row);
          }

          await conquerie.end(db);

          res.render('artist',{
            artist_name: name,
            info: info,
            tracks: tracks,
            currentuserid: user_id,
            msg: msg
          });

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  artistPageResponse(art_name);

});


//GET REQUEST - REQUEST HANDLER
app.get('/req/:page', function(req,res){

  //store page from url
  var pagey = req.params.page;

  switch(pagey) {
      case "submission":
        res.render('submission',{
          msg: ""
        });
        break;
      case "tracksubmission":
        res.render('tracksubmission',{
          msg: ""
        });
        break;
      case "tunereport":
        res.render('tunereport',{
          msg: ""
        });
        break;
      case "removal":
        res.render('removal',{
          msg: ""
        });
        break;
      case "question":
        res.render('question',{
          msg: ""
        });
        break;
      default:
        res.render('faq',{
          title:'Riddim Archive FAQ'
        });
        break;
    }//end switch
});


//POST REQUESTS
//***********************

//POST REQUEST - HOMEPAGE FAVORITES
app.post('/', (req, res, next) => {

  var { user_id, track_id, favetrack_name, name } = req.body;

  if(user_id === "" || req.user.id === undefined){
    //load homepage, make message to login
    async function homeResponse(){
      try{
        var artists = [];
        var totw = [];
        var user_id = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        
        if(req.user !== undefined){
          user_id = req.user.id;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = {
            'track_name':result[i].track_name,
            'artist_name':result[i].artist_name,
            'drive_url': result[i].drive_url,
            'id': result[i].id
          }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = {
            'artist_name': tresult[i].artist_name
          }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;

        await conquerie.end(db);

        res.render('homepage',{
          title:'Riddim Archive Index',
          msg: "Please login to save Favorites!",
          artists: artists,
          currentuserid: user_id,
          randdriveurl: randdriveurl,
          randartistname: randartistname,
          randtrackname: randtrackname,
          totw: totw
        });

        }catch(err){
          console.log(err);
          res.render('error');
        }
  }

  homeResponse();

  }else{
    //add favorites add query
    async function homeResponse(){
      try{
        var artists = [];
        var totw = [];
        var user_id = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        
        if(req.user !== undefined){
          user_id = req.user.id;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = {
            'track_name':result[i].track_name,
            'artist_name':result[i].artist_name,
            'drive_url': result[i].drive_url,
            'id': result[i].id
          }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = {
            'artist_name': tresult[i].artist_name
          }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        
        //confirm favorite isn't already there
        let ckresult = await userquerie.checkUserFavorite(db, user_id, track_id);
        if(ckresult.length > 0){
          msg = `${favetrack_name} is already added!`;        
          await conquerie.end(db);

          res.render('homepage',{
            title:'Riddim Archive Index',
            msg: `${favetrack_name} is already added!`,
            artists: artists,
            currentuserid: user_id,
            randdriveurl: randdriveurl,
            randartistname: randartistname,
            randtrackname: randtrackname,
            totw: totw
          });
        }else{

          //store into favorites here, need user ID and track ID
          console.log("ADDING TO FAVORTIES");
          let ufresult = await userquerie.addUserFavorite(db, user_id, track_id);
          await conquerie.end(db);
        }

        res.render('homepage',{
          title:'Riddim Archive Index',
          msg: `${favetrack_name} Added to Favorites!`,
          artists: artists,
          currentuserid: user_id,
          randdriveurl: randdriveurl,
          randartistname: randartistname,
          randtrackname: randtrackname,
          totw: totw
        });

        }catch(err){
          console.log(err);
          res.render('error');
        }
  }

  homeResponse();


  
  }


});

//POST REQUEST - LOGIN FORM
//check for field entry, authenticate and redirect with passport
app.post('/login', (req, res, next) => {

  var { username, password } = req.body;

  if(!username || !password){
    res.render('login', {
      username: username,
      er: "Fill in all Fields!"
    });
  }else{
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login'
    })(req, res, next);
  }
});


//POST REQUEST - CREATE ACCOUNT FORM
//check for field entry, add to database
app.post('/create', (req, res, next) => {

  var { username, password, password2 } = req.body;
  //res.send(username+password+password2);
  
  if(!username || !password || !password2){
    res.render('create',{
      title:'Create Account',
      msg: "Fill in all Fields!"
    });
  }else{
    if(password !== password2){
      res.render('create',{
        title:'Create Account',
        msg: "Passwords Don't Match, Please Re-Enter"
      });
    }else{
      //perform hash and add query
      async function createPageResponse(username, password){
        try{
          var db = createConnection();
          var hashpass = "";
          await conquerie.connect(db);

          let uresult = await userquerie.getUserInfo(db, username);
          if(uresult.length > 0){
            res.render('create',{
              title:'Create Account',
              msg: "Username Taken! Please Try a Different Name"
            });
          }else{
              hashpass = await has.hashPass(password);
              let result = await userquerie.createAccount(db, username, hashpass);

              await conquerie.end(db);
              res.render('create',{
                title:'Create Account',
                msg: "Account Created! Feel Free to Login at the link above!"
              });
          }//end else
        }catch(err){
          console.log(err);
          res.render('error');
        }
    }//end async

    createPageResponse(username, password);

    }//end inner else
  }//end outer else


});

app.post('/changepass', (req, res, next) => {
  var { newpass, newpass2, username } = req.body;
  var theusername = username;
  //confirm all fields are full
  //confirm password1 and 2 match
  //encrypt and replace password
  if(!newpass || !newpass2){
    res.render('changepass',{
      title:'Change Password',
      msg: "Fill in all Fields!",
      username: theusername
    });
  }else{
    if(newpass !== newpass2){
      res.render('changepass',{
        title:'Change Password',
        msg: "Passwords Don't Match, Please Re-Enter",
        username: theusername
      });
    }else{
      //perform hash and add query
      async function changePassResponse(theusername, newpass){
        try{
          var db = createConnection();
          var hashpass = "";
          await conquerie.connect(db);

          hashpass = await has.hashPass(newpass);
          let result = await userquerie.changePass(db, theusername, hashpass);

          await conquerie.end(db);
          res.render('changepass',{
            title:'Change Password',
            msg: "Password changed, please log in next time with new password",
            username: theusername
          });
        }catch(err){
          console.log(err);
          res.render('error');
        }
    }//end async

    changePassResponse(theusername, newpass);

    }//end inner else
  }//end outer else

});

app.post('/forward',(req,res)=>{
  var theid = "";
  var thedriveurl = "";
  var theartistname = "";
  var thetrackname = "";

  async function forwardResponse(){
    try{
      var db = createConnection();
      await conquerie.connect(db);
      
      let result = await trackquerie.getRandomTrack(db);
      theid = result[0].id;
      thedriveurl = result[0].drive_url;
      theartistname = result[0].artist_name;
      thetrackname = result[0].track_name;

      await conquerie.end(db);
      res.send({source: thedriveurl, id: theid, artist_name: theartistname, track_name: thetrackname});
    
    }catch(err){
      console.log(err);
      res.render('error');
    }
  }//end async

forwardResponse();
});


//POST REQUEST - Track Create
//check for field entry, authenticate and redirect with passport
app.post('/trackcreate', (req, res, next) => {

  var { track_name, artist_name, drive_url } = req.body;

  if(!track_name || !artist_name || !drive_url){
      res.render('trackcrud', {
        msg: "Fill in all Fields!",
        msg2: ""
      });
    }else{
      //make queries, get all artist/track info and render artist page
      async function storeFormResults(track_name, artist_name, drive_url){
          try{
            var db = createConnection();
            var collab_artist = " ";
            var artist_id;

            await conquerie.connect(db);
            let result = await artquerie.getArtistInfo(db, artist_name);

            //store artist query result
            artist_id = result[0].id;
            let tresult = await trackquerie.addTrack(db, artist_id, artist_name, track_name, collab_artist, drive_url);

            await conquerie.end(db);

            res.render('trackcrud', {
              msg: "Track Created!",
              msg2: ""
            });
          }catch(err){
            console.log(err);
            res.render('error');
          }
      }//end async

      storeFormResults(track_name, artist_name, drive_url);
    }//end else
});


//POST REQUEST - Track Delete
//Make query, delete track with that name
app.post('/trackdelete', (req, res, next) => {

  var { track_name } = req.body;

  if(!track_name){
            res.render('trackcrud', {
              msg: "",
              msg2: "Enter Track Name!"
            });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyTrack(track_name){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await trackquerie.getTrackInfo(db, track_name);
                    console.log(result.length);

                    if(result.length == 0){
                        console.log("cant find track");
                        res.render('trackcrud', {
                          msg: "",
                          msg2: "Track Not Found"
                        });
                    }else{

                        let tresult = await trackquerie.deleteTrack(db, track_name);
                        console.log("Track Found");
                        res.render('trackcrud', {
                          msg: "",
                          msg2: "Track Deleted!"
                        });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyTrack(track_name);

    }

});


//POST REQUEST - User Create
//check for field entry, authenticate and redirect with passport
app.post('/usercreate', (req, res, next) => {

  var { username, password, access_level } = req.body;

  if(!username || !password || !access_level){
            res.render('usercrud', {
              msg: "Fill in all Fields!",
              msg2: ""
            });
    }else{

      async function addyUser(username, password, access_level){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await userquerie.getUserInfo(db, username);

                    if(result.length > 0){
                        console.log("USER ALREADY EXISTY");
                        res.render('usercrud', {
                          msg: "USER ALREADY EXISTY",
                          msg2: ""
                        });
                    }else{
                        let hashedpass = await has.hashPass(password);
                        let tresult = await userquerie.addUser(db, username, hashedpass, access_level);

                        res.render('usercrud', {
                          msg: "USER Added!",
                          msg2: ""
                        });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            addyUser(username, password, access_level);

    }//end else

});


//POST REQUEST - User Delete
//Make query, User track with that name
app.post('/userdelete', (req, res, next) => {

  var { username } = req.body;

  if(!username){
            res.render('usercrud', {
              msg: "",
              msg2: "Enter User Name!"
            });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyUser(username){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await userquerie.getUserInfo(db, username);

                    if(result.length == 0){
                        console.log("cant find user");
                        res.render('usercrud', {
                          msg: "",
                          msg2: "User Not Found"
                        });
                    }else{

                        let tresult = await userquerie.deleteUser(db, username);
                        console.log("User Found");
                        res.render('usercrud', {
                          msg: "",
                          msg2: "User Deleted!"
                        });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyUser(username);

    }

});


//POST REQUEST - Artist Create
//check for field entry, make query to add artist
app.post('/artistcreate', (req, res, next) => {

  var { artist_name, crew, country, info } = req.body;

  if(!artist_name){
            res.render('artcrud', {
              msg: "Fill in Artist Name",
              msg2: ""
            });
    }else{
            if(!crew){ crew = ""; }
            if(!country){ country = ""; }
            if(!info){ info = ""; }

            async function addyArtist(artist_name, crew, country, info){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await artquerie.getArtistInfo(db, artist_name);

                    if(result.length > 0){
                        res.render('artcrud', {
                          msg: "Artist ALREADY EXISTY",
                          msg2: ""
                        });
                    }else{

                        let tresult = await artquerie.addArtist(db, artist_name, crew, country, info);
                        res.render('artcrud', {
                          msg: "Artist Added!",
                          msg2: ""
                        });

                    }

                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            addyArtist(artist_name, crew, country, info);

    }

});


//POST REQUEST - Artist Delete
app.post('/artistdelete', (req, res, next) => {

  var { artist_name } = req.body;

  if(!artist_name){
            res.render('artcrud', {
              msg: "",
              msg2: "Enter Artist Name!"
            });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyArtist(artist_name){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await artquerie.getArtistInfo(db, artist_name);

                    if(result.length == 0){
                        console.log("cant find artist");
                        res.render('artcrud', {
                          msg: "",
                          msg2: "Artist Not Found"
                        });
                    }else{

                        let tresult = await artquerie.deleteArtist(db, artist_name);
                        console.log("Artist Found");
                        res.render('artcrud', {
                          msg: "",
                          msg2: "Artist Deleted!"
                        });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyArtist(artist_name);

    }

});


//POST REQUEST - Artist Search
app.post('/search', (req, res, next) => {

  var { search_results, search_style } = req.body;
  if(!search_results){
    async function getShuffle(){
      try{
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        var db = createConnection();
        await conquerie.connect(db);

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;

        await conquerie.end(db);

        res.render('homepagenf', {
          msg: "Enter a Search!",
          randdriveurl: randdriveurl,
          randartistname: randartistname,
          randtrackname: randtrackname
        });
      
      }catch(err){
        console.log(err);
        res.render('error');
      }

    }//end getShuffle

  getShuffle();

  }else{
    search_results = search_results + "%";
    async function searchArtist(search_results, search_style){
        try{
            var artists = [];
            var totw = [];
            var db = createConnection();
            var user_id = "";
            var randdriveurl = "";
            var randartistname = "";
            var randtrackname = "";
        
            if(req.user !== undefined){
              user_id = req.user.id;
            }

            await conquerie.connect(db);

            let randresult = await trackquerie.getRandomTrack(db);
            randdriveurl = randresult[0].drive_url;
            randartistname = randresult[0].artist_name;
            randtrackname = randresult[0].track_name;

            if(search_style == 0){
              let result = await artquerie.searchArtists(db, search_results);

              if(result.length == 0){
                await conquerie.end(db);
                console.log("No items found");
                res.render('homepagenf',{
                  msg: "",
                  randdriveurl: randdriveurl,
                  randartistname: randartistname,
                  randtrackname: randtrackname
                });
              }else{

                  for (var i = 0; i < result.length; i++) {
                    var row = {
                      'artist_name': result[i].artist_name
                    }
                    artists.push(row);
                  }//end for

                  let zresult = await trackquerie.getTracksOfTheWeek(db);

                  for (var i = 0; i < zresult.length; i++) {
                    var row = {
                      'track_name':zresult[i].track_name,
                      'artist_name':zresult[i].artist_name,
                      'drive_url': zresult[i].drive_url,
                      'id': zresult[i].id
                    }
                    totw.push(row);
                  }

                  //end query and render
                  await conquerie.end(db);
                  res.render('homepage',{
                    title:'Riddim Archive Index',
                    msg: "",
                    artists: artists,
                    currentuserid: user_id,
                    randdriveurl: randdriveurl,
                    randartistname: randartistname,
                    randtrackname: randtrackname,
                    totw: totw
                  });
              }//end else



            }//end if, search style is 1, do crew search
            else{

              let cresult = await artquerie.searchArtistsByCrew(db, search_results);
              
              if(cresult.length == 0){
                await conquerie.end(db);
                console.log("No items found");
                res.render('homepagenf',{
                  msg: "",
                  randdriveurl: randdriveurl,
                  randartistname: randartistname,
                  randtrackname: randtrackname
                });
              }else{

                  for (var i = 0; i < cresult.length; i++) {
                    var row = {
                      'artist_name': cresult[i].artist_name
                    }
                    artists.push(row);
                  }//end for

                  let gresult = await trackquerie.getTracksOfTheWeek(db);

                  for (var i = 0; i < gresult.length; i++) {
                    var row = {
                      'track_name':gresult[i].track_name,
                      'artist_name':gresult[i].artist_name,
                      'drive_url': gresult[i].drive_url,
                      'id': gresult[i].id
                    }
                    totw.push(row);
                  }

                  //end query and render
                  await conquerie.end(db);
                  res.render('homepage',{
                    title:'Riddim Archive Index',
                    msg: "",
                    artists: artists,
                    currentuserid: user_id,
                    randdriveurl: randdriveurl,
                    randartistname: randartistname,
                    randtrackname: randtrackname,
                    totw: totw
                  });
              }//end else

            }//end else

        }catch(err){
          console.log(err);
          res.render('error');
        }

    }
    searchArtist(search_results, search_style);

  }

});

app.post('/tunesearch',(req,res)=>{

  var { search_results, a_name } = req.body;
  
  var user_id = "";
  var msg = "";
  var tracks = [];
  var reloadlist = 0;

  if(req.user !== undefined){
    user_id = req.user.id;
  }

  if(!search_results){
    msg = "Please Type in something to Search!";

    res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, artist_name: a_name, tracks: tracks});

  }else{
    //load artist page but with the new search
    search_results = search_results + "%";

    async function artistPageResponseWithTuneSearch(search_results, a_name){
      try{
          var db = createConnection();
          await conquerie.connect(db);
          //searching instead
          let sresult = await trackquerie.searchTunes(db, search_results, a_name);

          if(sresult.length == 0){
            await conquerie.end(db);
            msg = "No items found";
            
            res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, artist_name: a_name, tracks: tracks});

          }else{
          //there was a result, loading that instead
          for (var i = 0; i < sresult.length; i++) {
           var row = {
              'track_name':sresult[i].track_name,
              'artist_name':sresult[i].artist_name,
              'drive_url': sresult[i].drive_url,
              'id': sresult[i].id
           }
           tracks.push(row);
          }

          await conquerie.end(db);
          msg = "Search Results:";
          reloadlist = 1;
          
          res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, artist_name: a_name, tracks: tracks});
        }
      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  artistPageResponseWithTuneSearch(search_results, a_name);

  }
});

app.post('/favtunesearch',(req,res)=>{

  var { search_results, search_style } = req.body;
  
  var user_id = "";
  var msg = "";
  var tracks = [];
  var reloadlist = 0;

  if(req.user !== undefined){
    user_id = req.user.id;
  }

  if(!search_results){
    msg = "Please Type in something to Search!";

    res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});

  }else{
    //load artist page but with the new search
    search_results = search_results + "%";

    async function favoritePageResponseWithTuneSearch(user_id, search_results){
      try{
          var db = createConnection();
          await conquerie.connect(db);
          //searching instead
          if(search_style == 0){
              let sresult = await trackquerie.searchFavorites(db, user_id, search_results);
              if(sresult.length == 0){
                  await conquerie.end(db);
                  msg = "No items found";

                  res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});

              }else{
                //there was a result, loading that instead

                for (var i = 0; i < sresult.length; i++) {
                 var row = {
                    'track_name':sresult[i].track_name,
                    'artist_name':sresult[i].artist_name,
                    'drive_url': sresult[i].drive_url,
                    'id': sresult[i].id
                 }
                 tracks.push(row);
                }

                await conquerie.end(db);
                msg = "Search Results:";
                reloadlist = 1;
          
                res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});
              }//end result length else

          }else{
              let sresult = await trackquerie.searchFavoritesByArtist(db, user_id, search_results);
              if(sresult.length == 0){
                  await conquerie.end(db);
                  msg = "No items found";

                  res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});

              }else{
                //there was a result, loading that instead

                for (var i = 0; i < sresult.length; i++) {
                 var row = {
                    'track_name':sresult[i].track_name,
                    'artist_name':sresult[i].artist_name,
                    'drive_url': sresult[i].drive_url,
                    'id': sresult[i].id
                 }
                 tracks.push(row);
                }

                await conquerie.end(db);
                msg = "Search Results:";
                reloadlist = 1;
          
                res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});
              }//end result length else
          }//end search style else
        
      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  favoritePageResponseWithTuneSearch(user_id, search_results);

  }
});


//POST REQUEST - Artist Submission
app.post('/req/submission', (req, res, next) => {
  
  var { artist_name, crew, country, info, link} = req.body;
  //required: name, link, and image

  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No image was uploaded.');
    res.render('submission',{
      msg: "Please include Image!",
      msg2: ""
    });
  }else{
      if (!artist_name || !link){
        res.render('submission',{
          msg: "Please include Artist Name and Download Link!",
          msg2: ""
        });
      }else{
            let artist_img = req.files.img;
            
            async function makeEmail(artist_name, crew, country, info, link, artist_img){
                try{
                  await emailer.storeArtistImage(artist_img, artist_name);
                  await emailer.emailArtistForm(artist_name, crew, country, info, link, artist_img);
                  res.render('submission',{
                    msg: "Form Submitted! Admins will begin adding your page!",
                    msg2: ""
                  });
                    
                }catch(err){
                  console.log(err);
                  res.render('error');
                }
            }
              
            makeEmail(artist_name, crew, country, info, link, artist_img);
        }
          
  }

});


//POST REQUEST - Artist Removal
app.post('/req/removal', (req, res, next) => {
  
  var { info } = req.body;

  var reason = "Artist/Track Removal Request";

  if (!info){
    res.render('removal',{
      msg: "Please include what you would like removed!"
    });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('removal',{
                msg: "Form Submitted! We will remove the track/artist page ASAP!"
              });
                
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }
          
        makeEmail(reason, info);
    }
          
});


//POST REQUEST - FAVORITES ADD - Keeps current url
app.post('/artist/:name', (req, res, next) => {
  console.log("FAVORITES ADD CLICK");
  var { user_id, track_id, favetrack_name, name } = req.body;

  if(user_id === "" || req.user.id === undefined){
            var msg = "Please login to save Favorites!";
            res.send({msg: msg});

      //below else means user id is not blank
  }else{
      //make queries, get all artist/track info and render artist page
      async function favoritesAddResponse(){
        try{
            var msg = `${favetrack_name} Added to Favorites!`;

            var db = createConnection();
            await conquerie.connect(db);

            //confirm favorite isn't already there
            let ckresult = await userquerie.checkUserFavorite(db, user_id, track_id);
            if(ckresult.length > 0){
                msg = `${favetrack_name} is already added!`;
                await conquerie.end(db);
              
                res.send({msg: msg});
                //below means user is present and this is a new favorite
            }else{

                //store into favorites here, need user ID and track ID
                let ufresult = await userquerie.addUserFavorite(db, user_id, track_id);
                await conquerie.end(db);
                res.send({msg: msg});
            }
        }catch(err){
          console.log(err);
          res.render('error');
        }

      }
      favoritesAddResponse();
  }
});


//POST REQUEST - FAVORITES REMOVAL- Keeps current url
app.post('/favorites', (req, res, next) => {

  var { user_id, track_id, favetrack_name, name } = req.body;
  var theusername = req.user.username;

  async function favoritesRemoveResponse(user_id, track_id, favetrack_name, theusername){
    try{

        var msg = `${favetrack_name} Removed to Favorites!`;
        var tracks = [];

        var db = createConnection();
        await conquerie.connect(db);

        let ufresult = await userquerie.deleteUserFavorite(db, user_id, track_id);

        let result = await userquerie.getUserFavorites(db, user_id);

        for (var i = 0; i < result.length; i++) {
          var row = {
            'track_name': result[i].track_name,
            'artist_name': result[i].artist_name,
            'drive_url': result[i].drive_url,
            'id': result[i].id
          }
          tracks.push(row);
        }

        await conquerie.end(db);

        res.render('favorites',{
            thetracks: tracks,
            currentuserid: user_id,
            username: theusername,
            msg: msg
        });

      }catch(err){
        console.log(err);
        res.render('error');
      }

    }
    favoritesRemoveResponse(user_id, track_id, favetrack_name, theusername);
    //below else means user id is not blank


});


//POST REQUEST - Tune Broken Report
app.post('/req/tunereport', (req, res, next) => {
  
  var { info } = req.body;

  var reason = "Tune Is Broken/Missing Alert";

  if (!info){
    res.render('tunereport',{
      msg: "Please include the tune that is missing!"
    });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('tunereport',{
                msg: "Form Submitted! We will fix/reupload the broken tune!"
              });
                
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }
        makeEmail(reason, info);
    }
          
});


//POST REQUEST - Track Submission
app.post('/req/tracksubmission', (req, res, next) => {
  
  var { artist_name, link } = req.body;

  var reason = "Track Submission (Non Artist)";
  var info = "";

  if (!artist_name || !link){
    res.render('tracksubmission',{
      msg: "Please include artist name and link!"
    });
  }else{
        info = `
        
        Artist Name: ${artist_name} 

        Link: ${link}`;

        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('tracksubmission',{
                msg: "Form Submitted! We will add tunes to Riddim Archive if approved!"
              });
                
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }
        makeEmail(reason, info);
    }
          
});


//POST REQUEST - Question
app.post('/req/question', (req, res, next) => {
  
  var { info } = req.body;

  var reason = "Question/Comment";

  if (!info){
    res.render('question',{
      msg: "Please include your question/comment!"
    });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('question',{
                msg: "Form Submitted! We will reply as soon as we can!"
              });
                
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }
        makeEmail(reason, info);
    }
          
});


//Server Request Handler
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}/`);
});

//export app
module.export = app;
