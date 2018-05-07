const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const db = new Database('database/last-fm.db');

const USER = 'briediz';
const API_KEY = 'e054746cf363b1b4d0f42a5b587054dc';
//var a = db.prepare('CREATE TABLE tracks ( track_id integer PRIMARY KEY, track_name text NOT NULL, track_artist_name text NOT NULL, track_artist_mbid text, track_album text, track_url text, track_image text, track_date integer )')
//let albumsDB = db.prepare('CREATE TABLE albums (album_id integer PRIMARY KEY, album_name text NOT NULL, album_artist text, album_mbid text, album_image text, album_tags text)');
//let albumTracksDB = db.prepare('CREATE TABLE album_tracks (album_track_id integer PRIMARY KEY, album_id integer NOT NULL, album_name text NOT NULL, artist_name text, artist_mbid text, album_track_name text NOT NULL, track_url text, track_duration integer)')
//let artistsDB = db.prepare('CREATE TABLE artists (artist_id integer PRIMARY KEY, artist_name text NOT NULL, artist_mbid text, artist_url text, artist_image text, artist_tags text)');
//var a = db.prepare('SELECT name FROM sqlite_master WHERE type = "table"')
//console.log(artistsDB.run());
//console.log(a.all())
let insertTrack = db.prepare('INSERT INTO tracks (track_name, track_artist_name, track_artist_mbid, track_album, track_url, track_image, track_date, track_new) VALUES ($track_name, $track_artist_name, $track_artist_mbid, $track_album, $track_url, $track_image, $track_date, $track_new)');
const getTracks = (page, limit) => {
    fetch(
        "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" +
        USER +
        "&api_key=" +
        API_KEY +
        "&limit=" +
        limit +
        "&format=json&page=" +
        page,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }
    )
        .then(response => response.json())
        .then(r => {
            console.log(r.recenttracks['@attr'].totalPages);
            r.recenttracks.track.map(track => {
                if(!track['@attr']) {
                    let data = {};
                    data.track_name = track.name;
                    data.track_artist_name = track.artist['#text'] || null;
                    data.track_artist_mbid = track.artist.mbid || null;
                    data.track_album = track.album['#text'] || null;
                    data.track_url = track.url || null;
                    data.track_image = track.image[3]['#text'] || null;
                    data.track_date = track.date.uts || 0;
                    data.track_new = 0;
                    let response = insertTrack.run(data);
                    console.log(response)
                }
                });
            if(page <= r.recenttracks['@attr'].totalPages) {
                setTimeout( () => {
                    let newPages = page + 1;
                    getTracks(newPages, limit)
                }, 500);
                console.log('Fetched page ', page, '/', r.recenttracks['@attr'].totalPages)
            }
        })
};
//getTracks(1, 200);
//let getTracksDB = db.prepare('SELECT DISTINCT track_name track, track_artist_name artist FROM Tracks WHERE track_date > 1514764800 LIMIT 100');
//let getTracksDB = db.prepare('SELECT * FROM Tracks');
//let results = getTracksDB.all();
//results.map(result => { console.log(result.artist, " - ", result.track)})
//console.log(results)
const clearTable = (tableName) => {
    if(!tableName) return;
    let deleteData = db.prepare('DELETE FROM ' + tableName);
    deleteData.run();
};
//clearTable('artists');
const updateNewTracks = () => {
    let yearDate = new Date('2018-01-01').getTime() / 1000;
    let getTracksDB = db.prepare('SELECT * FROM Tracks');
    let checkNew = db.prepare('SELECT * FROM Tracks WHERE track_date < $this_date AND track_artist_name = $this_artist AND track_name = $this_name');
    let updateNew = db.prepare('UPDATE Tracks SET track_new = 1 WHERE track_id = $track_id');
    let results = getTracksDB.all();
    let newTracks = 0;
    results.map(result => {
        let tracks = checkNew.all({
            this_date: result.track_date,
            this_artist: result.track_artist_name,
            this_name: result.track_name
        });
        if (tracks.length < 1) {
            updateNew.run({track_id: result.track_id});
            newTracks++;
        }
        if (newTracks % 100 == 0) console.log("Updated tracks: ", newTracks);
    });
};
let getArtists = db.prepare("SELECT DISTINCT track_artist_name FROM Tracks");
let artists = getArtists.all();
const insertArtist = (artists, index) => {
let insertArtistDB = db.prepare('INSERT INTO artists (artist_name, artist_mbid, artist_url, artist_image, artist_tags) VALUES ($artist_name, $artist_mbid, $artist_url, $artist_image, $artist_tags)');
    fetch(
        "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" +
         encodeURIComponent(artists[index].track_artist_name) +
        "&api_key=" +
        API_KEY +
        "&format=json",
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }
    )
        .then(response => response.json())
        .then(r => {
            if(!r.error) {
                let data = {};
                data.artist_name = r.artist.name;
                data.artist_mbid = r.artist.mbid || null;
                data.artist_url = r.artist.url || null;
                data.artist_image = r.artist.image[3]['#text'] || null;
                data.artist_tags =  JSON.stringify(r.artist.tags.tag.map(tag => tag.name)) || null;
                console.log(insertArtistDB.run(data), data.artist_name);
            }
            let nextIndex = index+1;
            setTimeout( () => { insertArtist(artists, nextIndex); }, 250)
        });
};
//insertArtist(artists, 0)
let getAlbums = db.prepare("SELECT DISTINCT track_album, track_artist_name FROM Tracks");
let albums = getAlbums.all();
const insertAlbums = (albums, index) => {
    let insertAlbumDB = db.prepare("INSERT INTO albums (album_name, album_artist, album_mbid, album_image, album_tags) VALUES ($album_name, $album_artist, $album_mbid, $album_image, $album_tags)");
    let insertTracksDB = db.prepare("INSERT INTO album_tracks (album_id, album_name, artist_name, artist_mbid, album_track_name, track_url, track_duration) VALUES ($album_id, $album_name, $artist_name, $artist_mbid, $album_track_name, $track_url, $track_duration)");
    fetch(
        "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" +
         encodeURIComponent(albums[index].track_artist_name) +
        "&album=" +
        encodeURIComponent(albums[index].track_album) +
        "&api_key=" +
        API_KEY +
        "&format=json",
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }
    )
    .then(response => response.json())
    .then(r => {
        if(!r.error) {
            let album_local_id;
            let data = {};
            data.album_name = r.album.name;
            data.album_artist = r.album.artist || null;
            data.album_mbid = r.album.mbid || null;
            data.album_url = r.album.url || null;
            data.album_image = r.album.image[3]['#text'] || null;
            data.album_tags =  JSON.stringify(r.album.tags.tag.map(tag => tag.name)) || null;
            let response = insertAlbumDB.run(data);
            album_local_id = response.lastInsertROWID;
            console.log(response, data.album_artist, " - ", data.album_name);
            if(r.album.tracks.track) {
                r.album.tracks.track.map(track => {
                    let trackData = {};
                    trackData.album_id = album_local_id;
                    trackData.album_name = data.album_name;
                    trackData.artist_name = track.artist.name || data.album_artist;
                    trackData.artist_mbid = track.artist.mbid || null;
                    trackData.album_track_name = track.name;
                    trackData.track_url = track.url || null;
                    trackData.track_duration = track.duration || 0;
                    console.log(insertTracksDB.run(trackData), trackData.artist_name, " - ", trackData.album_track_name)
                });
            }
        }
        let newIndex = index + 1;
        setTimeout(() => {insertAlbums(albums, newIndex)}, 250)
    })
};
//insertAlbums(albums,0);
let allTracksDB = db.prepare("SELECT * FROM tracks WHERE local_artist_id = 10");
console.log(allTracksDB.all());
export default db;
