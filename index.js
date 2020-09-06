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
const mysql = require('mysql');
flash = require('connect-flash');
const { fork } = require('child_process');
const request = require('request');
const ZipStream = require('zip-stream');

//file reqs: database connect, query functions, hash functions
const createConnection = require('./js/dbconnect');
const conquerie = require('./js/conquery');
const commquerie = require('./js/comquery');
const artquerie = require('./js/artquery');
const trackquerie = require('./js/trackquery');
const userquerie = require('./js/userquery');
const heartquerie = require('./js/heartquery');
const secretquerie = require('./js/secretquery');
const followquerie = require('./js/followquery');
const has = require('./js/hash');
const emailer = require('./js/email');
const s3fcn = require('./js/s3fcn');
const { fstat, fstatSync } = require('fs');
const fs2 = require('fs');

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
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
//express-session
app.use(session({
  secret: 'secret fish',
  resave: true,
  cookie: {sameSite: 'strict'},
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
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtistsAthroughD(db);

        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name, 'img_url': tresult[i].img_url }
          artists.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_collab == 0 && totw[i].is_remix == 0){
            totw[i].blank = `${totw[i].artist_name} - `;
          }
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;

        var shuffletext = `${randtrackname}`;
        if(randresult[0].is_collab == 0 && randresult[0].is_remix == 0){
          shuffletext = `${randartistname} - ${randtrackname}`;
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

    async function getArtistVerify(thelevel, theusername){
      try{
        var db = createConnection();
        await conquerie.connect(db);
        var art_name = "";
        var art_id = "";

        let result = await userquerie.verifyArtistbyUsername(db, theusername);
        if(result.length > 0){
          art_id = result[0].artist_id_verify;
          let artresult = await artquerie.getArtistNameByID(db, art_id);
          art_name = artresult[0].artist_name;
        }
        await conquerie.end(db);
        //redirect by permission level
        switch(thelevel) {
        case 3:
          res.render('admdash',{ theusername: theusername });
          break;
        case 2:
          res.render('moddash',{ theusername: theusername });
          break;
        case 1:
          res.render('userdash',{ theusername: theusername, art_id, art_name });
          break;
        }//end switch
      }catch(err){
      console.log(err);
      res.render('error');
      }

    }
    getArtistVerify(thelevel, theusername);

  }//end else

});


//GET REQUEST - CREATE ACCOUNT PAGE
app.get('/create', (req, res, next) => {
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  res.render('create',{ title:'Create User Account', msg: "", theusername: theusername });

});

//GET REQUEST - CREATE ARTIST ACCOUNT PAGE
app.get('/artselfcreate', (req, res, next) => {
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  res.render('artcreate',{ title:'Create Artist Account', msg: "", theusername: theusername });

});

//GET REQUEST - CREATE ACCOUNT PAGE
app.get('/selectacct', (req, res, next) => {
  var theusername = "";
  if(req.user !== undefined){
    theusername = req.user.username;
  }
  res.render('selectacct',{ title:'Create User Account', msg: "", theusername: theusername });

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

//GET REQUEST - LOGIN PAGE
app.get('/follow', (req, res) => {
  
  var test = "Please Login to Access Follow Stream!"
  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: test });
  }else{
    var theusername = req.user.username;
    async function followResponse(theusername){
      try{

        var user_id = "";
        var tracks = [];
        
        var db = createConnection();
        await conquerie.connect(db);

        let uresult = await userquerie.getUserInfo(db, theusername);
        user_id = uresult[0].id;

        let fresult = await trackquerie.getRecentTracksFromFollowedArtist(db, user_id);
        if (fresult.length > 0){
          console.log("Tracks Present");
          for (var i = 0; i < fresult.length; i++) {
            var row = { 'track_name': fresult[i].track_name, 'artist_name': fresult[i].artist_name, 'drive_url': fresult[i].drive_url, 'id': fresult[i].id, 'short_name': fresult[i].short_name, 'is_remix': fresult[i].is_remix, 'is_collab': fresult[i].is_collab, 'time': fresult[i].time, 'blank': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }
        }


        let artfollow = await userquerie.getArtistsFollowed(db, user_id);
        if(artfollow.length > 0){
          for (var i = 0; i < artfollow.length; i++) {
            console.log(`checking Collabs from ${artfollow[i].artist_name}`);
            let cresult = await trackquerie.getRecentCollabsFromFollowedArtist(db, artfollow[i].artist_name);
            if (cresult.length > 0){
              console.log(`collabs for ${artfollow[i].artist_name} FOUND`);
              for (var j = 0; j < cresult.length; j++) {
                var row = { 'track_name': cresult[j].track_name, 'artist_name': cresult[j].artist_name, 'drive_url': cresult[j].drive_url, 'id': cresult[j].id, 'short_name': cresult[j].short_name, 'is_remix': cresult[j].is_remix, 'is_collab': cresult[j].is_collab, 'time': cresult[j].time, 'blank': "", 'hearts': "", 'userhearted': "0" }
                tracks.push(row);
              }
            }

            console.log(`checking Remixes from ${artfollow[i].artist_name}`);
            let rresult = await trackquerie.getRecentRemixesFromFollowedArtist(db, artfollow[i].artist_name);
            if (rresult.length > 0){
              console.log(`remixes for ${artfollow[i].artist_name} FOUND`);
              for (var k = 0; k < rresult.length; k++) {
                var row = { 'track_name': rresult[k].track_name, 'artist_name': rresult[k].artist_name, 'drive_url': rresult[k].drive_url, 'id': rresult[k].id, 'short_name': rresult[k].short_name, 'is_remix': rresult[k].is_remix, 'is_collab': rresult[k].is_collab, 'time': rresult[k].time, 'blank': "", 'hearts': "", 'userhearted': "0" }
                tracks.push(row);
              }
            }
          }
        }

        if (tracks.length == 0){
          console.log("No tracks found!!!");
          await conquerie.end(db);
          res.render('follow', { tracks: "", user_id: user_id, theusername: theusername, msg: "No New Tunes, Follow Some Artists to See their recent FIRE!" });
        }else{
          console.log("Tracks found!!!");
          for (var i = 0; i < tracks.length; i++) {
            let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
            }

            if(tracks[i].is_collab == 0 && tracks[i].is_remix == 0){
              tracks[i].blank = `${tracks[i].artist_name} - `;
            }
          }
          await conquerie.end(db);
          tracks.sort((a, b) => (a.time < b.time) ? 1 : -1);
          res.render('follow', { tracks: tracks, user_id: user_id, theusername: theusername, msg: `Welcome ${theusername}, Here are the new tunes from your followed artists:` });
        }
      }catch(err){
        console.log(err);
        res.render('error');
      }

    }

    followResponse(theusername);
  }//end else

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
            var row = { 'track_name': result[i].track_name, 'artist_name': result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }

          for (var i = 0; i < tracks.length; i++) {

            let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
            }

            if(tracks[i].is_collab == 0 && tracks[i].is_remix == 0){
              tracks[i].blank = `${tracks[i].artist_name} - `;
            }
          }

          await conquerie.end(db);
          tracks.sort((a, b) => (a.short_name > b.short_name) ? 1 : -1);

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
          var notracks = 0;
          var info = "";
          var fb = 'none';
          var sc = 'none';
          var bc = 'none';
          var beat = 'none';
          var insta = 'none';
          var following = 'follow0';

          var msg = "";

          var db = createConnection();
          await conquerie.connect(db);

          let result = await artquerie.getArtistInfo(db, name);
          info = `${result[0].info}`;
          var artid = `${result[0].id}`;
          var is_label = `${result[0].is_label}`;
          var img_url = `${result[0].img_url}`;
          if(result[0].fb.length > 1){
            fb = `${result[0].fb}`;
          }
          if(result[0].sc.length > 1){
            sc = `${result[0].sc}`;
          }
          if(result[0].bc.length > 1){
            bc = result[0].bc;
          }
          if(result[0].beat.length > 1){
            beat = `${result[0].beat}`;
          }
          if(result[0].insta.length > 1){
            insta = `${result[0].insta}`;
          }

          let tresult = await trackquerie.getAllTracksFromArtist(db, name);
          for (var i = 0; i < tresult.length; i++) {
            var row = { 'track_name':tresult[i].track_name, 'artist_name':tresult[i].artist_name, 'drive_url': tresult[i].drive_url, 'crew': tresult[i].crew, 'country': tresult[i].country, 'artist_id': tresult[i].artist_id, 'id': tresult[i].id, 'short_name': tresult[i].short_name, 'is_remix': tresult[i].is_remix, 'is_collab': tresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }

          let collabresult = await trackquerie.getCollabsIncludingArtist(db, name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

          let remixresult = await trackquerie.getTracksThatOthersRemixed(db, name);
          if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

          for (var i = 0; i < tracks.length; i++) {

            let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
            }
          }
          if(tracks.length == 0){
            notracks = 1;
          }
          
          if (user_id != ""){
            let follow = await followquerie.isFollowingArtist(db, user_id, name);
    
            if(follow.length > 0){
              console.log("Followingg!!!!!")
              following = "follow1";
            }
          }

          var randdriveurl = "";
          var randartistname = "";
          var randtrackname = "";
          var randtrackid = "";

          let randresult = await trackquerie.getRandomTrackByArtistName(db, name);
          if (randresult.length > 0){
            randdriveurl = randresult[0].drive_url;
            randartistname = randresult[0].artist_name;
            randtrackname = randresult[0].track_name;
            randtrackid = randresult[0].id;
          }
          
          await conquerie.end(db);
          tracks.sort((a, b) => (a.short_name > b.short_name) ? 1 : -1);

          res.render('artist',{ artist_name: name, artid: artid, randdriveurl: randdriveurl, randartistname: randartistname, randtrackname: randtrackname, randtrackid: randtrackid, shuftext: randtrackname, info: info, following: following, fb: fb, sc: sc, bc: bc, beat: beat, insta: insta, is_label: is_label, img_url: img_url, tracks: tracks, currentuserid: user_id, theusername: theusername, msg: msg, notracks: notracks });

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  artistPageResponse(art_name);

});


