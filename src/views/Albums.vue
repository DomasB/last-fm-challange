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
                    :badges="badges(album.completed, album.first_play)"
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
            }
        },
        props: ["limit", "page"],
        beforeRouteEnter (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getData(to.params.limit, to.params.page));
            //getArtistDB.get({id:this.id});
        },
        beforeRouteUpdate (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getData(to.params.limit, to.params.page));
            //getArtistDB.get({id:this.id});
        },
        watch: {
            page: {
                handler: function(page) {
                    this.getData(this.limit, page);
                },
                deep: true
            }
        },
        methods: {
            getData(limit, page) {
                this.$store.dispatch('getAlbums', {limit, page});
            },
            badges(completed, firstPlay) {
                let badges = [];
                if (firstPlay >= this.$store.state.goalYear) badges.push({ text: 'new', color: 'red' });
                if (completed) badges.push({text: 'completed', color: 'green'});
                return badges
            }
        },
        computed: {
            albums() {
                return this.$store.state.albums;
            },
            pages() {
                let pagesArray = Array.from(Array(this.totalPages).keys());
                pagesArray.shift()
                pagesArray.push(this.totalPages);
                return pagesArray
            },
            activePage() {
                return this.$store.state.activePage;
            },
            totalPages() {
                return this.$store.state.totalPages;
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
    .album-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
