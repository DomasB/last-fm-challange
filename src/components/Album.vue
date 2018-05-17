<template>
    <div class="album">
        <router-link :to="'/album/'+albumId"><div class="album-title">{{title}}</div></router-link>
        <div class="image-container">
            <img :src="image" class="album-image" />
            <div :class="completed ? 'new-album completed' : 'new-album'" v-if="firstPlay > $store.state.goalYear" :title="getDate(firstPlay)">NEW</div>
            <div :class="completed ? 'new-album completed' : 'new-album'" v-if="firstPlay <= $store.state.goalYear&& completed" :title="getDate(firstPlay)">+</div>
        </div>
        <ul class="tag-list">
            <li v-for="tag in JSON.parse(tags)"><router-link :to="'/tag/'+encodeURIComponent(tag)">{{tag}}</router-link></li>
        </ul>
    </div>
</template>

<script>
    const moment = require('moment');
    export default {
        name: "Album",
        props: {
            albumId: Number,
            artist: String,
            title: String,
            image: String,
            url: String,
            tags: String,
            firstPlay: Number,
            albumTracks: String,
            playedTracks: String
        },
        computed: {
            completed() {
                if(!this.albumTracks || !this.playedTracks || this.albumTracks.length == 0 || this.playedTracks.length == 0) return false;
                let albumArray = this.albumTracks.split(',');
                let playedArray = this.playedTracks.split(',');
                let isCompleted = true;
                albumArray.map(track => {
                    if(playedArray.indexOf(track) < 0) isCompleted = false;
                });
                return isCompleted;
            }
        },
        methods: {
            getDate(time) {
                return moment(time*1000).format("YYYY-MM-DD HH:mm")
            },
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .album {
        display: inline-block;
        margin-top: 15px;
        float: center;
        width: 250px;
    }
    .album-title {
        font-weight: bold;
        margin-bottom:10px;
    }
    .image-container {
        width: 100px;
        height: 100px;
        margin: 0 auto;
    }
    .album-image {
        width: 100px;
        height: 100px;
        box-shadow: rgba(0, 0, 0, 0.42) 3px 3px 7px 0px;
    }
    .tag-list {
        list-style: none;
        max-width: 150px;
        text-align: left;
        font-size: 12px;
        vertical-align: top;
        margin: -91px 0px 0px 145px;
    }
    .tag-list li {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 140px;
    }

    .new-album {
        text-align: center;
        color: white;
        background-color: tomato;
        font-size: 10px;
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: 30px;
        line-height: 3;
        position: absolute;
        margin: -9px 0px 0px -20px;
        cursor: default;
        box-shadow: rgba(0, 0, 0, 0.42) 3px 3px 7px 0px;
    }
    .completed {
        background-color: #19a019;
    }
</style>