//APP GET - SHARE LINK RESPONSE
app.get('/share/:id', function(req,res){

  var track_id = req.params.id;
  var user_id = "";
  var theusername = "";

  if(req.user !== undefined){
    user_id = req.user.id;
    theusername = req.user.username;
  }

  //res.send(`Track id is ${track_id}, User Id is ${user_id}, Username is ${theusername}`);

  async function sharelinkResponse(track_id){
      try{
          var tracks = [];
          var msg = "";

          var db = createConnection();
          await conquerie.connect(db);
          //get the track here

          let tresult = await trackquerie.getTrackbyID(db, track_id);
          if (tresult.length > 0){
            var row = { 'track_name':tresult[0].track_name, 'artist_name':tresult[0].artist_name, 'drive_url': tresult[0].drive_url, 'artist_id': tresult[0].artist_id, 'id': tresult[0].id, 'is_remix': tresult[0].is_remix, 'is_collab': tresult[0].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);

            let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[0].id);
              if(thehearts.length > 0){
                tracks[0].hearts = thehearts;
                const isincluded = (element) => element.user_id == user_id;
                var test = -1;
                test = thehearts.findIndex(isincluded);
                if (test != -1){
                  tracks[0].userhearted = 1;
                }
              }
              for (var i = 0; i < tracks.length; i++) {
                if(tracks[i].is_collab == 0 && tracks[i].is_remix == 0){
                  tracks[i].blank = `${tracks[i].artist_name} - `;
                }
              }

              await conquerie.end(db);
              msg = "Track Found!";
              res.render('share', { artist_name: tracks[0].artist_name, tracks: tracks, currentuserid: user_id, theusername: theusername, msg: msg });

            }else{
              //no track by that id is found
              //Display not found page with link to home
              await conquerie.end(db);
              msg = "No Track Found";
              //res.render('share', { artist_name: "", tracks: "", currentuserid: user_id, theusername: theusername, msg: msg });
              //res.send(`${msg} booooo`);
              res.render('error');
            }
            
      }catch(err){
        console.log(err);
        res.render('error');
      }
  }
  sharelinkResponse(track_id);
});

//APP GET - SECRET SHARE LINK RESPONSE
app.get('/secretshare/:id', function(req,res){

  var track_id = req.params.id;
  var user_id = "";
  var theusername = "";

  if(req.user !== undefined){
    user_id = req.user.id;
    theusername = req.user.username;
  }

  res.render('secretshare', { title:'Secret Share', msg: "", theusername: theusername, track_id: track_id });

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

//GET REQUEST - GET S3 Page
app.get('/tuneup', (req, res, next) => {

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
    var theusername = req.user.username;

    async function getArtistVerify(theusername){
      try{
        var db = createConnection();
        await conquerie.connect(db);
        var art_name = "";
        var art_id = "";

        let result = await userquerie.verifyArtistbyUsername(db, theusername);
        if(result.length > 0 && result[0].artist_id_verify != 0){
          art_id = result[0].artist_id_verify;
          let artresult = await artquerie.getArtistNameByID(db, art_id);
          art_name = artresult[0].artist_name;
          await conquerie.end(db);
          res.render('tests3',{ title:'Tune Upload', msg: "", theusername: theusername , theid: art_id, theartname: art_name});
        }else{
          await conquerie.end(db);
          res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: `You do not have access to this artist's page!` });
        }
      }catch(err){
      console.log(err);
      res.render('error');
      }

    }
    getArtistVerify(theusername);

  }//end else

});

