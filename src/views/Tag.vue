<template>
    <div>
        <h1>#{{tag}}</h1>
        <div class="by-tag-section">
            <h2>Artists</h2>
            <div class="by-tag-list">
                <Card
                        v-for="artist in artists"
                        :key="artist.artist_id"
                        size="small"
                        :cardId="artist.artist_id"
                        :mainTitle="artist.artist_name"
                        :mainLink="'/artist/'+artist.artist_id"
                        :cardDate="artist.first_play"
                        dateText="First played"
                        :badges="artist.first_play > $store.state.goalYear ? [{ text:'new', color: 'red' }] : []"
                ></Card>
            </div>
        </div>
        <div class="by-tag-section">
            <h2>Albums</h2>
            <div class="by-tag-list">
                <Card
                        v-for="album in albums"
                        :key="album.album_id"
                        size="small"
                        :cardId="album.album_id"
                        :mainTitle="album.album_name"
                        :mainLink="'/album/'+album.album_id"
                        :secondTitle="album.album_artist"
                        :secondLink="'/artist/'+album.album_artist_id"
                        :cardDate="album.first_play"
                        dateText="First played"
                        :badges="album.first_play > $store.state.goalYear ? [{ text:'new', color: 'red' }] : []"
                ></Card>
            </div>
        </div>
        <Loader v-if="artists.length == 0 || albums.length ==0">Loading...</Loader>
    </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    import Card from "@/components/Card.vue";
    import Loader from "@/components/Loader.vue"
    export default {
        name: "Tag",
        data () {
            return {
                artists: [],
                albums: []
            }
        },
        props: ["tag"],
        beforeRouteEnter (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage(to.params.tag));
            //getArtistDB.get({id:this.id});
        },
        beforeRouteUpdate (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage(to.params.tag));
            //getArtistDB.get({id:this.id});
        },
        methods: {
            getPage(tag) {
                fetch(
                    "http://localhost:3000/api/artistsbytag/" + tag,
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
                            this.artists = r;
                        }
                    });
                fetch(
                    "http://localhost:3000/api/albumsbytag/" + tag,
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
                            this.albums = r;
                        }
                    });
            }
        },
        components: {
            Card,
            Loader
        }
    };
</script>

<style scoped>
    .by-tag-section {
        width: 48%;
        float:left;
        margin: 0px 1%;
    }
    .by-tag-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
