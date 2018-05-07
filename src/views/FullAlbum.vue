<template>
    <div>
        <div>{{data.album_name}} by <router-link :to="'/artist/' + data.album_artist">{{data.album_artist}}</router-link></div>
        <img :src="data.album_image" class="album-image"/>
        <ul>
            <li v-for="track in tracks">
                <a :href="track.track_url" target="_blank">{{track.album_track_name}}</a><span v-if="track.first_played"> first played {{new Date(track.first_played*1000)}}</span>
            </li>
        </ul>
    </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    export default {
        name: "fullAlbum",
        data () {
            return {
                data: {},
                tracks: []
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
                    "http://localhost:3000/api/album/" + id,
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
                            r.album_tags = JSON.parse(r.album_tags);
                            this.getTracks(id);
                        }
                        this.data = r;
                    });
            },
            getTracks(id) {
                fetch(
                    "http://localhost:3000/api/albumtracks/" + id,
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
                        this.tracks = r;
                    });
            }
        }
    };
</script>

<style>
    .album-image {
        width:180px;
        height:180px;
    }
</style>
