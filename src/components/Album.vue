<template>
    <div class="album">
        <router-link :to="'/album/'+albumId"><p class="album-title">{{title}}</p></router-link>
        <img :src="image" class="album-image" />
        <ul>
            <li v-for="tag in JSON.parse(tags)">{{tag}}</li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "Album",
        props: {
            albumId: Number,
            artist: String,
            title: String,
            image: String,
            url: String,
            tags: String
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .album-title{
        position: absolute;
        font-weight: bold;
    }
    .album-image {
        width: 100px;
        height: 100px;
    }
</style>
