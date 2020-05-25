//Index/Main JS
//module reqs: express and express session, fs, http request, path and errors, and passport
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const createError = require('http-errors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
flash = require('connect-flash');

//file reqs: database connect, query functions, hash functions
const createConnection = require('./js/dbconnect');
const conquerie = require('./js/conquery');
const commquerie = require('./js/comquery');
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

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//express-session
app.use(session({
  secret: 'secret fish',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

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
        var theusername = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";

        //set userid if logged in
        if(req.user !== undefined){
          user_id = req.user.id;
          theusername = req.user.username;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_remix != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_collab == 1){
            totw[i].blank = ` - ${totw[i].artist_name}${totw[i].collab_artist}`
          }
          if(totw[i].is_collab != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_remix == 1){
            totw[i].blank = ``;
          }
        }

        let tresult = await artquerie.getAllArtistsAthroughD(db);

        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;

        var shuffletext = `${randartistname} - ${randtrackname}`;

        if(randresult[0].is_collab == 1){
          shuffletext = `${randartistname}${randresult[0].collab_artist} - ${randtrackname}`
        }
        if(randresult[0].is_remix == 1){
          shuffletext = `${randresult[0].original_artist}${randtrackname}`;
        }

        await conquerie.end(db);

        res.render('homepage',{ title:'Riddim Archive Index', msg: "", artists: artists, currentuserid: user_id, randdriveurl: randdriveurl, randartistname: randartistname, randtrackname: randtrackname, randtrackid: randtrackid, shuftext: shuffletext, totw: totw, theusername: theusername });

        }catch(err){
          console.log(err);
          res.render('error');
        }
  }

  homeResponse();

});


//GET REQUEST - FAQ PAGE
app.get('/faq', (req, res) => {
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  res.render('faq',{ title:'Riddim Archive FAQ', theusername: theusername  });

});


//GET REQUEST - LOGIN PAGE
app.get('/login', (req, res) => {
  
  var test = req.flash('error');
  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: test });
  }else{
    //store user returned by passport (req.user)
    var thelevel = req.user.access_level;
    var theusername = req.user.username;

    //redirect by permission level
    switch(thelevel) {
      case 3:
        res.render('admdash',{ theusername: theusername });
        break;
      case 2:
        res.render('moddash',{ theusername: theusername });
        break;
      case 1:
        res.render('userdash',{ theusername: theusername });
        break;
    }//end switch
  }//end else

});


//GET REQUEST - USER DASHBOARD
app.get('/dashboard', (req, res) => {
  
  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
  //store user returned by passport (req.user)
    var thelevel = req.user.access_level;
    var theusername = req.user.username;

    //redirect by permission level
    switch(thelevel) {
      case 3:
        res.render('admdash',{ theusername: theusername });
        break;
      case 2:
        res.render('moddash',{ theusername: theusername });
        break;
      case 1:
        res.render('userdash',{ theusername: theusername });
        break;
    }//end switch
  }//end else

});


//GET REQUEST - CREATE ACCOUNT PAGE
app.get('/create', (req, res, next) => {
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  res.render('create',{ title:'Create Account', msg: "", theusername: theusername });

});


//GET REQUEST - CHANGE PASSWORD PAGE
app.get('/changepass', (req, res, next) => {

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
    var theusername = req.user.username;

    res.render('changepass',{ title:'Change Password', msg: "", theusername: theusername });
  }

});


