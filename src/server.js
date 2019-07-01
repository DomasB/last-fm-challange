const express = require('express');
const app = express();
const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const db = new Database('./src/database/last-fm.db');

const USER = 'briediz';
const API_KEY = 'e054746cf363b1b4d0f42a5b587054dc';

const getArtistById = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
const getArtistByName = db.prepare("SELECT * FROM artists WHERE artist_name = $name");
const getArtistInfo = db.prepare("SELECT artist_id, artist_name, artist_image, artist_url, artist_tags, album_id, album_name, album_image, album_url, album_tags, album_track_ids, track_ids, first_play FROM artists \n" +
    "LEFT JOIN (SELECT album_id, album_name, album_image, album_url, album_tags, album_artist_id FROM albums) ON artist_id = album_artist_id\n" +
    "LEFT JOIN (SELECT group_concat(album_track_id) as album_track_ids, album_id AS track_album_id FROM album_tracks GROUP BY track_album_id) ON album_id = track_album_id\n" +
    "LEFT JOIN (SELECT group_concat(local_album_track_id) as track_ids, local_album_id FROM \n" +
    "(SELECT DISTINCT local_album_track_id, local_album_id FROM tracks ORDER BY local_album_track_id ASC) GROUP BY local_album_id) ON album_id = local_album_id \n" +
    "LEFT JOIN (SELECT track_date AS first_play, local_album_id AS fp_local_album_id FROM tracks GROUP BY fp_local_album_id ORDER BY first_play ASC) ON album_id = fp_local_album_id\n" +
    "WHERE artist_id = $id");
