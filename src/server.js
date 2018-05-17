const express = require('express');
const app = express();
const Database = require('better-sqlite3');
const fetch = require('node-fetch');
const db = new Database('database/last-fm.db');

const USER = 'briediz';
const API_KEY = 'e054746cf363b1b4d0f42a5b587054dc';

const getArtistById = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
const getArtistByName = db.prepare("SELECT * FROM artists WHERE artist_name = $name");
const getAlbumsByArtist = db.prepare("SELECT * FROM albums a LEFT JOIN (SELECT group_concat(album_track_id) as album_track_ids, album_id as track_album_id FROM album_tracks t GROUP BY track_album_id ) ON a.album_id = track_album_id LEFT JOIN (SELECT group_concat(local_album_track_id) as tracks_ids, local_album_id FROM (SELECT DISTINCT local_album_track_id, local_album_id FROM tracks ORDER BY local_album_track_id ASC) GROUP BY local_album_id) ON a.album_id = local_album_id LEFT JOIN (SELECT track_date AS first_play, local_album_id AS fp_local_album_id FROM tracks GROUP BY fp_local_album_id ORDER BY first_play ASC) ON a.album_id = fp_local_album_id WHERE a.album_artist = $name");
const getAlbums = db.prepare("SELECT * FROM albums a LEFT JOIN (SELECT group_concat(album_track_id) as album_track_ids, album_id as track_album_id FROM album_tracks t GROUP BY track_album_id ) ON a.album_id = track_album_id LEFT JOIN (SELECT group_concat(local_album_track_id) as tracks_ids, local_album_id FROM (SELECT DISTINCT local_album_track_id, local_album_id FROM tracks ORDER BY local_album_track_id ASC) GROUP BY local_album_id) ON a.album_id = local_album_id LEFT JOIN (SELECT min(track_date) AS first_play, local_album_id AS fp_local_album_id FROM tracks GROUP BY fp_local_album_id) ON a.album_id = fp_local_album_id ORDER BY first_play DESC LIMIT $limit OFFSET $offset");
const getAlbumById = db.prepare("SELECT * FROM albums a LEFT JOIN (SELECT  album_id AS track_album_id, album_track_name, album_track_id, track_url, track_duration FROM album_tracks t) ON a.album_id = track_album_id LEFT JOIN (SELECT COUNT(track_id) AS play_count, min(track_date) AS first_play, local_album_track_id FROM tracks GROUP BY local_album_track_id) ON local_album_track_id = album_track_id WHERE a.album_id = $id");
const getMissingTracks = db.prepare("SELECT *, group_concat(track_id) AS track_ids FROM tracks WHERE (local_album_id IS NULL OR local_album_track_id IS NULL ) AND local_artist_id = $id GROUP BY track_name")
const getAlbumByName = db.prepare("SELECT * FROM albums WHERE album_name = $name AND album_artist = $artist");
const getArtists = db.prepare("SELECT * FROM artists LEFT JOIN (SELECT  min(track_date) AS first_play, local_artist_id FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id ORDER BY first_play DESC LIMIT $limit OFFSET $offset");
const getArtistCount = db.prepare("SELECT COUNT(artist_id) FROM artists");
const getArtistsByTag = db.prepare("SELECT artist_id, artist_name, first_play, artist_tags FROM artists LEFT JOIN (SELECT local_artist_id, min(track_date) AS first_play FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id WHERE artist_tags LIKE '%' || $tag || '%' ORDER BY first_play DESC")
const getCompletedArtists = db.prepare('SELECT artist_id, artist_name, album_track_id, plays, fp AS first_play FROM artists LEFT JOIN (SELECT album_id, album_artist_id, group_concat(album_id || \':\' ||album_track_id) AS album_track_id, group_concat(album_id||\':\'||album_track_id||\':\'||first_play) AS plays, min(first_play) AS first_play FROM albums al LEFT JOIN (SELECT album_id AS album_track_album_id, album_track_id FROM album_tracks ) ON al.album_id = album_track_album_id LEFT JOIN (SELECT local_album_track_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_track_id) ON album_track_id = local_album_track_id GROUP BY album_artist_id) ON artist_id = album_artist_id LEFT JOIN (SELECT min(track_date) AS fp, local_artist_id FROM tracks GROUP BY local_artist_id) ON local_artist_id = artist_id WHERE fp > $year ORDER BY fp DESC');
const getAlbumCount = db.prepare("SELECT COUNT(album_id) FROM albums");
const getAlbumsByTag = db.prepare("SELECT album_id, album_name, album_artist, first_play, album_tags FROM albums LEFT JOIN (SELECT local_album_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_id) ON album_id = local_album_id WHERE album_tags LIKE '%' || $tag || '%' ORDER BY first_play DESC");
const getLatestTrackDate = db.prepare("SELECT track_date FROM tracks ORDER BY track_date DESC LIMIT 1");
const checkNewTrack = db.prepare("SELECT * FROM Tracks WHERE track_date < $track_date AND track_artist_name = $track_artist_name AND track_name = $track_name");
const insertArtist = db.prepare("INSERT INTO artists (artist_name, artist_mbid, artist_url, artist_image, artist_tags) VALUES ($artist_name, $artist_mbid, $artist_url, $artist_image, $artist_tags)");
const insertAlbum = db.prepare("INSERT INTO albums (album_name, album_artist, album_mbid, album_image, album_tags, album_url, album_artist_id) VALUES ($album_name, $album_artist, $album_mbid, $album_image, $album_tags, $album_url, $album_artist_id)");
const insertAlbumTracks = db.prepare("INSERT INTO album_tracks (album_id, album_name, artist_name, artist_mbid, album_track_name, track_url, track_duration) VALUES ($album_id, $album_name, $artist_name, $artist_mbid, $album_track_name, $track_url, $track_duration)");
const insertTrack = db.prepare("INSERT INTO tracks (track_name, track_artist_name, track_artist_mbid, track_album, track_url, track_image, track_date, track_new, local_artist_id, local_album_id) VALUES ($track_name, $track_artist_name, $track_artist_mbid, $track_album, $track_url, $track_image, $track_date, $track_new, $local_artist_id, $local_album_id)")
const updateLocalTrackId = db.prepare("UPDATE tracks SET local_album_track_id = $local_album_track_id WHERE track_id = $track_id");
const getAllTracksWithLimit = db.prepare("SELECT * FROM tracks WHERE local_album_track_id IS NULL AND track_date > $latest ORDER BY track_date DESC");
const findLocalId = db.prepare("SELECT album_track_id FROM album_tracks WHERE album_id = $album_id AND album_track_name = $album_track_name COLLATE NOCASE");
const updateTrack = db.prepare("UPDATE tracks SET local_album_track_id = $trackId WHERE track_id = $id");

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
app.get('/api/artistsbytag/:tag', (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    let artists = getArtistsByTag.all({tag});
    if(!artists) artists = { error: "No artist found by tag " + tag };
    res.json(artists);
});

