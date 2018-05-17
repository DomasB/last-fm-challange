<template>
    <div>
        <div v-if="data.error">{{data.error}}</div>
        <div v-else>
            <h1><a :href="data.artist_url" target="_blank">{{data.artist_name}}</a></h1>
            <img :src="data.artist_image" class="artist-image" />
            <ul class="artist-tag-list">
                <li v-for="tag in data.artist_tags"><router-link :to="'/tag/'+encodeURIComponent(tag)">{{tag}}</router-link></li>
            </ul>
            <h2>Albums</h2>
            <div class="album-list">
                    <Album
                            v-for="album in albums"
                            :key="album.album_id"
                            :albumId="album.album_id"
                            :title="album.album_name"
                            :image="album.album_image"
                            :tags="album.album_tags"
                            :firstPlay="album.first_play"
                            :albumTracks="album.album_track_ids"
                            :playedTracks="album.tracks_ids"
                    ></Album>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import Album from "@/components/Album.vue";
const fetch = require('node-fetch');
export default {
  name: "artist",
    data () {
        return {
            data: {},
            albums: []
        }
    },
    props: ["id"],
    beforeRouteEnter (to, from, next) {
      //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.setData(to.params.id));
      //getArtistDB.get({id:this.id});
    },
    beforeRouteUpdate (to, from, next) {
        //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.setData(to.params.id));
        //getArtistDB.get({id:this.id});
    },
    watch: {
        id: {
            handler: function(id) {
                this.setData(id);
            },
            deep: true
        }
    },
    methods: {
      setData (id) {
          fetch(
              "http://localhost:3000/api/artist/" + id,
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
                      r.artist_tags = JSON.parse(r.artist_tags);
                      this.getAlbums(r.artist_name);
                  }
                  this.data = r;
              });
      },
        getAlbums (name) {
            fetch(
                "http://localhost:3000/api/albumsbyartist/" + encodeURIComponent(name),
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
                    this.albums = r;
                });
        }
    },
    components: {
      Album
    }
};
</script>

<style scoped>
    .artist-image {
        box-shadow: rgba(0, 0, 0, 0.42) 3px 3px 7px 0px;
    }
    .artist-tag-list {
        list-style: none;
        display: inline-block;
        text-align: left;
        font-size: 18px;
        margin: 0px;
        vertical-align: top;
        padding: 0px 10px;
    }
    .album-list {
        margin: 0 auto;
        max-width: 1000px;
    }
    .album-item {
        display: inline-block;
        margin-top: 15px;
        float: center;
        width: 250px;
    }
</style>
