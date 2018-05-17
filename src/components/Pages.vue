<template>
    <div :class="empty + ' pages'">
        <span v-if="activePage > 1"><router-link :to="path + (activePage - 1)"> < </router-link></span>
        <span v-for="p in pages" class="page-link">
            <span v-if="p === '...'">...</span>
            <router-link v-else-if="p != activePage" :to="path+p">{{p}}</router-link>
            <span v-else ><b>{{p}}</b></span>
        </span>
        <span v-if="activePage < totalPages"><router-link :to="path + (parseInt(activePage) + 1)"> > </router-link></span>
    </div>
</template>

<script>
    export default {
        name: "Pages",
        props: ["activePage", "totalPages", "path"],
        computed: {
            pages() {
                let activePage = parseInt(this.activePage);
                let totalPages = parseInt(this.totalPages);
                let newArray = [];
                let pagesArray = Array.from(Array(totalPages).keys());
                pagesArray.shift()
                pagesArray.push(totalPages);
                pagesArray = pagesArray.filter(p => (p <= 3 || p > totalPages - 3 || (p >= activePage - 3 && p <= activePage +3)));
                pagesArray.map((item,index, arr) => {
                    newArray.push(item)
                    if(arr[index+1] && item + 1 !== arr[index+1]) newArray.push("...")
                });
                return newArray
            },
            empty() {
                return this.totalPages > 1 ? "" : "empty"
            }
        }

    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .pages {
        padding: 10px;
        font-size: 18px;
    }
    .page-link {
        margin: 0px 10px;
    }
    .empty {
        display:none;
    }
</style>
