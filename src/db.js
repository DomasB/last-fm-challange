const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const db = new Database('database/last-fm.db');

const USER = 'briediz';
const API_KEY = '';

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
let getAlbums = db.prepare("SELECT * FROM albums WHERE album_url IS NULL");
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
let albums = getAlbums.all();
let updateAlbum = db.prepare("UPDATE albums SET album_url = $url WHERE album_id = $id")
const updateAlbums = (albums, index) => {
        let album_url;
        let API_url;
        let album = albums[index];
        let id = album.album_id;
        if (album.album_mbid) {
            API_url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&mbid=" + album.album_mbid + "&api_key=" + API_KEY + "&format=json";
        } else {
            API_url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + encodeURIComponent(album.album_artist) + "&album=" + encodeURIComponent(album.album_name) + "&api_key=" + API_KEY + "&format=json";
        }
        fetch(
            API_url,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }
        )
            .then(response => response.json())
            .catch(error => {
                console.error('Error:', error, "failed to update index: ", index)
                let newIndex = index + 1;
                setTimeout(function(){updateAlbums(albums, newIndex)},250)
            })
            .then(r => {
                if(r.album.url) {
                    updateAlbum.run({id, url: r.album.url})
                }
                if(index % 100 == 0) console.log("Updated ", index, "/", albums.length)
                let newIndex = index + 1;
                setTimeout(function(){updateAlbums(albums, newIndex)},250)
            })
};