app.get('/api/albumsbyartist/:name', (req, res) => {
    let artist = req.params.name;
    let albums = getAlbumsByArtist.all({name: artist});
    if(!albums) albums = {error: "No albums found for artist " + artist};
    res.json(albums);
});
app.get('/api/albumsbytag/:tag', (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    let albums = getAlbumsByTag.all({tag});
    if(!albums) albums = { error: "No albums found by tag " + tag };
    res.json(albums);
});

app.get('/api/album/:id', (req, res) => {
    let album = [];
    if (!isNaN(parseInt(req.params.id))) {
        album = getAlbumById.all({id:req.params.id});
    }
    if(!album) album = [{ error: "No album found by id " + req.params.id }];
    res.json(album);
});
app.get('/api/missing/:id', (req, res) => {
    let tracks = [];
    if (!isNaN(parseInt(req.params.id))) {
        tracks = getMissingTracks.all({id:req.params.id});
    }
    if(tracks.length === 0) tracks = [{ error: "No missing tracks found for artist id " + req.params.id }];
    res.json(tracks);
});
app.get('/api/maptracks/:albumtrack/:tracks', (req, res) => {
    let local_album_track_id = req.params.albumtrack;
    let tracks = req.params.tracks.split(',');
    tracks.map(track => {
        updateLocalTrackId.run({local_album_track_id, track_id: parseInt(track)})
    })
    res.json(tracks);
});
app.get('/api/artists/:limit/:page', (req, res) => {
    let limit = req.params.limit;
    let offset = (req.params.page-1)*limit;
    let artists = getArtists.all({limit, offset});
    if(!artists) {
        artists = {error: "No more artists found"}
    };
    let artistCount = getArtistCount.get()["COUNT(artist_id)"];
    let totalPages = Math.ceil(artistCount/limit);
    res.json({total: artistCount, page: parseInt(req.params.page), totalPages, artists});
});
app.get('/api/completedartists/:year', (req, res) => {
    let year = parseInt(req.params.year);
    let artists = getCompletedArtists.all({year});
    artists.map(artist => {
        if(artist.plays && artist.album_track_id) {
            let completed = false;
            let albums = artist.album_track_id.split(',');
            let plays = artist.plays.split(',');
            plays = plays.map(play => {
                let data = play.split(':');
                return {albumId: parseInt(data[0]), trackId: parseInt(data[1]), firstPlay: parseInt(data[2])}
            });
            albums = albums.map(album => {
                let data = album.split(':');
                let found = plays.find(item => item.albumId == parseInt(data[0]) && item.trackId == parseInt(data[1]) && item.firstPlay > year);
                let completed = found ? true : false;
                return {albumId: parseInt(data[0]), trackId: parseInt(data[1]), completed}
            });
            albums.map(album => {
                let oneAlbum = albums.filter(item => item.albumId == album.albumId);
                let found = oneAlbum.find(item => item.completed == false);
                if (!found) completed = true;
            });
            artist.completed = completed;
            delete artist.album_track_id;
            delete artist.plays;
        }
    })
    if(!artists) {
        artists = {error: "No more artists found"}
    };
    let completedArtists = artists.filter(artist => artist.completed).length;
    res.json({completedArtists, artists});
});
app.get('/api/albums/:limit/:page', (req, res) => {
    let limit = req.params.limit;
    let offset = (req.params.page-1)*limit;
    let albums = getAlbums.all({limit, offset});
    if(!albums) {
        albums = {error: "No more artists found"}
    };
    let albumCount = getAlbumCount.get()["COUNT(album_id)"];
    let totalPages = Math.ceil(albumCount/limit);
    res.json({total: albumCount, page: parseInt(req.params.page), totalPages, albums});
});
app.get('/api/triggerupdate', (req, res) => {
    const latest = parseInt(getLatestTrackDate.get().track_date)+1;
    const limit = 200;
    const allTracks = [];
    callUpdate(latest, limit, 1, allTracks, res);
});
const callUpdate = (latest, limit, page, allTracks, res) => {
    updateDatabase(latest, limit, page, allTracks)
        .then( result => {
            if(result.finished) {
                callInsertTracks(result.array, 0, latest, res);
            } else {
                let newPage = result.page + 1;
                callUpdate(latest, limit, newPage, result.array, res);
            }
        });
};
const callInsertTracks = (array, index, latest, res) => {
    insertTracks(array, index)
        .then(index => {
            if(array.length > index+1) {
                let newIndex = index + 1;
                callInsertTracks(array, newIndex, latest, res);
            } else {
                updateAlbumTrackIds(latest);
                console.log("Done!")
                res.json({status: "Done!", updated: array.length})
            }
        })
}
async function updateDatabase(latest, limit, page, allTracks) {
   return new Promise(resolve => {
       fetch(
           "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" +
           USER +
           "&api_key=" +
           API_KEY +
           "&limit=" +
           limit +
           "&page=" +
           page +
           "&from=" +
           latest +
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
               r.recenttracks.track.map((track, index) => {
                   if (!track["@attr"]) {
                       allTracks.push(track);
                   }
               });
               if (parseInt(r.recenttracks['@attr'].totalPages) != page && allTracks.length > 0) {
                   resolve({ finished: false, array: allTracks, page });
               } else {
                   resolve({ finished: true, array: allTracks, page });
               }
           });
   });
};
async function getLocalIds(localArtist, localAlbum, artist, album, delay) {
    return new Promise(resolve => {
        if (localArtist && localAlbum) {
            resolve({local_artist_id: localArtist.artist_id, local_album_id: localAlbum.album_id});
        } else if(localArtist) {
            updateAlbum(album, delay, localArtist.artist_id).then(localAlbumId => {
                resolve({local_artist_id: localArtist.artist_id, local_album_id: localAlbumId});
            });
        } else {
            updateArtist(artist, delay).then(localArtistId => {
                updateAlbum(album, delay + 100, localArtistId).then(localAlbumId => {
                    resolve({local_artist_id: localArtistId, local_album_id: localAlbumId});
                });
            });
        }
    });
}
async function updateArtist(artist, delay) {
        let url ="http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=" + API_KEY + "&format=json";
        if(artist.artist_mbid) {
            url += "&mbid=" + artist.artist_mbid;
        } else {
            url += "&artist=" + encodeURIComponent(artist.artist_name);
        }

        return new Promise(resolve => {
           setTimeout(function() {
               fetch(
                url,
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
                    if(r.error) {
                        resolve(null)
                    } else {
                        let artistID = insertArtist.run({
                            artist_name: r.artist.name || artist.artist_name,
                            artist_mbid: r.artist.mbid || artist.artist_mbid || null,
                            artist_url: r.artist.url || null,
                            artist_image: r.artist.image[3]['#text'] || null,
                            artist_tags: JSON.stringify(r.artist.tags.tag.map(tag => tag.name)) || null,
                        });
                        resolve(artistID.lastInsertROWID);
                    }
                });
           }, delay);
        });
}
async function updateAlbum(album, delay, artistId) {
    let url ="http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=" + API_KEY + "&format=json";
    if(album.album_mbid) {
        url += "&mbid=" + album.album_mbid;
    } else {
        url += "&album=" + encodeURIComponent(album.album_name) + "&artist=" + encodeURIComponent(album.album_artist);
    }

    return new Promise(resolve => {
        setTimeout(function() {
            fetch(
                url,
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
                    if(r.error) {
                        resolve(null)
                    } else {
                        let albumID = insertAlbum.run({
                            album_name: r.album.name || album.album_name,
                            album_artist: r.album.artist || album.album_artist,
                            album_mbid: r.album.mbid || album.album_mbid || null,
                            album_image: r.album.image[3]['#text'] || null,
                            album_tags:  JSON.stringify(r.album.tags.tag.map(tag => tag.name)) || null,
                            album_url: r.album.url || null,
                            album_artist_id: artistId || null
                        });
                        if(r.album.tracks.track) {
                            r.album.tracks.track.map(track => {
                                let trackData = {};
                                trackData.album_id = albumID.lastInsertROWID;
                                trackData.album_name = r.album.name || album.album_name;
                                trackData.artist_name = track.artist.name || r.album.artist || album.album_artist;
                                trackData.artist_mbid = track.artist.mbid || null;
                                trackData.album_track_name = track.name;
                                trackData.track_url = track.url || null;
                                trackData.track_duration = track.duration || 0;
                                insertAlbumTracks.run(trackData);
                            });
                        }
                        resolve(albumID.lastInsertROWID);
                    }
                });
        }, delay);
    });
};
async function insertTracks(tracks, index) {
    return new Promise( resolve => {
        delay = 100;
        if(tracks.length == 0) resolve(9999999999);
        let track = tracks[index];
        let track_name = track.name;
        let track_artist_name = track.artist['#text'];
        let track_artist_mbid = track.artist.mbid || null;
        let track_album = track.album['#text'] || null;
        let track_album_mbid = track.album.mbid || null;
        let track_url = track.url || null;
        let track_image = track.image[3]['#text'] || null;
        let track_date = track.date.uts;
        let olderTracks = checkNewTrack.get({track_date, track_artist_name, track_name});
        let track_new = olderTracks ? 0 : 1;

        let localArtist = getArtistByName.get({name: track_artist_name});
        let localAlbum = getAlbumByName.get({name: track_album, artist: track_artist_name});
        if (!localArtist || !localAlbum) delay = delay + 250;
        getLocalIds(localArtist, localAlbum, {
            artist_name: track_artist_name,
            artist_mbid: track_artist_mbid,
            firstPlay: track_date
        }, {
            album_name: track_album,
            album_artist: track_artist_name,
            album_mbid: track_album_mbid,
            firstPlay: track_date
        }, delay)
            .then(localIds => {
                let local_artist_id = localIds.local_artist_id;
                let local_album_id = localIds.local_album_id;
                insertTrack.run({track_name, track_artist_name, track_artist_mbid, track_album, track_url, track_image, track_date, track_new, local_artist_id, local_album_id})
                resolve(index);
            });
    });
};
const updateAlbumTrackIds = (latest) => {
    let allTracksArray = getAllTracksWithLimit.all({latest});
    allTracksArray.map((track, index) => {
        let trackId = findLocalId.get({ album_id: track.local_album_id, album_track_name: track.track_name });
        if(trackId) updateTrack.run({ trackId: trackId.album_track_id, id: track.track_id })
        if(index % 100 === 0) console.log(index, "/", allTracksArray.length);
    });
};
app.listen(3000, () => console.log('Example app listening on port 3000!'));