const getAlbums = db.prepare("SELECT album_id, album_name, album_mbid, album_artist, album_image, album_tags, album_url, album_artist_id, tracks_ids, album_track_ids, first_play FROM albums a LEFT JOIN (SELECT group_concat(album_track_id) as album_track_ids, album_id as track_album_id FROM album_tracks t GROUP BY track_album_id ) ON a.album_id = track_album_id LEFT JOIN (SELECT group_concat(local_album_track_id) as tracks_ids, local_album_id FROM (SELECT DISTINCT local_album_track_id, local_album_id FROM tracks ORDER BY local_album_track_id ASC) GROUP BY local_album_id) ON a.album_id = local_album_id LEFT JOIN (SELECT min(track_date) AS first_play, local_album_id AS fp_local_album_id FROM tracks GROUP BY fp_local_album_id) ON a.album_id = fp_local_album_id ORDER BY first_play DESC LIMIT $limit OFFSET $offset");
const getAlbumById = db.prepare("SELECT * FROM albums WHERE album_id = $id");
const getAlbumTracksById = db.prepare("SELECT  album_id , album_track_name, album_track_id, track_url, track_duration, play_count, first_play FROM album_tracks t LEFT JOIN (SELECT COUNT(track_id) AS play_count, min(track_date) AS first_play, local_album_track_id FROM tracks GROUP BY local_album_track_id) ON local_album_track_id = album_track_id WHERE album_id = $id");
const getMissingTracks = db.prepare("SELECT *, group_concat(track_id) AS track_ids FROM tracks WHERE (local_album_id IS NULL OR local_album_track_id IS NULL ) AND local_artist_id = $id GROUP BY track_name")
const getAlbumByName = db.prepare("SELECT * FROM albums WHERE album_name = $name AND album_artist = $artist");
const getArtists = db.prepare("SELECT * FROM artists LEFT JOIN (SELECT  min(track_date) AS first_play, local_artist_id FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id ORDER BY first_play DESC LIMIT $limit OFFSET $offset");
const getArtistCount = db.prepare("SELECT COUNT(artist_id) FROM artists");
const getArtistsByTag = db.prepare("SELECT artist_id, artist_name, first_play, artist_tags FROM artists LEFT JOIN (SELECT local_artist_id, min(track_date) AS first_play FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id WHERE artist_tags LIKE '%' || $tag || '%' ORDER BY first_play DESC")
const getCompletedArtists = db.prepare('SELECT artist_id, artist_name, album_track_id, plays, fp AS first_play FROM artists LEFT JOIN (SELECT album_id, album_artist_id, group_concat(album_id || \':\' ||album_track_id) AS album_track_id, group_concat(album_id||\':\'||album_track_id||\':\'||first_play) AS plays, min(first_play) AS first_play FROM albums al LEFT JOIN (SELECT album_id AS album_track_album_id, album_track_id FROM album_tracks ) ON al.album_id = album_track_album_id LEFT JOIN (SELECT local_album_track_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_track_id) ON album_track_id = local_album_track_id GROUP BY album_artist_id) ON artist_id = album_artist_id LEFT JOIN (SELECT min(track_date) AS fp, local_artist_id FROM tracks GROUP BY local_artist_id) ON local_artist_id = artist_id WHERE fp > $year ORDER BY fp DESC');
const getCompletedArtistsFinal = db.prepare('SELECT artist_id, artist_name, album_track_id, artist_image, artist_url, plays, fp AS first_play FROM artists LEFT JOIN (SELECT album_id, album_artist_id, group_concat(album_id || \':\' ||album_track_id) AS album_track_id, group_concat(album_id||\':\'||album_track_id||\':\'||first_play) AS plays, min(first_play) AS first_play FROM albums al LEFT JOIN (SELECT album_id AS album_track_album_id, album_track_id FROM album_tracks ) ON al.album_id = album_track_album_id LEFT JOIN (SELECT local_album_track_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_track_id) ON album_track_id = local_album_track_id GROUP BY album_artist_id) ON artist_id = album_artist_id LEFT JOIN (SELECT min(track_date) AS fp, local_artist_id FROM tracks GROUP BY local_artist_id) ON local_artist_id = artist_id WHERE fp > $year ORDER BY fp DESC');
const getAlbumCount = db.prepare("SELECT COUNT(album_id) FROM albums");
const getAlbumsByTag = db.prepare("SELECT album_id, album_name, album_artist, album_artist_id, first_play, album_tags FROM albums LEFT JOIN (SELECT local_album_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_id) ON album_id = local_album_id WHERE album_tags LIKE '%' || $tag || '%' ORDER BY first_play DESC");
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
const getTags = db.prepare("SELECT * FROM tags WHERE play_count IS NOT NULL ORDER BY play_count DESC");
const getTagByName = db.prepare("SELECT * FROM tags WHERE tag_name = $name");
const updateTag = db.prepare("UPDATE tags SET tag_color = $tag_color,  tag_icon = $tag_icon WHERE tag_id = $id");
const insertTag = db.prepare("INSERT INTO tags (tag_name, tag_color, tag_icon, play_count) VALUES ($tag_name, $tag_color, $tag_icon, $play_count)");
const getTagPlayCount = db.prepare("SELECT group_concat(artist_id), artist_tags, sum(playcount) as playcount FROM artists LEFT JOIN (SELECT count(track_id) AS playcount, local_artist_id FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id WHERE artist_tags LIKE '%\"' || $tag_name || '\"%' ")

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static('dist'))
app.get('/api/artist/:id', (req, res) => {
    let artist = {};
    let artistInfo = getArtistInfo.all({id:req.params.id});
    if(artistInfo.length === 0) {
        artist.error = "No artist found by id " + req.params.id;
        res.json(artist);
    } else {
        artist.artist = {
            artist_id: artistInfo[0].artist_id,
            artist_image: artistInfo[0].artist_image,
            artist_name: artistInfo[0].artist_name,
            artist_url: artistInfo[0].artist_url,
            artist_tags: artistInfo[0].artist_tags
        };
        artist.albums = [];
        artistInfo.map(album => {
            artist.albums.push(
                {
                    album_id: album.album_id,
                    album_name: album.album_name,
                    album_image: album.album_image,
                    album_url: album.album_url,
                    album_artist: album.artist_name,
                    album_tags: album.album_tags,
                    album_completed: albumCompleted(album.track_ids, album.album_track_ids),
                    first_play: album.first_play
                }
            );
        });
        res.json(artist);
    }
});
app.get('/api/artistsbytag/:tag', (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    let artists = getArtistsByTag.all({tag});
    if(!artists) artists = { error: "No artist found by tag " + tag };
    res.json(artists);
});

