<template>
    <div>

        <h1>Tags</h1>
        <ul>
            <li class="tag-item" v-for="tag in tags" :key="tag.tag_id">
                <span class="item">{{tag.tag_name}}</span>
                <TagIcon class="item" v-if="tag.tag_icon" :tagIcon="tag.tag_icon" :tagColor="tag.tag_color" :tagName="tag.tag_name" isLink></TagIcon>
                <TagIconSelector v-if="editingTag === tag.tag_id" @saveIcon="save($event, tag.tag_id)":tagName="tag.tag_name" :tagColor="tag.tag_color" :tagIcon="tag.tag_icon"></TagIconSelector>
                <button class="item" @click="editingTag = tag.tag_id">Edit</button>
            </li>
        </ul>
    </div>
</template>

<script>
    // @ is an alias to /src
    import fetcher from "@/fetcher";
    import TagIconSelector from "@/components/TagIconSelector.vue";
    import TagIcon from "@/components/TagIcon.vue";
    export default {
        name: "Tags",
        data () {
            return {
                tags: [],
                editingTag: null
            }
        },
        beforeRouteEnter (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage());
            //getArtistDB.get({id:this.id});
        },
        beforeRouteUpdate (to, from, next) {
            //let getArtistDB = db.prepare("SELECT * FROM artists WHERE artist_id = $id");
            next(vm => vm.getPage());
            //getArtistDB.get({id:this.id});
        },
        methods: {
            getPage() {
               let url = "http://localhost:3000/api/gettags";
               let callback = r => {
                   this.tags = r;
               };
               fetcher(url,callback);
            },
            save(event, id) {
                let currentTag = this.tags.find(tag => tag.tag_id === id);
                let url = "http://localhost:3000/api/updatetags/" + id + "/" + encodeURIComponent(event.tag_color) + "/" + encodeURIComponent(event.tag_icon);
                let callback = r => {
                    currentTag.tag_icon = event.tag_icon;
                    currentTag.tag_color = event.tag_color;
                    this.editingTag = null;
                }
                fetcher(url, callback);
            },
        },
        components: {
            TagIconSelector,
            TagIcon
        }
    };
</script>

<style scoped>
    .tag-item {
        display:inline-block;
        margin: 10px;
    }
    .item {
        display: inline-block;
        margin: 0px 5px;
    }
</style>