//GET REQUEST - TRACK CRUD PAGE
app.get('/trackcrud', (req, res) => {

  if(req.user === undefined){
    console.log("User does not Exist");
    res.redirect('/login');
  }else{
    
      var theusername = "";
      theusername = req.user.username;
      if(req.user.access_level > 1){   
        res.render('trackcrud', { msg: "", msg2: "", theusername: theusername });
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

      var theusername = req.user.username;
      if(req.user.access_level > 1){
    
        res.render('usercrud',{ theusername: theusername });
    
      }else{
        console.log("User does not have Access");
        res.redirect('/login');
      }//end inner else
  }//end main else

});


//GET REQUEST - FAVORITES PAGE
app.get('/favorites', (req, res) => {

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });

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
          
          res.render('favorites',{ thetracks: tracks, currentuserid: user_id, theusername: theusername, msg:msg });
        }else{

          for (var i = 0; i < result.length; i++) {
            var row = { 'track_name': result[i].track_name, 'artist_name': result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
            tracks.push(row);
          }

          for (var i = 0; i < tracks.length; i++) {
            if(tracks[i].is_remix != 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}`;
            }
            if(tracks[i].is_collab == 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
            }
            if(tracks[i].is_collab != 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}`;
            }
            if(tracks[i].is_remix == 1){
              tracks[i].blank = ``;
            }
          }

          await conquerie.end(db);
          tracks.sort((a, b) => (a.track_name > b.track_name) ? 1 : -1);

          res.render('favorites',{ thetracks: tracks, currentuserid: user_id, theusername: theusername, msg: msg });
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
      var theusername = req.user.username;
      if(req.user.access_level > 1){
    
        res.render('artcrud',{ msg: "", msg2: "", theusername: theusername });
    
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

  var art_name = req.params.name;
  var user_id = "";
  var theusername = "";

  if(req.user !== undefined){
    user_id = req.user.id;
    theusername = req.user.username;
  }

  
  //make queries, get all artist/track info and render artist page
  async function artistPageResponse(aname){
      try{

          var name = aname;
          var tracks = [];
          var info = "";
          var fb = 'none';
          var sc = 'none';
          var bc = 'none';
          var beat = 'none';
          var insta = 'none';

          var msg = "";

          var db = createConnection();
          await conquerie.connect(db);

          let result = await artquerie.getArtistInfo(db, name);
          info = `${result[0].info}`;
          if(result[0].fb.length > 1){
            fb = `https://www.facebook.com/${result[0].fb}`;
          }
          if(result[0].sc.length > 1){
            sc = `https://soundcloud.com/${result[0].sc}`;
          }
          if(result[0].bc.length > 1){
            bc = result[0].bc;
          }
          if(result[0].beat.length > 1){
            beat = `https://www.beatport.com/${result[0].beat}`;
          }
          if(result[0].insta.length > 1){
            insta = `https://www.instagram.com/${result[0].insta}`;
          }

          let tresult = await trackquerie.getAllTracksFromArtist(db, name);
          for (var i = 0; i < tresult.length; i++) {
            var row = { 'track_name':tresult[i].track_name, 'artist_name':tresult[i].artist_name, 'drive_url': tresult[i].drive_url, 'crew': tresult[i].crew, 'country': tresult[i].country, 'artist_id': tresult[i].artist_id, 'id': tresult[i].id, 'collab_artist': tresult[i].collab_artist, 'original_artist': tresult[i].original_artist, 'is_remix': tresult[i].is_remix, 'is_collab': tresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }

          let collabresult = await trackquerie.getCollabsIncludingArtist(db, name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

          let remixresult = await trackquerie.getTracksThatOthersRemixed(db, name);
          if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

          for (var i = 0; i < tracks.length; i++) {

            let thehearts = await trackquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
            }

            if(tracks[i].is_remix != 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}`;
            }
            if(tracks[i].is_collab == 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
            }
            if(tracks[i].is_collab != 1){
              tracks[i].blank = ``;
            }
            if(tracks[i].is_remix == 1){
              tracks[i].blank = ``;
            }
          }
          
          

          await conquerie.end(db);
          tracks.sort((a, b) => (a.track_name > b.track_name) ? 1 : -1);

          res.render('artist',{ artist_name: name, info: info, fb: fb, sc: sc, bc: bc, beat: beat, insta: insta, tracks: tracks, currentuserid: user_id, theusername: theusername, msg: msg });

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  artistPageResponse(art_name);

});


//GET REQUEST - REQUEST HANDLER
app.get('/req/:page', function(req,res){

  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  //store page from url
  var pagey = req.params.page;

  switch(pagey) {
      case "submission":
        res.render('submission',{ msg: "", theusername: theusername });
        break;
      case "tracksubmission":
        res.render('tracksubmission',{ msg: "", theusername: theusername });
        break;
      case "tunereport":
        res.render('tunereport',{ msg: "", theusername: theusername });
        break;
      case "removal":
        res.render('removal',{ msg: "", theusername: theusername });
        break;
      case "question":
        res.render('question',{ msg: "", theusername: theusername });
        break;
      default:
        res.render('faq',{ title:'Riddim Archive FAQ', theusername: theusername });
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
        var theusername = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        
        if(req.user !== undefined){
          user_id = req.user.id;
          theusername = req.user.username;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_remix != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_collab == 1){
            totw[i].blank = ` - ${totw[i].artist_name}${totw[i].collab_artist}`
          }
          if(totw[i].is_collab != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_remix == 1){
            totw[i].blank = ``;
          }
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;
        var shuffletext = `${randartistname} - ${randtrackname}`;

        if(randresult[0].is_collab == 1){
          shuffletext = `${randartistname}${randresult[0].collab_artist} - ${randtrackname}`
        }
        if(randresult[0].is_remix == 1){
          shuffletext = `${randresult[0].original_artist}${randtrackname}`;
        }

        await conquerie.end(db);

        res.render('homepage',{ title:'Riddim Archive Index', msg: "Please login to save Favorites!", artists: artists, currentuserid: user_id, randdriveurl: randdriveurl, randartistname: randartistname, randtrackname: randtrackname, randtrackid: randtrackid, shuftext: shuffletext, totw: totw, theusername: theusername });

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
        var theusername = "";
        var randdriveurl = "";
        var randartistname = "";
        var randtrackname = "";
        
        if(req.user !== undefined){
          user_id = req.user.id;
          theusername = req.user.username;
        }

        var db = createConnection();
        await conquerie.connect(db);

        let result = await trackquerie.getTracksOfTheWeek(db);

        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_remix != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_collab == 1){
            totw[i].blank = ` - ${totw[i].artist_name}${totw[i].collab_artist}`
          }
          if(totw[i].is_collab != 1){
            totw[i].blank = ` - ${totw[i].artist_name}`;
          }
          if(totw[i].is_remix == 1){
            totw[i].blank = ``;
          }
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name }
          artists.push(row);
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;
        var shuffletext = `${randartistname} - ${randtrackname}`;

        if(randresult[0].is_collab == 1){
          shuffletext = `${randartistname}${randresult[0].collab_artist} - ${randtrackname}`
        }
        if(randresult[0].is_remix == 1){
          shuffletext = `${randresult[0].original_artist}${randtrackname}`;
        }

        
        //confirm favorite isn't already there
        let ckresult = await userquerie.checkUserFavorite(db, user_id, track_id);
        if(ckresult.length > 0){
          msg = `${favetrack_name} is already added!`;        
          await conquerie.end(db);

          res.render('homepage',{ title:'Riddim Archive Index', msg: `${favetrack_name} is already added!`, artists: artists, currentuserid: user_id, randdriveurl: randdriveurl, randartistname: randartistname, randtrackname: randtrackname, randtrackid: randtrackid, shuftext: shuffletext, totw: totw, theusername: theusername });
        }else{

          //store into favorites here, need user ID and track ID
          console.log("ADDING TO FAVORTIES");
          let ufresult = await userquerie.addUserFavorite(db, user_id, track_id);
          await conquerie.end(db);
        }

        res.render('homepage',{ title:'Riddim Archive Index', msg: `${favetrack_name} Added to Favorites!`, artists: artists, currentuserid: user_id, randdriveurl: randdriveurl, randartistname: randartistname, randtrackname: randtrackname, randtrackid: randtrackid, shuftext: shuffletext, totw: totw, theusername: theusername });

        }catch(err){
          console.log(err);
          res.render('error');
        }
  }

  homeResponse();


  
  }


});

//POST REQUEST - Homepagefave
//save fave on homepage
app.post('/homepagefave', (req, res, next) => {
  var { user_id, track_id, favetrack_name, name, index} = req.body;

  if(user_id === "" || req.user.id === undefined){
    var msg = "Please login to save Favorites!";
    res.send({msg: msg, index: index});

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

                res.send({msg: msg, index: index});
                //below means user is present and this is a new favorite
            }else{
            
                //store into favorites here, need user ID and track ID
                let ufresult = await userquerie.addUserFavorite(db, user_id, track_id);
                await conquerie.end(db);
                res.send({msg: msg, index: index});
            }
        }catch(err){
          console.log(err);
          res.render('error');
        }

      }
    favoritesAddResponse();
  }

});



//POST REQUEST - LOGIN FORM
//check for field entry, authenticate and redirect with passport
app.post('/login', (req, res, next) => {

  var { username, password } = req.body;

  if(!username || !password){
    res.render('login', { theusername: username, er: "", message: 'Fill in all Fields!' });
  }else{
    passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash : true })(req, res, next);
  }
});


//POST REQUEST - CREATE ACCOUNT FORM
//check for field entry, add to database
app.post('/create', (req, res, next) => {

  var { username, password, password2 } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  
  if(!username || !password || !password2){
    res.render('create',{ title:'Create Account', msg: "Fill in all Fields!" , theusername: theusername});
  }else{
    if(password !== password2){
      res.render('create',{ title:'Create Account', msg: "Passwords Don't Match, Please Re-Enter", theusername: theusername });
    }else{
      //perform hash and add query
      async function createPageResponse(username, password, theusername){
        try{
          var db = createConnection();
          var hashpass = "";
          await conquerie.connect(db);

          let uresult = await userquerie.getUserInfo(db, username);
          if(uresult.length > 0){
            res.render('create',{ title:'Create Account', msg: "Username Taken! Please Try a Different Name", theusername: theusername });
          }else{
              hashpass = await has.hashPass(password);
              let result = await userquerie.createAccount(db, username, hashpass);

              await conquerie.end(db);
              res.render('create',{ title:'Create Account', msg: "Account Created! Feel Free to Login at the link above!", theusername: theusername });
          }//end else
        }catch(err){
          console.log(err);
          res.render('error');
        }
    }//end async

    createPageResponse(username, password, theusername);

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
    res.render('changepass',{ title:'Change Password', msg: "Fill in all Fields!", theusername: theusername });
  }else{
    if(newpass !== newpass2){
      res.render('changepass',{ title:'Change Password', msg: "Passwords Don't Match, Please Re-Enter", theusername: theusername });
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
          res.render('changepass',{ title:'Change Password', msg: "Password changed, please log in next time with new password", theusername: theusername });
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
      var shuffletext = `${theartistname} - ${thetrackname}`;

      if(result[0].is_collab == 1){
        shuffletext = `${theartistname}${result[0].collab_artist} - ${thetrackname}`
      }
      if(result[0].is_remix == 1){
        shuffletext = `${result[0].original_artist}${thetrackname}`;
      }

      await conquerie.end(db);
      res.send({source: thedriveurl, id: theid, artist_name: theartistname, track_name: thetrackname, shuftext: shuffletext});
    
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

  var { track_name, artist_name, drive_url, tune_of_week, is_collab, collab1, collab2, collab3, collab4, is_remix, og1, og2 } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  
  if(!track_name || !artist_name || !drive_url){
      res.render('trackcrud', { msg: "Need Artist Name, Track Name, and URL!", msg2: "", theusername: theusername });
    }else{
      //make queries, get all artist/track info and render artist page
      async function storeFormResults(track_name, artist_name, drive_url, theusername){
          try{
            var collab_artist = "";
            var original_artist = "";
            if(is_collab == 1){
                if(collab1 != "" && collab2 != "" && collab3 != "" && collab4 != ""){
                  collab_artist = `, ${collab1}, ${collab2}, ${collab3}, & ${collab4}`;
                }
                if(collab1 != "" && collab2 != "" && collab3 != "" && collab4 == ""){
                  collab_artist = `, ${collab1}, ${collab2}, & ${collab3}`;
                }
                if(collab1 != "" && collab2 != "" && collab3 == "" && collab4 == ""){
                  collab_artist = `, ${collab1}, & ${collab2}`;
                }
                if(collab1 != "" && collab2 == "" && collab3 == "" && collab4 == ""){
                  collab_artist = ` & ${collab1}`;
                }
            }

            if(is_remix == 1){
              if(og1 != "" && og2 != ""){
                original_artist = `${og1} & ${og2} - `;
              }
              if(og1 != "" && og2 == ""){
                original_artist = `${og1} - `;
              }
            }

            var db = createConnection();
            var artist_id;

            await conquerie.connect(db);
            let result = await artquerie.getArtistInfo(db, artist_name);

            //store artist query result
            artist_id = result[0].id;
            let tresult = await trackquerie.addTrack(db, artist_id, artist_name, track_name, collab_artist, original_artist, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, tune_of_week);

            await conquerie.end(db);

            res.render('trackcrud', { msg: "Track Created!", msg2: "", theusername: theusername });

          }catch(err){
            console.log(err);
            res.render('error');
          }
      }//end async

      storeFormResults(track_name, artist_name, drive_url, theusername);
    }//end else
  
});


//POST REQUEST - Track Delete
//Make query, delete track with that name
app.post('/trackdelete', (req, res, next) => {

  var { track_name } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  if(!track_name){
            res.render('trackcrud', { msg: "", msg2: "Enter Track Name!", theusername: theusername });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyTrack(track_name, theusername){
                try{
                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await trackquerie.getTrackInfo(db, track_name);
                    console.log(result.length);

                    if(result.length == 0){
                        console.log("cant find track");
                        res.render('trackcrud', { msg: "", msg2: "Track Not Found", theusername: theusername });
                    }else{

                        let tresult = await trackquerie.deleteTrack(db, track_name);
                        console.log("Track Found");
                        res.render('trackcrud', { msg: "", msg2: "Track Deleted!", theusername: theusername });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyTrack(track_name, theusername);

    }

});


//POST REQUEST - User Create
//check for field entry, authenticate and redirect with passport
app.post('/usercreate', (req, res, next) => {

  var { username, password, access_level } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  if(!username || !password || !access_level){
            res.render('usercrud', { msg: "Fill in all Fields!", msg2: "", theusername: theusername });
    }else{

      async function addyUser(username, password, access_level, theusername){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await userquerie.getUserInfo(db, username);

                    if(result.length > 0){
                        console.log("USER ALREADY EXISTY");
                        res.render('usercrud', { msg: "USER ALREADY EXISTY", msg2: "", theusername: theusername });
                    }else{
                        let hashedpass = await has.hashPass(password);
                        let tresult = await userquerie.addUser(db, username, hashedpass, access_level);

                        res.render('usercrud', { msg: "USER Added!", msg2: "", theusername: theusername });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            addyUser(username, password, access_level, theusername);

    }//end else

});


//POST REQUEST - User Delete
//Make query, User track with that name
app.post('/userdelete', (req, res, next) => {

  var { username } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  if(!username){
            res.render('usercrud', { msg: "", msg2: "Enter User Name!", theusername: theusername });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyUser(username, theusername){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await userquerie.getUserInfo(db, username);

                    if(result.length == 0){
                        console.log("cant find user");
                        res.render('usercrud', { msg: "", msg2: "User Not Found", theusername: theusername });
                    }else{

                        let tresult = await userquerie.deleteUser(db, username);
                        console.log("User Found");
                        res.render('usercrud', { msg: "", msg2: "User Deleted!", theusername: theusername });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyUser(username, theusername);

    }

});


//POST REQUEST - Artist Create
//check for field entry, make query to add artist
app.post('/artistcreate', (req, res, next) => {

  var { artist_name, crew, country, info, face, sound, band, beat, insta } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  if(!artist_name){
            res.render('artcrud', { msg: "Fill in Artist Name", msg2: "", theusername: theusername });
    }else{
            if(!crew){ crew = ""; }
            if(!country){ country = ""; }
            if(!info){ info = ""; }

            async function addyArtist(artist_name, crew, country, info, theusername){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await artquerie.getArtistInfo(db, artist_name);

                    if(result.length > 0){
                        res.render('artcrud', { msg: "Artist ALREADY EXISTY", msg2: "", theusername: theusername });
                    }else{

                        let tresult = await artquerie.addArtist(db, artist_name, crew, country, info, face, sound, band, beat, insta);
                        res.render('artcrud', { msg: "Artist Added!", msg2: "", theusername: theusername });

                    }

                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            addyArtist(artist_name, crew, country, info, theusername);

    }

});


//POST REQUEST - Artist Delete
app.post('/artistdelete', (req, res, next) => {

  var { artist_name } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  if(!artist_name){
            res.render('artcrud', { msg: "", msg2: "Enter Artist Name!", theusername: theusername });
  }else{
      //make queries, get all artist/track info and render artist page
            async function deletyArtist(artist_name, theusername){
                try{

                    var db = createConnection();

                    await conquerie.connect(db);
                    let result = await artquerie.getArtistInfo(db, artist_name);

                    if(result.length == 0){
                        console.log("cant find artist");
                        res.render('artcrud', { msg: "", msg2: "Artist Not Found", theusername: theusername });
                    }else{

                        let tresult = await artquerie.deleteArtist(db, artist_name);
                        console.log("Artist Found");
                        res.render('artcrud', { msg: "", msg2: "Artist Deleted!", theusername: theusername });

                    }
                    await conquerie.end(db);

                }catch(err){
                  console.log(err);
                  res.render('error');
                }

            }

            deletyArtist(artist_name, theusername);

    }

});


//POST REQUEST - Artist Search
app.post('/search', (req, res, next) => {

  var { search_results, search_style } = req.body;
  var msg = "";
  var reloadlist = 0;
  if(!search_results){
  msg = "No Search Entered";
  res.send({msg: msg, reloadlist: reloadlist, artists: ""});
  
  }else{
    search_results = search_results + "%";
    async function searchArtist(search_results, search_style){
        try{
            var artists = [];
            var totw = [];
            var db = createConnection();
            var user_id = "";
        
            if(req.user !== undefined){
              user_id = req.user.id;
            }

            await conquerie.connect(db);

            if(search_style == 0){
              let result = await artquerie.searchArtists(db, search_results);

              if(result.length == 0){
                await conquerie.end(db);
                msg = "No Items Found!!!";
                res.send({msg: msg, reloadlist: reloadlist, artists: ""});
              }else{

                  for (var i = 0; i < result.length; i++) {
                    var row = { 'artist_name': result[i].artist_name }
                    artists.push(row);
                  }
                  await conquerie.end(db);
                  msg = "Results Found:";
                  reloadlist = 1;
                  res.send({msg: msg, reloadlist: reloadlist, artists: artists});
              }//end else

            }//end if, search style is 1, do crew search
            else{

              let cresult = await artquerie.searchArtistsByCrew(db, search_results);
              
              if(cresult.length == 0){
                await conquerie.end(db);
                msg = "No Items Found!!!";
                res.send({msg: msg, reloadlist: reloadlist, artists: ""});
              }else{

                  for (var i = 0; i < cresult.length; i++) {
                    var row = { 'artist_name': cresult[i].artist_name }
                    artists.push(row);
                  }//end for

                  //end query and render
                  await conquerie.end(db);
                  msg = "Results Found:";
                  reloadlist = 1;
                  res.send({msg: msg, reloadlist: reloadlist, artists: artists});
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

//POST REQUEST - Homepage change
app.post('/page', (req, res, next) => {
  var { pagey } = req.body;
  if (pagey == 6){
    res.send({donothing: 1, artists: ""});
  }else{

    async function pageChange(pagey){
      try{
        var artists = [];
        var db = createConnection();
        await conquerie.connect(db);
      if(pagey == 0){
        let result = await artquerie.getAllArtistsAthroughD(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name }
          artists.push(row);
        }//end for
      }
      if(pagey == 1){
        let result = await artquerie.getAllArtistsEthroughI(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name }
          artists.push(row);
        }//end for
      }
      if(pagey == 2){
        let result = await artquerie.getAllArtistsJthroughO(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name }
          artists.push(row);
        }//end for
      }
      if(pagey == 3){
        let result = await artquerie.getAllArtistsPthroughT(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name }
          artists.push(row);
        }//end for
      }
      if(pagey == 4){
        let result = await artquerie.getAllArtistsUthroughZ(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name }
          artists.push(row);
        }//end for
      }

      await conquerie.end(db);
      res.send({donothing: 0, artists: artists});

      }catch(err){
        console.log(err);
        res.render('error');
      }
    }//end async
  pageChange(pagey);
  }

});

//POST REQUEST - artist page track change
app.post('/pagetracks', (req, res, next) => {
  var { pagey, artist_name } = req.body;
  var user_id = "";

  if(req.user !== undefined){
    user_id = req.user.id;
  }

  if (pagey == 6){
    res.send({donothing: 1, tracks: "", currentuserid: user_id});
  }else{

    async function pageChange(pagey, artist_name){
      try{
        var tracks = [];
        var db = createConnection();
        await conquerie.connect(db);
      if(pagey == 0){
        let result = await trackquerie.getAllTracksAthroughD(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistAthroughD(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedAthroughD(db, artist_name);
          if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey0
      if(pagey == 1){
        let result = await trackquerie.getAllTracksEthroughI(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistEthroughI(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedEthroughI(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey1
      if(pagey == 2){
        let result = await trackquerie.getAllTracksJthroughO(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistJthroughO(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedJthroughO(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey2
      if(pagey == 3){
        let result = await trackquerie.getAllTracksPthroughT(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistPthroughT(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        let remixresult = await trackquerie.getTracksThatOthersRemixedPthroughT(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey3
      if(pagey == 4){
        let result = await trackquerie.getAllTracksUthroughZ(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'collab_artist': result[i].collab_artist, 'original_artist': result[i].original_artist, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistUthroughZ(db, artist_name);
        if(collabresult.length > 0){
          for (var i = 0; i < collabresult.length; i++) {
            var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'collab_artist': collabresult[i].collab_artist, 'original_artist': collabresult[i].original_artist, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }
        }

        let remixresult = await trackquerie.getTracksThatOthersRemixedUthroughZ(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'collab_artist': remixresult[i].collab_artist, 'original_artist': remixresult[i].original_artist, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
        }

      }//pagey4

      for (var i = 0; i < tracks.length; i++) {

        let thehearts = await trackquerie.getAllHeartsOnTrack(db, tracks[i].id);
        if(thehearts.length > 0){
          tracks[i].hearts = thehearts;
          const isincluded = (element) => element.user_id == user_id;
          var test = -1;
          test = thehearts.findIndex(isincluded);
          if (test != -1){
            tracks[i].userhearted = 1;
          }
        }

        if(tracks[i].is_remix != 1){
          tracks[i].blank = ` - ${tracks[i].artist_name}`;
        }
        if(tracks[i].is_collab == 1){
          tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
        }
        if(tracks[i].is_collab != 1){
          tracks[i].blank = ``;
        }
        if(tracks[i].is_remix == 1){
          tracks[i].blank = ``;
        }
      }

      await conquerie.end(db);
      tracks.sort((a, b) => (a.track_name > b.track_name) ? 1 : -1);

      res.send({donothing: 0, tracks: tracks, currentuserid: user_id});

      }catch(err){
        console.log(err);
        res.render('error');
      }
    }//end async
  pageChange(pagey, artist_name);
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
          let collabsresult = await trackquerie.searchTunesCollabRemix(db, search_results, a_name);

          if(sresult.length == 0 && collabsresult.length == 0){
            await conquerie.end(db);
            msg = "No items found";
            
            res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, artist_name: a_name, tracks: tracks});

          }else{
          //there was a result, loading that instead
          for (var i = 0; i < sresult.length; i++) {
           var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'collab_artist': sresult[i].collab_artist, 'original_artist': sresult[i].original_artist, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "", 'hearts': "", 'userhearted': "0" }
           tracks.push(row);
          }

          if(collabsresult.length > 0){
            for (var i = 0; i < collabsresult.length; i++) {
              var row = { 'track_name':collabsresult[i].track_name, 'artist_name':collabsresult[i].artist_name, 'drive_url': collabsresult[i].drive_url, 'id': collabsresult[i].id, 'collab_artist': collabsresult[i].collab_artist, 'original_artist': collabsresult[i].original_artist, 'is_remix': collabsresult[i].is_remix, 'is_collab': collabsresult[i].is_collab, 'blank': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
             }
          }

          for (var i = 0; i < tracks.length; i++) {

            let thehearts = await trackquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
            }

            if(tracks[i].is_remix != 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}`;
            }
            if(tracks[i].is_collab == 1){
              tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
            }
            if(tracks[i].is_collab != 1){
              tracks[i].blank = ``;
            }
            if(tracks[i].is_remix == 1){
              tracks[i].blank = ``;
            }
          }

          await conquerie.end(db);
          msg = "Results Found!:";
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

                for (var i = 0; i < sresult.length; i++) {
                 var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'collab_artist': sresult[i].collab_artist, 'original_artist': sresult[i].original_artist, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "" }
                 tracks.push(row);
                }

                for (var i = 0; i < tracks.length; i++) {
                  if(tracks[i].is_remix != 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}`;
                  }
                  if(tracks[i].is_collab == 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
                  }
                  if(tracks[i].is_collab != 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}`;
                  }
                  if(tracks[i].is_remix == 1){
                    tracks[i].blank = ``;
                  }
              }

                await conquerie.end(db);
                tracks.sort((a, b) => (a.track_name > b.track_name) ? 1 : -1);
                msg = "Results Found!:";
                reloadlist = 1;
          
                res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});
              }//end result length else

          }else{
              let sresult = await trackquerie.searchFavoritesByArtist(db, user_id, search_results);
              let collabsresult = await trackquerie.searchFavoritesByArtistCollabRemix(db, user_id, search_results);

              if(sresult.length == 0 && collabsresult.length == 0){
                  await conquerie.end(db);
                  msg = "No items found";

                  res.send({msg: msg, reloadlist: reloadlist, currentuserid: user_id, tracks: tracks});

              }else{
                
                for (var i = 0; i < sresult.length; i++) {
                 var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'collab_artist': sresult[i].collab_artist, 'original_artist': sresult[i].original_artist, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "" }
                 tracks.push(row);
                }

                if(collabsresult.length > 0){
                  for (var i = 0; i < collabsresult.length; i++) {
                    var row = { 'track_name':collabsresult[i].track_name, 'artist_name':collabsresult[i].artist_name, 'drive_url': collabsresult[i].drive_url, 'id': collabsresult[i].id, 'collab_artist': collabsresult[i].collab_artist, 'original_artist': collabsresult[i].original_artist, 'is_remix': collabsresult[i].is_remix, 'is_collab': collabsresult[i].is_collab, 'blank': "" }
                    tracks.push(row);
                   }
                }

                for (var i = 0; i < tracks.length; i++) {
                  if(tracks[i].is_remix != 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}`;
                  }
                  if(tracks[i].is_collab == 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}${tracks[i].collab_artist}`
                  }
                  if(tracks[i].is_collab != 1){
                    tracks[i].blank = ` - ${tracks[i].artist_name}`;
                  }
                  if(tracks[i].is_remix == 1){
                    tracks[i].blank = ``;
                  }
              }

                await conquerie.end(db);
                msg = "Results Found!:";
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
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  //required: name, link, and image
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No image was uploaded.');
    res.render('submission',{ msg: "Please include Image!", msg2: "", theusername: theusername });
  }else{
      if (!artist_name || !link){
        res.render('submission',{ msg: "Please include Artist Name and Download Link!", msg2: "", theusername: theusername });
      }else{
            let artist_img = req.files.img;
            
            async function makeEmail(artist_name, crew, country, info, link, artist_img){
                try{
                  await emailer.storeArtistImage(artist_img, artist_name);
                  await emailer.emailArtistForm(artist_name, crew, country, info, link, artist_img);
                  res.render('submission',{ msg: "Form Submitted! Admins will begin adding your page!", msg2: "", theusername: theusername });
                    
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
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  var reason = "Artist/Track Removal Request";

  if (!info){
    res.render('removal',{ msg: "Please include what you would like removed!", theusername: theusername });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('removal',{ msg: "Form Submitted! We will remove the track/artist page ASAP!", theusername: theusername });
                
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
  var { user_id, track_id, favetrack_name, name, index} = req.body;

  if(user_id === "" || req.user.id === undefined){
            var msg = "Please login to save Favorites!";
            res.send({msg: msg, index: index});

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
              
                res.send({msg: msg, index: index});
                //below means user is present and this is a new favorite
            }else{

                //store into favorites here, need user ID and track ID
                let ufresult = await userquerie.addUserFavorite(db, user_id, track_id);
                await conquerie.end(db);
                res.send({msg: msg, index: index});
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

  var { track_id, favetrack_name, user_id, name, index } = req.body;
  var theusername = req.user.username;

  async function favoritesRemoveResponse(user_id, track_id, favetrack_name, theusername){
    try{

        var msg = `${favetrack_name} Removed from Favorites!`;
        var db = createConnection();
        await conquerie.connect(db);
        let ufresult = await userquerie.deleteUserFavorite(db, user_id, track_id);
        await conquerie.end(db);
        res.send({msg: msg, index: index});

      }catch(err){
        console.log(err);
        res.render('error');
      }

    }
    favoritesRemoveResponse(user_id, track_id, favetrack_name, theusername);
});

//POST REQUEST - COMMENTS - gets comments for a track
app.post('/comments', (req, res, next) => {

  var { ind, track_name } = req.body;

  async function commentsResponse(ind, track_name){
    try{
        var comments = [];
        var nocomments = 0;
        var msg = "";
        var db = createConnection();
        await conquerie.connect(db);

        let commresult = await commquerie.getAllCommentsByTrackName(db, track_name);
          if(commresult.length > 0){
            for (var i = 0; i < commresult.length; i++) {
              var thefullstring = commresult[i].time.toString();
              var str = thefullstring.split(" ");
              commresult[i].time = `${str[1]}/${str[2]}/${str[3]} - ${str[4]}`;

              var row = { 'track_id': commresult[i].track_id, 'user_id': commresult[i].user_id, 'comment': commresult[i].comment, 'username': commresult[i].username, 'time': commresult[i].time }
              comments.push(row);
            }
          }else{
            nocomments = 1;
            msg = "No Comments on this Tune!"
          }

        await conquerie.end(db);

        res.send({index: ind, msg: msg, track_name: track_name, comments: comments, nocomments: nocomments});

      }catch(err){
        console.log(err);
        res.render('error');
      }

    }
    commentsResponse(ind, track_name);
});


//POST REQUEST - Tune Broken Report
app.post('/req/tunereport', (req, res, next) => {
  
  var { info } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  var reason = "Tune Is Broken/Missing Alert";

  if (!info){
    res.render('tunereport',{ msg: "Please include the tune that is missing!", theusername: theusername });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('tunereport',{ msg: "Form Submitted! We will fix/reupload the broken tune!", theusername: theusername });
                
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
  
  var { link } = req.body;
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  var reason = "Track Submission (Non Artist)";
  var info = "";

  if (!link){
    res.render('tracksubmission',{ msg: "Please include link!", theusername: theusername });
  }else{
        info = `
        
        Link: ${link}`;

        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('tracksubmission',{ msg: "Form Submitted! We will add tunes to Riddim Archive if approved!", theusername: theusername });
                
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
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }

  var reason = "Question/Comment";

  if (!info){
    res.render('question',{ msg: "Please include your question/comment!", theusername: theusername });
  }else{
        async function makeEmail(reason, info){
            try{
              await emailer.standardEmail(reason, info);
              res.render('question',{ msg: "Form Submitted! We will reply as soon as we can!", theusername: theusername });
                
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }
        makeEmail(reason, info);
    }
          
});

//Server Request Handler
app.listen(port, () => { console.log(`Server running at: http://localhost:${port}/`); });

//export app
module.export = app;
