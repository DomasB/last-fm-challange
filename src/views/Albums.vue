<template>
    <div>
        <Pages :totalPages="totalPages" :activePage="page" :path="'/albums/'+limit+'/'" />
        <div class="album-list">
            <Card
                    v-for="album in albums"
                    :key="album.album_id"
                    :cardId="album.album_id"
                    :image="album.album_image"
                    :imageAlt="album.album_name"
                    :imageLink="'/album/'+album.album_id"
                    :mainTitle="album.album_name"
                    :mainLink="'/album/'+album.album_id"
                    :secondTitle="album.album_artist"
                    :secondLink="'/artist/'+album.album_artist_id"
                    :cardDate="album.first_play"
                    dateText="First played"
                    :badges="completed(album.album_track_ids, album.tracks_ids, album.first_play)"
            ></Card>
        </div>
        <Loader v-if="albums.length == 0">Loading...</Loader>
        <Pages :totalPages="totalPages" :activePage="page" :path="'/albums/'+limit+'/'" />
    </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    import Card from "@/components/Card.vue";
    import Pages from "@/components/Pages.vue";
    import Loader from "@/components/Loader.vue";
    export default {
        name: "Albums",
        data () {
            return {
                totalPages: 1,
                albums: []
            }
        },
        props: ["limit", "page"],
        beforeRouteEnter (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage(to.params.limit, to.params.page));
            //getArtistDB.get({id:this.id});
        },
        beforeRouteUpdate (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage(to.params.limit, to.params.page));
            //getArtistDB.get({id:this.id});
        },
        watch: {
            page: {
                handler: function(page) {
                    this.getPage(this.limit, page);
                },
                deep: true
            }
        },
        methods: {
            getPage(limit, page) {
                fetch(
                    "http://localhost:3000/api/albums/" + limit + "/" + page,
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
                            this.albums = r.albums;
                            this.totalPages = r.totalPages;
                        }
                    });
            },
            completed(albumTracks, playedTracks, firstPlay) {
                let badges = [];
                if (firstPlay >= this.$store.state.goalYear) badges.push({ text: 'new', color: 'red' })
                if(!albumTracks || !playedTracks || albumTracks.length == 0 || playedTracks.length == 0) return badges;
                let albumArray = albumTracks.split(',');
                let playedArray = playedTracks.split(',');
                let isCompleted = true;
                albumArray.map(track => {
                    if(playedArray.indexOf(track) < 0) isCompleted = false;
                });
                if(isCompleted) badges.push({text: 'completed', color: 'green'});
                return badges
            }
        },
        computed: {
            pages() {
                let pagesArray = Array.from(Array(this.totalPages).keys());
                pagesArray.shift()
                pagesArray.push(this.totalPages);
                return pagesArray
            }
        },
        components: {
            Loader,
            Pages,
            Card
        }
    };
</script>

<style scoped>
    .pages {

    }
    .album-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