const updateAlbumTrackIds = () => {
    let getAllTracks = db.prepare("SELECT * FROM tracks WHERE local_album_track_id IS NULL AND track_date > $latest ORDER BY track_date DESC");
    const getLatestTrackDate = db.prepare("SELECT track_date FROM tracks ORDER BY track_date DESC LIMIT 1");
    const latest = parseInt(getLatestTrackDate.get().track_date)-6000;
    let allTracksArray = getAllTracks.all({latest});
    let findLocalId = db.prepare("SELECT album_track_id FROM album_tracks WHERE album_id = $album_id AND album_track_name = $album_track_name COLLATE NOCASE")
    let updatetrack = db.prepare("UPDATE tracks SET local_album_track_id = $trackId WHERE track_id = $id")
    allTracksArray.map((track, index) => {
        let trackId = findLocalId.get({ album_id: track.local_album_id, album_track_name: track.track_name });
        if(trackId) updatetrack.run({ trackId: trackId.album_track_id, id: track.track_id })
        if(index % 100 === 0) console.log(index, "/", allTracksArray.length);
    });
};
//updateAlbumTrackIds();
const addArtistIds = () => {
    let getAlbums = db.prepare("SELECT * FROM albums WHERE album_artist_id IS NULL");
    let findArtist = db.prepare("SELECT artist_id, artist_name FROM artists WHERE artist_name = $artist_name");
    let updateAlbum = db.prepare("UPDATE albums SET album_artist_id = $artist_id WHERE album_id = $album_id");
    let allAlbums = getAlbums.all();
    allAlbums.map((album, index) => {
        let artist = findArtist.get({artist_name: album.album_artist});
        console.log(album, artist)
        let artistId = artist.artist_id;
        updateAlbum.run({artist_id: artistId, album_id: album.album_id});
        if(index % 100 === 0) console.log(index, "/", allAlbums.length)
    });
};
//addArtistIds();
const findCompleted = (year) => {
    let getInfo = db.prepare('SELECT artist_id, artist_name, album_track_id, plays, first_play FROM artists LEFT JOIN (SELECT album_id, album_artist_id, group_concat(album_id || \':\' ||album_track_id) AS album_track_id, group_concat(album_id||\':\'||album_track_id||\':\'||first_play) AS plays, min(first_play) AS first_play FROM albums al LEFT JOIN (SELECT album_id AS album_track_album_id, album_track_id FROM album_tracks ) ON al.album_id = album_track_album_id LEFT JOIN (SELECT local_album_track_id, min(track_date) AS first_play FROM tracks GROUP BY local_album_track_id) ON album_track_id = local_album_track_id GROUP BY album_artist_id) ON artist_id = album_artist_id WHERE first_play > $year LIMIT 100 OFFSET 0')
    let info = getInfo.all({year});
    info.map(artist => {
        let completed = false;
        let albums = artist.album_track_id.split(',');
        let plays = artist.plays.split(',');
        plays = plays.map(play => {
            let data = play.split(':');
            return {albumId: parseInt(data[0]),  trackId: parseInt(data[1]), firstPlay: parseInt(data[2])}
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
            if(!found) completed = true;
        });
        artist.completed = completed;
    })
    console.log(info)
};
//findCompleted(1514764800);
const updateAlbumIds = () => {
    let getAllTracks = db.prepare("SELECT * FROM tracks ORDER BY track_date DESC");
    let allTracksArray = getAllTracks.all();
    let findLocalId = db.prepare("SELECT album_id FROM albums WHERE album_artist = $album_artist COLLATE NOCASE AND album_name = $album_name COLLATE NOCASE")
    let updatetrack = db.prepare("UPDATE tracks SET local_album_id = $trackId WHERE track_id = $id");
    let updated = 0;
    allTracksArray.map((track, index) => {
        let trackId = findLocalId.get({ album_name: track.track_album, album_artist: track.track_artist_name });
        if(trackId) {
            updatetrack.run({trackId: trackId.album_id, id: track.track_id});
            updated++
        }
        if(index % 100 === 0) console.log(updated, "/", index, "/", allTracksArray.length);
    });
};
//updateAlbumIds();
const getTags = () => {
    let getArtistTags = db.prepare("SELECT DISTINCT artist_tags FROM artists");
    let getAlbumTags = db.prepare("SELECT DISTINCT album_tags FROM albums");
    let getTags = db.prepare("SELECT tag_id FROM tags WHERE tag_name = $name");
    let insertTag = db.prepare("INSERT INTO tags (tag_name) VALUES ($name)");
    let artistTags = getArtistTags.all();
    let tagsAdded = 0;
    artistTags.map((taglist, index) => {
        let tags = JSON.parse(taglist.artist_tags);
        tags.map(tag =>{
            let inDB = getTags.get({name: tag});
            if (!inDB) {
                insertTag.run({name: tag});
                tagsAdded++;
            }
        })
        if(index % 100 === 0) console.log("Added tags:", tagsAdded);
    });
    let albumTags = getAlbumTags.all();
    albumTags.map((taglist, index) => {
        let tags = JSON.parse(taglist.album_tags);
        tags.map(tag =>{
            let inDB = getTags.get({name: tag});
            if (!inDB) {
                insertTag.run({name: tag});
                tagsAdded++;
            }
        })
        if(index % 100 === 0) console.log("Added tags:", tagsAdded);
    })
};
//getTags();
const updateTags = () => {
    let getCount = db.prepare("SELECT group_concat(artist_id), artist_tags, sum(playcount) as playcount FROM artists LEFT JOIN (SELECT count(track_id) AS playcount, local_artist_id FROM tracks GROUP BY local_artist_id) ON artist_id = local_artist_id WHERE artist_tags LIKE '%\"' || $name || '\"%' ")
    let selectAllTags = db.prepare("SELECT tag_id, tag_name FROM tags");
    let updateTags = db.prepare("UPDATE tags SET play_count = $play_count WHERE tag_id = $id");
    let allTags = selectAllTags.all();
    let updated = 0;
    allTags.map((tag, index) => {
        let count = getCount.get({name: tag.tag_name}).playcount;
        if(count) updateTags.run({play_count: count, id: tag.tag_id}) && updated++;
        if(index % 100 === 0) console.log("Updated", updated, "/", allTags.length);
    })
};
updateTags();