//GET REQUEST - GET Secret Tunes
app.get('/secrettunes', (req, res, next) => {

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
    var theusername = req.user.username;

    async function getArtistVerify(theusername){
      try{
        var db = createConnection();
        await conquerie.connect(db);
        var art_name = "";
        var art_id = "";
        var links = [];
        var tracks = [];
        var themsg = "";

        let result = await userquerie.verifyArtistbyUsername(db, theusername);
        if(result.length > 0 && result[0].artist_id_verify != 0){
          art_id = result[0].artist_id_verify;
          let artresult = await artquerie.getArtistNameByID(db, art_id);
          art_name = artresult[0].artist_name;

          let linkresult = await secretquerie.getArtistsSecretLinks(db, art_name);
          if(linkresult.length > 0){
            for (var i = 0; i < result.length; i++) {
              var row = { 'id': linkresult[i].id, 'track_id': linkresult[i].track_id, 'artist_name': linkresult[i].artist_name, 'url': linkresult[i].url, 'exp_time': linkresult[i].exp_time, 'created_time': linkresult[i].created_time }
              links.push(row);
            }
          }

          let trackresult = await secretquerie.getArtistsSecretTunes(db, art_name);
          if(trackresult.length > 0){
            for (var i = 0; i < trackresult.length; i++) {
              var row = { 'track_name': trackresult[i].track_name, 'artist_name': trackresult[i].artist_name, 'artist_id': trackresult[i].artist_id, 'id': trackresult[i].id, 'short_name': trackresult[i].short_name, 'is_remix': trackresult[i].is_remix, 'is_collab': trackresult[i].is_collab, 'aws_key': trackresult[i].aws_key, 'blank': "" }
              tracks.push(row);
            }

          }else{
            themsg = `No Secret Tracks! You can select "Make Track Secret" when uploading a tune!`;
          }
            
          await conquerie.end(db);
          res.render('secrethub',{ title:'Secret Hub', msg: themsg, theusername: theusername , theid: art_id, theartname: art_name, tracks: tracks, links: links});
        }else{
          await conquerie.end(db);
          res.render('login',{ title:'Riddim Archive Login', theusername: theusername, er: '', message: `You do not have access to this artist's page!` });
        }
      }catch(err){
      console.log(err);
      res.render('error');
      }

    }
    getArtistVerify(theusername);

  }//end else

});

//GET REQUEST - Artist Edit Page
app.get('/artistedit', (req, res, next) => {

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
    var theusername = req.user.username;

    async function getArtistVerify(theusername){
      try{
        var db = createConnection();
        await conquerie.connect(db);
        var art_name = "";
        var art_id = "";

        let result = await userquerie.verifyArtistbyUsername(db, theusername);
        if(result.length > 0 && result[0].artist_id_verify != 0){
          art_id = result[0].artist_id_verify;
          let artresult = await artquerie.getArtistNameByID(db, art_id);
          art_name = artresult[0].artist_name;

          //get all artist info
          var crew = "";
          var country = "";
          var info = "";
          var fb = "";
          var sc = "";
          var bc = "";
          var beat = "";
          var insta = "";
          var imgurl = "";

          let theinfo = await artquerie.getArtistInfo(db, art_name);
          crew = theinfo[0].crew;
          country = theinfo[0].country;
          info = theinfo[0].info;
          fb = theinfo[0].fb;
          sc = theinfo[0].sc;
          bc = theinfo[0].bc;
          beat = theinfo[0].beat;
          insta = theinfo[0].insta;
          imgurl = theinfo[0].img_url;

          await conquerie.end(db);
          res.render('artistedit',{ title:'Artist Edit', msg: "", theusername: theusername , theid: art_id, theartname: art_name, crew: crew, country: country, info: info, fb: fb, sc: sc, bc: bc, beat: beat, insta: insta, imgurl: imgurl });
        }else{
          await conquerie.end(db);
          res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: `You do not have access to this artist's page!` });
        }
      }catch(err){
      console.log(err);
      res.render('error');
      }

    }
    getArtistVerify(theusername);

  }//end else

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
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name, 'img_url': tresult[i].img_url }
          artists.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_collab == 0 && totw[i].is_remix == 0){
            totw[i].blank = `${totw[i].artist_name} - `;
          }
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;
        var shuffletext = `${randtrackname}`;

        if(randresult[0].is_collab == 0 && randresult[0].is_remix == 0){
          shuffletext = `${randartistname} - ${randtrackname}`;
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
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'id': result[i].id, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "" }
          totw.push(row);
        }

        let tresult = await artquerie.getAllArtists(db);

        //store results
        for (var i = 0; i < tresult.length; i++) {
          var row = { 'artist_name': tresult[i].artist_name, 'img_url': tresult[i].img_url }
          artists.push(row);
        }

        for (var i = 0; i < totw.length; i++) {
          if(totw[i].is_collab == 0 && totw[i].is_remix == 0){
            totw[i].blank = `${totw[i].artist_name} - `;
          }
        }

        let randresult = await trackquerie.getRandomTrack(db);
        randdriveurl = randresult[0].drive_url;
        randartistname = randresult[0].artist_name;
        randtrackname = randresult[0].track_name;
        randtrackid = randresult[0].id;
        var shuffletext = `${randtrackname}`;

        if(randresult[0].is_collab == 0 && randresult[0].is_remix == 0){
          shuffletext = `${randartistname} - ${randtrackname}`;
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


            //confirm id is valid
            let tkresult = await trackquerie.getTrackbyID(db, track_id);
            if(tkresult.length > 0){

                  //confirm favorite isnt already there
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
            }else{
              msg = `Invalid Track ID!`;
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

      if(password.length > 32 || password2.length > 32){
        res.render('create',{ title:'Create Account', msg: "Passwords too Long!", theusername: theusername });
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

      }//end else
    }//end else
  }//end else


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

