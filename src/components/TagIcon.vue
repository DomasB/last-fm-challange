<template>
    <div class="tag-icon" :style="'background-color: ' + tag.color" :name="tagName">
        <router-link v-if="isLink" :to="'/tag/' + encodeURIComponent(tagName)">
            <font-awesome-icon :icon="tag.icon" :name="tagName"></font-awesome-icon>
        </router-link>
        <div v-else>
            <font-awesome-icon :icon="tag.icon" :name="tagName"></font-awesome-icon>
        </div>
    </div>
</template>

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    export default {
        name: "TagIcon",
        props:{
          tagName: {
              default: 'reggae',
              type: String
          },
            isLink: {
              default: false,
                type: Boolean
            }
        },
        computed: {
            tag() {
                return this.$store.getters.getTag(this.tagName);
            }
        },
        components: {
            FontAwesomeIcon
        }

    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .tag-icon {
        width: 20px;
        height: 20px;
        font-size: 10px;
        color: white;
        border-radius: 15px;
        line-height: 20px;
        text-align: center;
    }
    .tag-icon a {
        color:white;
    }
</style>
