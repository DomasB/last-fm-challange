const express = require('express');
const app = express();
const Database = require('better-sqlite3');
const db = new Database('database/last-fm.db');
const getArtistById = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
const getArtistByName = db.prepare("SELECT * FROM artists WHERE artist_name = $name");
const getAlbumsByArtist = db.prepare("SELECT * FROM albums WHERE album_artist = $name");
const getAlbumById = db.prepare("SELECT * FROM albums WHERE album_id = $id");
const getTracksByAlbum = db.prepare("SELECT * FROM album_tracks WHERE album_id = $id");
const getAllTrackFromOldest = db.prepare("SELECT track_date FROM tracks WHERE local_album_id = $id AND track_name LIKE $name ORDER BY track_date ASC");
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/artist/:id', (req, res) => {
    let artist = {};
    if (isNaN(parseInt(req.params.id))) {
        artist = getArtistByName.get({name:req.params.id});
    } else {
        artist = getArtistById.get({id:req.params.id});
    }
    if(!artist) artist = { error: "No artist found by id " + req.params.id };
    res.json(artist);
});

app.get('/api/albumsbyartist/:name', (req, res) => {
    let artist = req.params.name;
    let albums = getAlbumsByArtist.all({name: artist});
    if(!albums) albums = {error: "No albums found for artist " + artist};
    res.json(albums);
});

app.get('/api/album/:id', (req, res) => {
    let album = {};
    if (!isNaN(parseInt(req.params.id))) {
        album = getAlbumById.get({id:req.params.id});
    }
    if(!album) album = { error: "No album found by id " + req.params.id };
    res.json(album);
});
app.get('/api/albumtracks/:id', (req, res) => {
    let id = req.params.id;
    let tracks = getTracksByAlbum.all({id});
    if(!tracks) {
        tracks = {error: "No albums found for album " + id};
    } else {
        tracks.map(track => {
            let playedTrack = getAllTrackFromOldest.get({id, name: track.album_track_name});
            if (playedTrack) track.first_played = playedTrack.track_date;
        });
    }
    res.json(tracks);
});
app.listen(3000, () => console.log('Example app listening on port 3000!'));
