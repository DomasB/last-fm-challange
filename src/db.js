const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const db = new Database('database/last-fm.db');

const USER = 'briediz';
const API_KEY = 'e054746cf363b1b4d0f42a5b587054dc';
//var a = db.prepare('CREATE TABLE tracks ( track_id integer PRIMARY KEY, track_name text NOT NULL, track_artist_name text NOT NULL, track_artist_mbid text, track_album text, track_url text, track_image text, track_date integer )')
//var a = db.prepare('SELECT name FROM sqlite_master WHERE type = "table"')
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
getTracks(1, 200);
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
//clearTable('Tracks');
