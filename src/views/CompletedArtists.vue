<template>
    <div>
        <h2>Completed: {{completed}} New: {{artists.length}}</h2>
        <input type="checkbox" v-model="showCompleted" :checked="showCompleted"> Show completed
        <ul class="artist-list">
            <Card
                    v-for="artist in artists"
                    :key="artist.artist_id"
                    v-show="artist.completed == showCompleted || showCompleted"
                    size="small"
                    :cardId="artist.artist_id"
                    :image="artist.artist_image"
                    :imageAlt="artist.artist_name"
                    :imageLink="'/artist/'+artist.artist_id"
                    :mainTitle="artist.artist_name"
                    :mainLink="'/artist/'+artist.artist_id"
                    :cardDate="artist.first_play"
                    dateText="First played"
                    :badges="artist.completed ? [{ text:'completed', color: 'green' }] : []"
            ></Card>
        </ul>
        <Loader v-if="artists.length === 0">Loading...</Loader>
    </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    import Card from "@/components/Card.vue";
    import Loader from "@/components/Loader.vue"
    export default {
        name: "CompletedArtists",
        data () {
            return {
                showCompleted: true
            }
        },
        beforeRouteEnter (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getData());
            //getArtistDB.get({id:this.id});
        },
        beforeRouteUpdate (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getData());
            //getArtistDB.get({id:this.id});
        },
        methods: {
            getData() {
                this.$store.dispatch('getCompleted');
            }
        },
        computed: {
            artists() {
                return this.$store.state.completedArtists;
            },
            completed() {
               return this.$store.state.completedCount;
            }
        },
        components: {
            Loader,
            Card
        }
    };
</script>

<style scoped>
    .artist-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
</style>