app.post('/changesecretpass', (req, res, next) => {
  var { index, track_id, newpass } = req.body;

  if (newpass == ""){
    res.send({msg: "Please Enter new Password", index: index, track_id: track_id});
  }else{

    async function changePassResponse(index, track_id, newpass){
      try{
        var db = createConnection();
        var hashpass = "";
        await conquerie.connect(db);

        hashpass = await has.hashPass(newpass);
        let result = await secretquerie.changeSecretPass(db, track_id, hashpass);

        await conquerie.end(db);
        res.send({msg: "Secret Pass Changed, Other people will need new password for tune access!", index: index, track_id: track_id});
      }catch(err){
        console.log(err);
        res.render('error');
      }
  }//end async

  changePassResponse(index, track_id, newpass);
  }

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
      var shuffletext = `${thetrackname}`;

      if(result[0].is_collab == 0 && result[0].is_remix == 0){
        shuffletext = `${theartistname} - ${thetrackname}`;
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

app.post('/forwardart',(req,res)=>{

  var { artist_name } = req.body;

  var theid = "";
  var thedriveurl = "";
  var theartistname = "";
  var thetrackname = "";

  async function forwardResponse(artist_name){
    try{
      var db = createConnection();
      await conquerie.connect(db);
      
      let result = await trackquerie.getRandomTrackByArtistName(db, artist_name);
      theid = result[0].id;
      thedriveurl = result[0].drive_url;
      theartistname = result[0].artist_name;
      thetrackname = result[0].track_name;
      var shuffletext = `${thetrackname}`;

      await conquerie.end(db);
      res.send({source: thedriveurl, id: theid, artist_name: theartistname, track_name: thetrackname, shuftext: shuffletext});
    
    }catch(err){
      console.log(err);
      res.render('error');
    }
  }//end async

forwardResponse(artist_name);
});


//POST REQUEST - Track Create
app.post('/trackcreate', (req, res, next) => {

  var { track_name, artist_name, drive_url, tune_of_week, short_name, is_collab, collab1, collab2, collab3, collab4, is_remix, og1, og2 } = req.body;
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
            var db = createConnection();
            var artist_id;

            await conquerie.connect(db);
            let result = await artquerie.getArtistInfo(db, artist_name);

            //store artist query result
            artist_id = result[0].id;
            let tresult = await trackquerie.addTrackfromADM(db, artist_id, artist_name, track_name, short_name, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, tune_of_week);

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

  var { artist_name, crew, country, info, face, sound, band, beat, insta, img } = req.body;
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

                        let tresult = await artquerie.addArtist(db, artist_name, crew, country, info, face, sound, band, beat, insta, img);
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

//APP POST - IS ARTIST CHECK
app.post('/isArtistCheck', function(req,res){

  var { artname, usrid } = req.body;

  async function isArtistResponse(artname, usrid){
    try{
      var isArtist = 0;
      var db = createConnection();
      await conquerie.connect(db);
      let userresult = await userquerie.getUserByid(db, usrid)
      let result = await artquerie.getArtistInfo(db, artname);
      
      if(userresult[0].artist_id_verify == result[0].id){
        isArtist = 1;
      }
      await conquerie.end(db);
      res.send({isArtist: isArtist, artname: artname});

    }catch(err){
      console.log(err);
      res.render('error');
    }

  }
  isArtistResponse(artname, usrid);
});

//APP POST - Artist Delete Track
app.post('/artistpagedeletetrack', function(req,res){

  var { index, track_id, art_name } = req.body;
  var verified = 0;

  if(req.user === undefined){
    res.send({msg: "Access Denied", verified: verified, index: "", track_id: "", art_name: ""});
  }else{
    var theusername = req.user.username;

    async function isArtistResponse(theusername, index, track_id, art_name){
      try{
        var isArtist = 0;
        var db = createConnection();
        await conquerie.connect(db);
        let userresult = await userquerie.getUserByName(db, theusername)
        let result = await artquerie.getArtistInfo(db, art_name);

        if(userresult[0].artist_id_verify == result[0].id){
          verified = 1;
          let del = await trackquerie.deleteTrackByID(db, track_id);
          await conquerie.end(db);
          res.send({msg: "Track Deleted", verified: verified, index: index, track_id: track_id, art_name: art_name});

        }else{
          await conquerie.end(db);
          res.send({msg: "Access Denied", verified: verified, index: "", track_id: "", art_name: ""});
        }

      }catch(err){
        console.log(err);
        res.render('error');
      }
    }
    
    isArtistResponse(theusername, index, track_id, art_name);
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
                    var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
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
                    var row = { 'artist_name': cresult[i].artist_name, 'img_url': cresult[i].img_url }
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
          var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
          artists.push(row);
        }//end for
      }
      if(pagey == 1){
        let result = await artquerie.getAllArtistsEthroughI(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
          artists.push(row);
        }//end for
      }
      if(pagey == 2){
        let result = await artquerie.getAllArtistsJthroughO(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
          artists.push(row);
        }//end for
      }
      if(pagey == 3){
        let result = await artquerie.getAllArtistsPthroughT(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
          artists.push(row);
        }//end for
      }
      if(pagey == 4){
        let result = await artquerie.getAllArtistsUthroughZ(db);
        for (var i = 0; i < result.length; i++) {
          var row = { 'artist_name': result[i].artist_name, 'img_url': result[i].img_url }
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
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistAthroughD(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedAthroughD(db, artist_name);
          if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey0
      if(pagey == 1){
        let result = await trackquerie.getAllTracksEthroughI(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistEthroughI(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedEthroughI(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey1
      if(pagey == 2){
        let result = await trackquerie.getAllTracksJthroughO(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistJthroughO(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        
        let remixresult = await trackquerie.getTracksThatOthersRemixedJthroughO(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey2
      if(pagey == 3){
        let result = await trackquerie.getAllTracksPthroughT(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistPthroughT(db, artist_name);
          if(collabresult.length > 0){
            for (var i = 0; i < collabresult.length; i++) {
              var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }
        let remixresult = await trackquerie.getTracksThatOthersRemixedPthroughT(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
          }

      }//pagey3
      if(pagey == 4){
        let result = await trackquerie.getAllTracksUthroughZ(db, artist_name);
        for (var i = 0; i < result.length; i++) {
          var row = { 'track_name':result[i].track_name, 'artist_name':result[i].artist_name, 'drive_url': result[i].drive_url, 'crew': result[i].crew, 'country': result[i].country, 'artist_id': result[i].artist_id, 'id': result[i].id, 'short_name': result[i].short_name, 'is_remix': result[i].is_remix, 'is_collab': result[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
          tracks.push(row);
        }

        let collabresult = await trackquerie.getCollabsIncludingArtistUthroughZ(db, artist_name);
        if(collabresult.length > 0){
          for (var i = 0; i < collabresult.length; i++) {
            var row = { 'track_name':collabresult[i].track_name, 'artist_name':collabresult[i].artist_name, 'drive_url': collabresult[i].drive_url, 'crew': collabresult[i].crew, 'country': collabresult[i].country, 'artist_id': collabresult[i].artist_id, 'id': collabresult[i].id, 'short_name': collabresult[i].short_name, 'is_remix': collabresult[i].is_remix, 'is_collab': collabresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
            tracks.push(row);
          }
        }

        let remixresult = await trackquerie.getTracksThatOthersRemixedUthroughZ(db, artist_name);
        if(remixresult.length > 0){
            for (var i = 0; i < remixresult.length; i++) {
              var row = { 'track_name':remixresult[i].track_name, 'artist_name':remixresult[i].artist_name, 'drive_url': remixresult[i].drive_url, 'crew': remixresult[i].crew, 'country': remixresult[i].country, 'artist_id': remixresult[i].artist_id, 'id': remixresult[i].id, 'short_name': remixresult[i].short_name, 'is_remix': remixresult[i].is_remix, 'is_collab': remixresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
            }
        }

      }//pagey4

      for (var i = 0; i < tracks.length; i++) {

        let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
        if(thehearts.length > 0){
          tracks[i].hearts = thehearts;
          const isincluded = (element) => element.user_id == user_id;
          var test = -1;
          test = thehearts.findIndex(isincluded);
          if (test != -1){
            tracks[i].userhearted = 1;
          }
        }
      }

      await conquerie.end(db);
      tracks.sort((a, b) => (a.short_name > b.short_name) ? 1 : -1);

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
           var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'short_name': sresult[i].short_name, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "", 'hearts': "", 'userhearted': "0" }
           tracks.push(row);
          }

          if(collabsresult.length > 0){
            for (var i = 0; i < collabsresult.length; i++) {
              var row = { 'track_name':collabsresult[i].track_name, 'artist_name':collabsresult[i].artist_name, 'drive_url': collabsresult[i].drive_url, 'id': collabsresult[i].id, 'short_name': collabsresult[i].short_name, 'is_remix': collabsresult[i].is_remix, 'is_collab': collabsresult[i].is_collab, 'blank': "", 'hearts': "", 'userhearted': "0" }
              tracks.push(row);
             }
          }

          for (var i = 0; i < tracks.length; i++) {

            let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
            if(thehearts.length > 0){
              tracks[i].hearts = thehearts;
              const isincluded = (element) => element.user_id == user_id;
              var test = -1;
              test = thehearts.findIndex(isincluded);
              if (test != -1){
                tracks[i].userhearted = 1;
              }
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
                 var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'short_name': sresult[i].short_name, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
                 tracks.push(row);
                }

                for (var i = 0; i < tracks.length; i++) {

                  let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
                  if(thehearts.length > 0){
                    tracks[i].hearts = thehearts;
                    const isincluded = (element) => element.user_id == user_id;
                    var test = -1;
                    test = thehearts.findIndex(isincluded);
                    if (test != -1){
                      tracks[i].userhearted = 1;
                    }
                  }

                  if(tracks[i].is_collab == 0 && tracks[i].is_remix == 0){
                    tracks[i].blank = `${tracks[i].artist_name} - `;
                  }
                }

                await conquerie.end(db);
                tracks.sort((a, b) => (a.short_name > b.short_name) ? 1 : -1);
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
                 var row = { 'track_name':sresult[i].track_name, 'artist_name':sresult[i].artist_name, 'drive_url': sresult[i].drive_url, 'id': sresult[i].id, 'short_name': sresult[i].short_name, 'is_remix': sresult[i].is_remix, 'is_collab': sresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
                 tracks.push(row);
                }

                if(collabsresult.length > 0){
                  for (var i = 0; i < collabsresult.length; i++) {
                    var row = { 'track_name':collabsresult[i].track_name, 'artist_name':collabsresult[i].artist_name, 'drive_url': collabsresult[i].drive_url, 'id': collabsresult[i].id, 'short_name': collabsresult[i].short_name, 'is_remix': collabsresult[i].is_remix, 'is_collab': collabsresult[i].is_collab, 'blank': "", 'alltrackcomments': "", 'hearts': "", 'userhearted': "0" }
                    tracks.push(row);
                   }
                }

                for (var i = 0; i < tracks.length; i++) {

                  let thehearts = await heartquerie.getAllHeartsOnTrack(db, tracks[i].id);
                  if(thehearts.length > 0){
                    tracks[i].hearts = thehearts;
                    const isincluded = (element) => element.user_id == user_id;
                    var test = -1;
                    test = thehearts.findIndex(isincluded);
                    if (test != -1){
                      tracks[i].userhearted = 1;
                    }
                  }

                  if(tracks[i].is_collab == 0 && tracks[i].is_remix == 0){
                    tracks[i].blank = `${tracks[i].artist_name} - `;
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

  var { ind, track_name, track_id } = req.body;

  async function commentsResponse(ind, track_name, track_id){
    try{
        var comments = [];
        var nocomments = 0;
        var msg = "";
        var db = createConnection();
        await conquerie.connect(db);

        let commresult = await commquerie.getAllCommentsByTrackName(db, track_name);
          if(commresult.length > 0){
            for (var i = 0; i < commresult.length; i++) {
              var timeunsplit = commresult[i].time;
              var thefullstring = commresult[i].time.toString();
              var str = thefullstring.split(" ");
              if(str[1] == "Jan") { str[1] = "01"; }
              if(str[1] == "Feb") { str[1] = "02"; }
              if(str[1] == "Mar") { str[1] = "03"; }
              if(str[1] == "Apr") { str[1] = "04"; }
              if(str[1] == "May") { str[1] = "05"; }
              if(str[1] == "Jun") { str[1] = "06"; }
              if(str[1] == "Jul") { str[1] = "07"; }
              if(str[1] == "Aug") { str[1] = "08"; }
              if(str[1] == "Sep") { str[1] = "09"; }
              if(str[1] == "Oct") { str[1] = "10"; }
              if(str[1] == "Nov") { str[1] = "11"; }
              if(str[1] == "Dec") { str[1] = "12"; }
              commresult[i].time = `${str[1]}/${str[2]}/${str[3]} - ${str[4]}`;

              var row = { 'track_id': commresult[i].track_id, 'user_id': commresult[i].user_id, 'comment': commresult[i].comment, 'username': commresult[i].username, 'time': commresult[i].time, 'timeunsplit': timeunsplit }
              comments.push(row);
            }
          }else{
            nocomments = 1;
            console.log("no comments found");
            msg = "No Comments on this Tune!"
          }

        await conquerie.end(db);
        if(comments.length > 1){
          comments.sort((a, b) => (a.timeunsplit < b.timeunsplit) ? 1 : -1);
        }
        res.send({index: ind, msg: msg, track_name: track_name, track_id: track_id, comments: comments, nocomments: nocomments});

      }catch(err){
        console.log(err);
        res.render('error');
      }

    }
    commentsResponse(ind, track_name, track_id);
});

//POST REQUEST - Add Heart
app.post('/addheart', (req, res, next) => {
  var { index, track_id, user_id } = req.body;

  if(user_id === "" || req.user.id === undefined){
    var msg = "Please login to heart the tune!";
    res.send({msg: msg, index: index});

  //below else means user id is not blank
  }else{
    async function heartsAddResponse(index, track_id, user_id){
      try{
        var db = createConnection();
        await conquerie.connect(db);

        let result = await heartquerie.addHeart(db, track_id,user_id);

        await conquerie.end(db);
        res.send({msg: msg, index: index, hearted: 1, track_id: track_id, user_id: user_id});

      }catch(err){
      console.log(err);
      res.render('error');
    }

  }
  heartsAddResponse(index, track_id, user_id);
  }
});

//POST REQUEST - Remove Heart
app.post('/removeheart', (req, res, next) => {
  var { index, track_id, user_id } = req.body;

  if(user_id === "" || req.user.id === undefined){
    var msg = "Please login to heart the tune!";
    res.send({msg: msg, index: index});

  //below else means user id is not blank
  }else{
    async function heartsRemoveResponse(index, track_id, user_id){
      try{
        var db = createConnection();
        await conquerie.connect(db);

        let result = await heartquerie.deleteHeart(db, track_id,user_id);

        await conquerie.end(db);
        res.send({msg: msg, index: index, hearted: 0, track_id: track_id, user_id: user_id});

      }catch(err){
      console.log(err);
      res.render('error');
    }

  }
  heartsRemoveResponse(index, track_id, user_id);
  }
});

//POST REQUEST - Follow Artist
app.post('/followartist', (req, res, next) => {
  var { art_name, user_id, artid } = req.body;

  async function followArtistResponse(art_name, user_id, artid){
      try{
        var db = createConnection();
        await conquerie.connect(db);

        let result = await followquerie.followArtist(db, art_name, user_id, artid);

        await conquerie.end(db);
        res.send({art_name: art_name, user_id: user_id, artid: artid});

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  followArtistResponse(art_name, user_id, artid);
  
});

//POST REQUEST - Unfollow Artist
app.post('/unfollowartist', (req, res, next) => {
  var { art_name, user_id, artid } = req.body;

  async function unfollowArtistResponse(art_name, user_id, artid){
      try{
        var db = createConnection();
        await conquerie.connect(db);

        let result = await followquerie.unfollowArtist(db, art_name, user_id);

        await conquerie.end(db);
        res.send({art_name: art_name, user_id: user_id, artid: artid});

      }catch(err){
        console.log(err);
        res.render('error');
      }

  }
  unfollowArtistResponse(art_name, user_id, artid);
  
});

//POST REQUEST - Add Comment
app.post('/addcomment', (req, res, next) => {
  var { cmt, extra } = req.body;
  var splitty = extra.split("/");
  var user_id = splitty[0];
  var track_id = splitty[1];

  async function addCommentsResponse(cmt, track_id, user_id){
    try{
      var db = createConnection();
      await conquerie.connect(db);

      let usrname = await userquerie.getUsernamebyID(db, user_id);
      var username = usrname[0].username;

      let result = await commquerie.addComment(db, cmt, track_id, user_id, username);
      let cmttimeandid = await commquerie.getCommentIDandTime(db, cmt, track_id, user_id);
      if (cmttimeandid.length > 1){
        console.log("Duplicate COmment from User");
        cmttimeandid.sort((a, b) => (a.time < b.time) ? 1 : -1);
      }

      var thefullstring = cmttimeandid[0].time.toString();
      var str = thefullstring.split(" ");
        if(str[1] == "Jan") { str[1] = "01"; }
        if(str[1] == "Feb") { str[1] = "02"; }
        if(str[1] == "Mar") { str[1] = "03"; }
        if(str[1] == "Apr") { str[1] = "04"; }
        if(str[1] == "May") { str[1] = "05"; }
        if(str[1] == "Jun") { str[1] = "06"; }
        if(str[1] == "Jul") { str[1] = "07"; }
        if(str[1] == "Aug") { str[1] = "08"; }
        if(str[1] == "Sep") { str[1] = "09"; }
        if(str[1] == "Oct") { str[1] = "10"; }
        if(str[1] == "Nov") { str[1] = "11"; }
        if(str[1] == "Dec") { str[1] = "12"; }
      var cmttime = `${str[1]}/${str[2]}/${str[3]} - ${str[4]}`;
      var cmtid = cmttimeandid[0].id;

      await conquerie.end(db);
      res.send({ cmt: cmt, cmttime: cmttime, cmtid: cmtid, track_id: track_id, user_id: user_id, username: username });

      }catch(err){
        console.log(err);
        res.render('error');
    }

  }//end async
  addCommentsResponse(cmt, track_id, user_id);

});

//POST REQUEST - Remove Comment
app.post('/removecmt', (req, res, next) => {
  var { index, username, thecomment, thetime } = req.body;

  if(req.user === undefined){
    var msg = "Please login to Remove comment!";
    res.send({msg: msg, index: index});

  //below else means user id is not blank
  }else{
    async function commentsRemoveResponse(index, username, thecomment, thetime){
      try{
        var db = createConnection();
        await conquerie.connect(db);

        let result = await commquerie.deleteComment(db, username, thecomment, thetime);

        await conquerie.end(db);
        res.send({msg: "Comment Deleted!", index: index});

      }catch(err){
      console.log(err);
      res.render('error');
    }

  }
  commentsRemoveResponse(index, username, thecomment, thetime);
  }
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

//POST REQUEST - GET S3 Page
app.post('/tuneup', (req, res, next) => {

  var { theid, theartistname } = req.body;

  if(req.user === undefined){
    res.render('login',{ title:'Riddim Archive Login', theusername: '', er: '', message: '' });
  }else{
    var theusername = req.user.username;
    async function getArtistVerify(theusername){
      try{
        var db = createConnection();
        await conquerie.connect(db);
        var art_name = "";
        var art_id = "";

        let result = await userquerie.verifyArtistbyUsername(db, theusername);
        if(result.length > 0 && result[0].artist_id_verify != 0){
          art_id = result[0].artist_id_verify;
          let artresult = await artquerie.getArtistNameByID(db, art_id);
          art_name = artresult[0].artist_name;
          await conquerie.end(db);
          res.render('tests3',{ title:'Tune Upload', msg: "", theusername: theusername , theid: art_id, theartname: art_name});
        }else{
          await conquerie.end(db);
          res.render('login',{ title:'Riddim Archive Login', theusername: theusername, er: '', message: `You do not have access to this artist's page!` });
        }
      }catch(err){
      console.log(err);
      res.render('error');
      }

    }
    getArtistVerify(theusername);
  }
});

//POST REQUEST - GET S3 Page
app.post('/secretsubmit', (req, res, next) => {

  var { password, track_id } = req.body;
  if(password == ""){
    res.send({ msg: "Please Enter Password!", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });
  }else{

        async function submitCheck(password, track_id){
            try{
              var tracks = [];
              var verified = 0;
              var url = "";
              var exp_time = "";
              var created_time = "";
            
              var db = createConnection();
              await conquerie.connect(db);
            
              let tresult = await trackquerie.getTrackbyID(db, track_id);
              if (tresult.length > 0){
                  var row = { 'track_name': tresult[0].track_name, 'artist_name': tresult[0].artist_name, 'artist_id': tresult[0].artist_id, 'id': tresult[0].id, 'is_remix': tresult[0].is_remix, 'is_collab': tresult[0].is_collab, 'is_secret': tresult[0].is_secret, 'secret_pass': tresult[0].secret_pass, 'aws_key': tresult[0].aws_key, 'blank': "" }
                  tracks.push(row);
                  if(tracks[0].is_secret == 0){
                    await conquerie.end(db);
                    res.send({ msg: "Track not Secret, Check their Artist Page!", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });
                  }else{
                      //check pass
                      let isMatch = await has.passCheck(password, tracks[0].secret_pass);

                      if(isMatch){
                          verified = 1;
                          tracks[0].secret_pass = "";

                          //get signed url from DB
                          let sresult = await secretquerie.getSecretLink(db, track_id);
                          if (sresult.length > 0){
                              url = sresult[0].url;
                              exp_time = sresult[0].exp_time;
                              created_time = sresult[0].created_time;
                              artist_name = sresult[0].artist_name;

                              let gettime = await secretquerie.getCurrentTimestamp(db);
                              var currtime = gettime[0].curr;
                              let diffinseconds = await secretquerie.returnTimeDiff(db, currtime, created_time);
                              var finaldiff = diffinseconds[0].diff;
                              if (finaldiff > exp_time){
                                let del = await secretquerie.deletePreviousLink(db, track_id);
                                await conquerie.end(db);
                                res.send({ msg: "Link Expired, Check with Artist for New Link!", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });

                              }else{
                                if(tracks[0].is_collab == 0 && tracks[0].is_remix == 0){
                                  tracks[0].blank = `${tracks[0].artist_name} - `;
                                }
  
                                await conquerie.end(db);
                                res.send({ msg: "Verified, Access Granted", track_id: track_id, url: url, exp_time: exp_time, created_time: created_time, artist_name: artist_name, tracks: tracks, success: "1" });
                              }
                          }else{
                            await conquerie.end(db);
                            res.send({ msg: "Link Expired or Removed", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });
                          }
                      }else{
                        await conquerie.end(db);
                        res.send({ msg: "Password Does not Match, Please Try Again!", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });
                      }
                  }//is secret
              
              }else{
                await conquerie.end(db);
                res.send({ msg: "Track not found, Link is incorrect!", track_id: "", url: "", exp_time: "", created_time: "", artist_name: "", tracks: "", success: "0" });
              }//track not found else
            
            }catch(err){
              console.log(err);
              res.render('error');
            }
        }//submit check

    submitCheck(password, track_id);

  }//password else

});

//POST REQUEST - TEST S3 Upload
app.post('/tests3upload', (req, res, next) => {

  var { artist_name, artist_id, track_name, short_name, is_collab, is_remix, is_secret, secret_pass, col1, col2, col3, col4, rem1, rem2 } = req.body;
  
  var themsg = "";
  if (!req.files || Object.keys(req.files).length === 0) {
    themsg = "Be sure to Add File and Trackname!";
    res.send({msg: themsg, song: ""});
  }else{
    if(track_name == ""){
      themsg = "Need Trackname!";
      res.send({msg: themsg, song: ""});
    }else{
      if(is_collab == 1 && col1 == ""){
        themsg = "You marked tune as a Collab, Please add a Collab Artist!";
        res.send({msg: themsg, song: ""});
      }else{
        if(is_remix == 1 && rem1 == ""){
          themsg = "You marked tune as a Remix, Please add a Remix Artist!";
          res.send({msg: themsg, song: ""});
        }else{
          if(is_secret == 1 && secret_pass == ""){
            themsg = "You marked tune as Secret, Please add Secret Password!";
            res.send({msg: themsg, song: ""});
          }else{
              //all checks passed - add song to aws s3 and DB
                        
              const song = req.files.file;
              var thefilename = song.name;
              var artstr = artist_name;
              var artfirstletter = artstr.charAt(0);
              var makepublic = 1;
              var islogo = 0;
              var aws_key = "";
              var hashedpass = "";
                        
              if (is_secret == 1){
                makepublic = 0;
              }
              s3fcn.uploadToS3(song, islogo, artist_name, artfirstletter, makepublic);
              themsg = "File uploaded!";
              //add tune to db!
              async function storeFormResults(artist_name, artist_id, track_name, short_name, is_collab, is_remix, is_secret, secret_pass, col1, col2, col3, col4, rem1, rem2){
                try{
                  console.log("in async");
                  var db = createConnection();
                  await conquerie.connect(db);
                  var tune_of_week = 0;
                  //construct drive url
                  var drive_url = "";
                  const regexspace = /[ ]/g;
                  const regexamp = /[&]/g;
                  var artstrtest = artstr.replace(regexspace, "+");
                  var artstrtest2 = encodeURI(artstrtest);
                  var artnamefinalencode = artstrtest2.replace(regexamp, "%26");
                
                  var filenamestrtest = song.name.replace(regexspace, "+");
                  var filenamestrtest2 = encodeURI(filenamestrtest);
                  var filenamefinalencode = filenamestrtest2.replace(regexamp, "%26");
                  drive_url = `https://riddim-archive-tune-store.s3-us-west-1.amazonaws.com/${artnamefinalencode.charAt(0)}/${artnamefinalencode}/${filenamefinalencode}`;
                  if (is_secret == 1){
                    drive_url = "";
                    aws_key = `${artfirstletter}/${artstr}/${song.name}`;
                    hashedpass = await has.hashPass(secret_pass);
                  }
                
                
                
                  let tresult = await trackquerie.addTrack(db, artist_id, artist_name, track_name, short_name, drive_url, col1, col2, col3, col4, is_collab, rem1, rem2, is_remix, is_secret, hashedpass, aws_key, tune_of_week);
                
                  await conquerie.end(db);
                  res.send({msg: "File Uploaded! Note: Large files may take a moment!"});
                
                
                }catch(err){
                  console.log(err);
                  res.render('error');
                }
              }//end async
              storeFormResults(artist_name, artist_id, track_name, short_name, is_collab, is_remix, is_secret, secret_pass, col1, col2, col3, col4, rem1, rem2);
          }
        }
      } 
    }
  }

});

//POST REQUEST - TEST S3 Upload
app.post('/fulldownload/:name', (req, res, next) => {

  var { artist_name } = req.body;
  async function doThings(artist_name){
    try{
      console.log("in async");
      var db = createConnection();
      await conquerie.connect(db);
      var urls = [];
      var finalresult = "";

      //get all tracks from that artist
      let urlresult = await trackquerie.getAllURLsfromArtist(db, artist_name);
      if(urlresult.length > 0){
        for (var i = 0; i < urlresult.length; i++) {
          var row = { 'track_name': urlresult[i].track_name, 'drive_url': urlresult[i].drive_url, 'filetype': urlresult[i].filetype }
          urls.push(row);
        }
      }

      await conquerie.end(db);

      var zip = new ZipStream();
      zip.pipe(res);

      function addNextFile() {
          var elem = urls.shift();
          var stream = request(elem.drive_url);
          zip.entry(stream, { name: `${elem.track_name}.${elem.filetype}` }, err => {
              if(err){
                throw err;
              }
              if(urls.length > 0){
                console.log("Adding next File...")
                addNextFile();
              }else{
                zip.finalize();
                console.log("Finalized!");
              }
          });
      }
      if(urls != []){
        addNextFile();
      }else{
        res.send({msg: "No Files Available!"});
      }

    }catch(err){
      console.log(err);
      res.render('error');
    }
  }//end async
  doThings(artist_name);

});

//POST REQUEST - Artist Self-Edit
app.post('/artistedit', (req, res, next) => {

  var { artist_name, artist_id, crew, country, info, fb, sc, bc, beat, insta } = req.body;

  var themsg = "";
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("File NOT Included");
    async function storeFormResultsNoFile(artist_name, artist_id, crew, country, info, fb, sc, bc, beat, insta){
      try{
        console.log("in async");
        var db = createConnection();
        await conquerie.connect(db);

        if(artist_name != ""){
          let artnamechange = await artquerie.editArtistName(db, artist_id, artist_name);
        }
        if(crew != ""){
          let crewchange = await artquerie.editCrew(db, artist_id, crew);
        }
        if(country != ""){
          let countrychange = await artquerie.editCountry(db, artist_id, country);
        }
        if(info != ""){
          let infochange = await artquerie.editInfo(db, artist_id, info);
        }
        if(fb != ""){
          let fbchange = await artquerie.editFB(db, artist_id, fb);
        }
        if(sc != ""){
          let scchange = await artquerie.editSC(db, artist_id, sc);
        }
        if(bc != ""){
          let bcchange = await artquerie.editBC(db, artist_id, bc);
        }
        if(beat != ""){
          let beatchange = await artquerie.editBeat(db, artist_id, beat);
        }
        if(insta != ""){
          let instachange = await artquerie.editInsta(db, artist_id, insta);
        }
        
        await conquerie.end(db);
        res.send({msg: "Info Changed! View your artist page to see changes!"});
                
      }catch(err){
        console.log(err);
        res.render('error');
      }
    }//end async
    storeFormResultsNoFile(artist_name, artist_id, crew, country, info, fb, sc, bc, beat, insta);

  }else{
    console.log("File Included");

    const logo = req.files.file;
    var thefilename = logo.name;
    var artstr = artist_name;
    var artfirstletter = artstr.charAt(0);
    var makepublic = 1;
    var islogo = 1;

    s3fcn.uploadToS3(logo, islogo, artist_name, artfirstletter, makepublic);

    var img_url = "";
    const regexspace = /[ ]/g;
    const regexamp = /[&]/g;
    var artstrtest = artstr.replace(regexspace, "+");
    var artstrtest2 = encodeURI(artstrtest);
    var artnamefinalencode = artstrtest2.replace(regexamp, "%26");

    var filenamestrtest = thefilename.replace(regexspace, "+");
    var filenamestrtest2 = encodeURI(filenamestrtest);
    var filenamefinalencode = filenamestrtest2.replace(regexamp, "%26");
    img_url = `https://riddim-archive-tune-store.s3-us-west-1.amazonaws.com/Images/${artnamefinalencode.charAt(0)}/${artnamefinalencode}/${filenamefinalencode}`;

    console.log(`img url is:`);
    console.log(`${img_url}`);
    console.log(`${thefilename}    /${artist_name}${crew}${country}${info}${fb}${sc}${bc}${beat}${insta}`);

    async function storeFormResults(artist_name, artist_id, img_url, crew, country, info, fb, sc, bc, beat, insta){
      try{
        console.log("in async");
        var db = createConnection();
        await conquerie.connect(db);

        let img_change = await artquerie.editImg(db, artist_id, img_url);

        if(artist_name != ""){
          let artnamechange = await artquerie.editArtistName(db, artist_id, artist_name);
        }
        if(crew != ""){
          let crewchange = await artquerie.editCrew(db, artist_id, crew);
        }
        if(country != ""){
          let countrychange = await artquerie.editCountry(db, artist_id, country);
        }
        if(info != ""){
          let infochange = await artquerie.editInfo(db, artist_id, info);
        }
        if(fb != ""){
          let fbchange = await artquerie.editFB(db, artist_id, fb);
        }
        if(sc != ""){
          let scchange = await artquerie.editSC(db, artist_id, sc);
        }
        if(bc != ""){
          let bcchange = await artquerie.editBC(db, artist_id, bc);
        }
        if(beat != ""){
          let beatchange = await artquerie.editBeat(db, artist_id, beat);
        }
        if(insta != ""){
          let instachange = await artquerie.editInsta(db, artist_id, insta);
        }
        
        await conquerie.end(db);
        res.send({msg: "Info Changed! View your artist page to see changes!"});
                
      }catch(err){
        console.log(err);
        res.render('error');
      }
    }//end async
    storeFormResults(artist_name, artist_id, img_url, crew, country, info, fb, sc, bc, beat, insta);

  }//file added else


});

//POST REQUEST - New Artist Acct Create
app.post('/newartistacctcreate', (req, res, next) => {

  var { username, pass1, pass2, artist_name } = req.body;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.send({msg: "Be sure to Attach Both Files!"});
  }else{
    if(!username || !pass1 || !pass2){
      res.send({msg: "Be sure to include Username and Password Twice!"});
    }else{
      if(pass1 !== pass2){
        res.send({msg: "Passwords do not match, Please Re-enter"});
      }else{
        //perform hash and add query
        async function createArtResponse(username, pass1, artist_name){
          try{
            var db = createConnection();
            var hashpass = "";
            await conquerie.connect(db);
  
            let uresult = await userquerie.getUserInfo(db, username);
            if(uresult.length > 0){
              res.send({msg: "Username Taken! Please Try a Different Name"});
            }else{
                hashpass = await has.hashPass(pass1);
                let result = await userquerie.createAccount(db, username, hashpass);
                await conquerie.end(db);

                const proof = req.files.prooffile;
                const logo = req.files.artistlogo;
                var artstr = artist_name;
                var artfirstletter = artstr.charAt(0);
                var makepublic = 1;
                var islogo = 1;

                s3fcn.uploadToS3(logo, islogo, artist_name, artfirstletter, makepublic);

                var img_url = "";
                const regexspace = /[ ]/g;
                const regexamp = /[&]/g;
                var artstrtest = artstr.replace(regexspace, "+");
                var artstrtest2 = encodeURI(artstrtest);
                var artnamefinalencode = artstrtest2.replace(regexamp, "%26");

                var filenamestrtest = logo.name.replace(regexspace, "+");
                var filenamestrtest2 = encodeURI(filenamestrtest);
                var filenamefinalencode = filenamestrtest2.replace(regexamp, "%26");
                img_url = `https://riddim-archive-tune-store.s3-us-west-1.amazonaws.com/Images/${artnamefinalencode.charAt(0)}/${artnamefinalencode}/${filenamefinalencode}`;
                console.log("urlbelow");
                console.log(img_url);

                await emailer.storeArtistVerifyImage(proof, artist_name);
                await emailer.emailArtistVerify(username, artist_name, img_url);
                res.send({msg: "Artist Account Submitted.<br>Once Info is verified, you can upload tunes to your Artist Page!"});
            }//else 4, username is free
          }catch(err){
            console.log(err);
            res.render('error');
          }
        }//end async
  
      createArtResponse(username, pass1, artist_name);
  
      }//else 3, passwords match
    }//else 2, username + passwords entered
  }//else 1, files are attached

});

//POST REQUEST - TEST S3 Get Track
app.post('/tests3gettrack', (req, res, next) => {

  var { index, track_id, artist_name, track_name } = req.body;

  var themsg = `Function Called - index is: ${index} track_id is: ${track_id} artist_name is: ${artist_name} track_name is: ${track_name}`;
  res.send({ msg: themsg });

});

app.post('/getgenlink', (req, res, next) => {
  var { index, track_id, link_time } = req.body;

  async function getGenLink(index, track_id, link_time){
    try{
      var db = createConnection();
      await conquerie.connect(db);
      var tracks = [];

      let result = await trackquerie.getTrackbyID(db, track_id);
      var row = { 'track_name': result[0].track_name, 'artist_name': result[0].artist_name, 'is_remix': result[0].is_remix, 'is_collab': result[0].is_collab, 'blank': "", 'aws_key': result[0].aws_key }
      tracks.push(row);

      if(tracks[0].is_collab == 0 && tracks[0].is_remix == 0){
        tracks[0].blank = `${tracks[0].artist_name} -`;
      }

      var theurl = s3fcn.getSecretURL(tracks[0].aws_key, link_time);

      let del = await secretquerie.deletePreviousLink(db, track_id);
      let sresult = await secretquerie.addSecretLink(db, track_id, tracks[0].artist_name, theurl, link_time);

      await conquerie.end(db);
      res.send({ msg: `https://www.riddimarchive.com/secretshare/${track_id}<br>Link Copied To Clipboard, User will need link and current secret password to access!`, index: index, track_id: track_id, tracks: tracks });

    }catch(err){
    console.log(err);
    res.render('error');
    }

  }
  getGenLink(index, track_id, link_time);

});

//Server Request Handler
app.listen(port, () => { console.log(`Server running at: http://localhost:${port}/`); });

//export app
module.export = app;
