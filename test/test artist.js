<div id="foo"></div>

<script>
function makeUL(tracks) {
    var list = document.createElement('ul');

    for (var i = 0; i < array.length; i++) {
        var text = document.createElement('li');
        text.appendChild(tracks[i].artist_name + " - " + tracks[i].track_name);
        list.appendChild(text);


        var track = document.createElement('li');
        var aud = document.createElement('audio');
        aud.src = tracks[i].drive_url;
        track = aud;


        var thelink = document.createElement('li');
        var a = document.createElement('a');  
        var link = document.createTextNode("This is link"); 
        a.appendChild(link);  
        a.title = "Download Tune";  
        a.href = track.drive_url;  
        thelink = a; 


    }
    return list;
}

document.getElementById('foo').appendChild(tracks);
</script>