<template>
    <div>
        <div v-if="data.error">{{data.error}}</div>
        <div v-else>
        <h1><a :href="data.artist_url">{{data.artist_name}}</a></h1>
        <img :src="data.artist_image" class="artist-image" />
        <p v-for="tag in data.artist_tags">{{tag}}</p>
        <p v-for="album in albums">
            <Album :albumId="album.album_id" :title="album.album_name" :image="album.album_image" :tags="album.album_tags"></Album>
        </p>
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

<style>
    .artist-image {
        width:180px;
        height:180px;
    }
</style>
