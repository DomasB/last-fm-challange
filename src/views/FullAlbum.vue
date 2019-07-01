<template>
    <div>
        <h2><div>
            <a :href="album.album_url" target="_blank">{{album.album_name}}</a> by <router-link :to="'/artist/' + album.album_artist_id">{{album.album_artist}}</router-link>
            <button class="copy-button" @click="copyArtistAndAlbum()"><font-awesome-icon icon="copy" /></button>
        </div></h2>
        <img :src="album.album_image" class="album-image"/>
        <ul class="track-list">
            <li v-for="track in tracks">
                <a :href="track.track_url" target="_blank">{{track.album_track_name}}</a>
                <span v-if="track.track_duration" class="time"> {{duration(track.track_duration)}} </span>
                <div v-if="track.first_play" :title="getDate(track.first_play)" class="played-track"> PLAYED: {{track.play_count}} </div>
                <div v-if="track.first_play >  $store.state.goalYear" class="new-track"> NEW </div>
                <select v-if="!track.play_count && missing.length > 0" :id="track.album_track_id">
                    <option v-for="missingTrack in missing" :selected="track.album_track_name.toLowerCase() == missingTrack.track_name.toLowerCase()" :value="missingTrack.track_ids">{{missingTrack.track_name + ' * ' + missingTrack.track_album}}</option>
                </select>
                <button v-if="!track.play_count && missing.length > 0" @click="mapTrack(track.album_track_id, id)">Map Track</button>
            </li>
        </ul>
        <Loader v-if="loading"></Loader>
    </div>
</template>

<script>
    // @ is an alias to /src
    import fetcher from "@/fetcher";
    const moment = require('moment');
    import Loader from "@/components/Loader.vue"
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import { faCopy } from '@fortawesome/fontawesome-free-solid'
    export default {
        name: "fullAlbum",
        data () {
            return {
                loading: false
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
                this.loading = true;
                this.$store.dispatch('getAlbumInfo', id).then(() => {this.loading = false});
            },
            mapTrack(id, albumId) {
                let selector = document.getElementById(id);
                let selectedIndex = selector.selectedIndex;
                let values = selector.options[selectedIndex].value;
                let url = document.location.protocol + "//" + document.location.hostname + ":3000/api/maptracks/" + id + "/" + values;
                let callback = () => {
                    this.setData(albumId)
                };
                fetcher(url, callback);
            },
            getDate(time) {
                return moment(time*1000).format("YYYY-MM-DD HH:mm")
            },
            duration(time) {
                let minutes = Math.floor(time / 60);
                let seconds = time - minutes * 60;
                if(seconds < 10) seconds = '0' + seconds.toString();
                if(minutes < 10) minutes = '0' + minutes.toString();
                return minutes + ':' + seconds;
            },
            copyArtistAndAlbum() {
                const el = document.createElement('textarea');
                el.value = this.album.album_artist + " " + this.album.album_name;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }
        },
        computed: {
            album() {
                return this.$store.state.album;
            },
            tracks() {
                return this.$store.state.albumTracks;
            },
            missing() {
                return this.$store.getters.getMissingTracks;
            }
        },
        components: {
            Loader,
            FontAwesomeIcon
        }
    };
</script>

<style>
    .album-image {
        width:300px;
        height:300px;
        box-shadow: rgba(0, 0, 0, 0.42) 3px 3px 7px 0px;
    }
    .track-list {
        list-style: none;
        padding:20px 0px;
    }
    .track-list li {
        padding: 5px 0px;
    }
    .time {
        font-size: 10px;
        vertical-align: middle;
        display: inline-block;
        padding: 0px 3px;
    }
    .new-track {
        padding: 2px 4px;
        margin: 0px 2px;
        text-align: center;
        color: white;
        background-color: tomato;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        vertical-align: middle;
        display: inline-block;
    }
    .played-track {
        padding: 2px 4px;
        margin: 0px 2px;
        text-align: center;
        color: white;
        background-color: #30a954;
        border-radius: 4px;
        vertical-align: middle;
        display: inline-block;
        font-size: 10px;
        font-weight: bold;
        cursor: default;
    }
    .copy-button {
        font-size: 18px;
        border: none;
        background: none;
        margin: 0px 10px;
        cursor: pointer;
        padding: 0px;
        color: #3f5366;
    }
    .copy-button:active {
        transform: scale(1.2);
        outline:0;
    }
</style>
