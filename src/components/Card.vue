<template>
    <div :id="'card-'+cardId" :class="'card-container ' + size">
        <div class="card-image">
            <div v-if="image">
                <div v-if="imageLink">
                    <router-link :to="imageLink"><img :src="image" :alt="imageAlt" /></router-link>
                </div>
                <div v-else>
                    <img :src="image" :alt="imageAlt" />
                </div>
            </div>
        </div>
        <div class="text-container">
            <div class="main-title">
                <div v-if="mainLink"><router-link :to="mainLink">{{mainTitle}}</router-link></div>
                <div v-else>{{mainTitle}}</div>
            </div>
            <div class="second-title" v-if="secondTitle">
                <div v-if="secondLink"><router-link :to="secondLink">{{secondTitle}}</router-link></div>
                <div v-else>{{secondTitle}}</div>
            </div>
            <div class="card-date" v-if="cardDate">
                {{dateText}}: <nobr>{{getDate(cardDate)}}</nobr>
            </div>
        </div>
        <div class="tags-container" v-if="tags">
            <TagIcon class="tag-icons" v-for="tag in tags" :key="tag" :tagName="tag" isLink></TagIcon>
        </div>
        <div class="card-badges" v-if="badges">
            <div v-for="badge in badges" :class="'badge ' + badge.color">{{badge.text}}</div>
        </div>
    </div>
</template>

<script>
    const moment = require('moment');
    import TagIcon from "@/components/TagIcon.vue";

    export default {
        name: "Card",
        props: {
            cardId: Number,
            image: String,
            imageLink: String,
            imageAlt: String,
            mainTitle: String,
            mainLink: String,
            secondTitle: String,
            secondLink: String,
            cardDate: Number,
            dateText: String,
            tags: Array,
            badges: Array,
            size: {
                type: String,
                default: 'normal'
            }
        },
        methods: {
            getDate(time) {
                return moment(time*1000).format("YYYY-MM-DD HH:mm")
            },
        },
        components: { TagIcon: () => import('./TagIcon.vue') }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .card-container {
        position: relative;
        margin: 10px;
        padding: 5px;
        border: 1px solid #c1c1c1;
        box-shadow: 3px 3px 4px 0px #bfbfbf;
        text-align: left;
        flex-shrink: 1;
        flex-grow: 1;
    }
    .normal {
        min-height: 100px;
        flex-basis: 350px;
    }
    .small {
        min-height: 92px;
        flex-basis: 200px;
    }
    .card-image {
        display:inline-block;
        max-width: 30%;
    }
    .card-image img {
        max-width: 100px;
    }
    .text-container {
        display: inline-block;
        max-width: 74%;
        margin: 3px 0px 0px 10px;
        vertical-align: top;
    }
    .main-title {
        font-size: 20px;
        font-weight: bold;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .second-title {
        font-size: 18px;
    }
    .card-date {
        margin-top: 5px;
        font-size: 12px;
    }
    .card-badges {
        position: absolute;
        right: 7px;
        bottom: 9px;
    }
    .tag-container {
        display:inline-block;
    }
    .tag-icons {
        display: inline-block;
        margin:1px;
    }
    .badge {
        padding: 2px 4px 2px 2px;
        margin: 0px 2px;
        text-align: center;
        text-transform: uppercase;
        color: white;
        border-radius: 4px;
        display: inline;
        font-size: 10px;
        font-weight: bold;
    }
    .green {
        background-color: #19a019;
    }
    .red {
        background-color: tomato;
    }
</style>