app.get('/api/albumsbyartist/:id', (req, res) => {
    let id = req.params.id;
    let albums = getAlbumsByArtist.all({id});
    if(!albums) albums = {error: "No albums found for artist id " + id};
    res.json(albums);
});
app.get('/api/albumsbytag/:tag', (req, res) => {
    let tag = decodeURIComponent(req.params.tag);
    let albums = getAlbumsByTag.all({tag});
    if(!albums) albums = { error: "No albums found by tag " + tag };
    res.json(albums);
});

app.get('/api/album/:id', (req, res) => {
    let album = {};
    let tracks = [];
    let missing = [];
    let id = req.params.id;
    if (!isNaN(parseInt(req.params.id))) {
        album = getAlbumById.get({id});
        tracks = getAlbumTracksById.all({id});
        missing = getMissingTracks.all({id: album.album_artist_id});
    }
    if(!album) album = [{ error: "No album found by id " + req.params.id }];
    res.json({album, tracks, missing});
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
app.get('/api/completedartistsfinal/:year', (req, res) => {
    let year = parseInt(req.params.year);
    let artists = getCompletedArtistsFinal.all({year});
    let completedArtists = artists.filter(artist => {
      if(!artist.album_track_id || !artist.plays) return false
      let albums = {};
      artist.album_track_id.split(',').map(track => {
          let currentTrack = track.split(':');
          if(albums[currentTrack[0]]) {
            albums[currentTrack[0]].push(currentTrack[1])
          } else {
      albums[currentTrack[0]] = [currentTrack[1]]
          }
        });
      let listened = {};
      artist.plays.split(',').map(track => {
          let currentTrack = track.split(':');
          if(listened[currentTrack[0]]) {
            listened[currentTrack[0]].push([currentTrack[1], currentTrack[2]])
          } else {
            listened[currentTrack[0]] = [[currentTrack[1], currentTrack[2]]];
          }
        });
      let artistListened = false
    Object.keys(albums).forEach(album => {
      let listenedAlbum =albums[album].every(track => {
        if(listened[album] && listened[album].find(listenedTrack => listenedTrack[0] == track && listenedTrack[1] > year)) return true
      })
      if(listenedAlbum) {
        artist.album = getAlbumById.get({id:album})
        artistListened = true
      }
    })
    return artistListened
    });

    if(!artists) {
        artists = {error: "No more artists found"}
    };
    //let completedArtists = artists.filter(artist => artist.completed).length;
    res.json({count: completedArtists.length, artists:  completedArtists});
});
app.get('/api/albums/:limit/:page', (req, res) => {
    let limit = req.params.limit;
    let offset = (req.params.page-1)*limit;
    let albums = getAlbums.all({limit, offset});
    if(!albums) {
        albums = {error: "No more artists found"}
    } else {
        albums.map(album => {
            album.completed = albumCompleted(album.tracks_ids, album.album_track_ids);
            delete album.tracks_ids;
            delete album.album_track_ids;
        })
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
app.get('/api/gettags', (req, res) => {
    const tags = getTags.all();
    res.json(tags);
});
app.get('/api/gettagbyname/:name', (req, res) => {
    let name = decodeURIComponent(req.params.name);
    let tag = {}
    if (name) {
        tag = getTagByName.get({name});
    } else {
        tag = {error: "No name found in URL" }
    }
    if(tag) {
        res.json(tag);
    } else {
        res.json({error: "No tag found with name " + name});
    }

});
app.get('/api/updatetags/:id/:color/:icon/:name', (req, res) => {
    const id = parseInt(req.params.id);
    const tag_color = decodeURIComponent(req.params.color);
    const tag_icon = decodeURIComponent(req.params.icon);
    const tag_name = decodeURIComponent(req.params.name);
    const updateResult = updateTag.run({id, tag_color, tag_icon});
    if (updateResult.changes === 0) {
        const play_count = getTagPlayCount.get({tag_name}).playcount || 0;
        insertTag.run({tag_name, tag_color, tag_icon, play_count});
    }
    res.json({status: 'Done!'});
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
const albumCompleted = (playedTracks, albumTracks) => {
    if(!albumTracks || !playedTracks) return false;
    let albumArray = albumTracks.split(',');
    let playedArray = playedTracks.split(',');
    let isCompleted = true;
    albumArray.map(track => {
        if(playedArray.indexOf(track) < 0) isCompleted = false;
    });
    return isCompleted;
};
app.listen(3000, () => console.log('Example app listening on port 3000!'));
