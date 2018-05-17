<template>
    <div>
        <Pages :totalPages="totalPages" :activePage="page" :path="'/artists/'+limit+'/'" />
        <div class="artist-list">
                <Card
                        v-for="artist in artists"
                        :key="artist.artist_id"
                        :cardId="artist.artist_id"
                        :image="artist.artist_image"
                        :imageAlt="artist.artist_name"
                        :imageLink="'/artist/'+artist.artist_id"
                        :mainTitle="artist.artist_name"
                        :mainLink="'/artist/'+artist.artist_id"
                        :cardDate="artist.first_play"
                        dateText="First played"
                        :badges="artist.first_play > $store.state.goalYear ? [{ text:'new', color: 'red' }] : []"
                ></Card>
        </div>
        <Loader v-if="artists.length == 0">Loading...</Loader>
        <Pages :totalPages="totalPages" :activePage="page" :path="'/artists/'+limit+'/'" />
    </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    import Card from "@/components/Card.vue";
    import Pages from "@/components/Pages.vue";
    import Loader from "@/components/Loader.vue"
    export default {
        name: "Artists",
        data () {
            return {
                totalPages: 1,
                artists: []
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
                    "http://localhost:3000/api/artists/" + limit + "/" + page,
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
                            this.artists = r.artists;
                            this.totalPages = r.totalPages;
                        }
                    });
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

<style>
    .page-link {
        margin: 0px 10px;
    }
    .artist-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
