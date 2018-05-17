<template>
  <div id="app">
    <div id="nav">
      <router-link to="/artists/100/1">Artists</router-link> |
      <router-link :to="'/completedartists/' + $store.state.goalYear">Completed Artists</router-link> |
      <router-link to="/albums/100/1">Albums</router-link>
      <button class="update-button" @click="updateDatabase()" :title="update">
        <font-awesome-icon icon="sync" :spin="updating" />
      </button>
    </div>
    <router-view/>
  </div>
</template>

<script>
    // @ is an alias to /src
    const fetch = require('node-fetch');
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import { faSync } from '@fortawesome/fontawesome-free-solid'
    export default {
        name: "App",
        data () {
            return {
                update: "Update",
                updating: false
            }
        },
        methods: {
            updateDatabase() {
                this.updating = true;
                this.update = "Updating";
                fetch(
                    "http://localhost:3000/api/triggerupdate/",
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
                        if(r.status == "Done!") {
                            this.updating = false;
                            this.update = "Updated " + r.updated + " tracks";
                        }
                    });
            }
        },
        components: {
            FontAwesomeIcon
        }
    };
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}
a {
  color: #3f5366;
    text-decoration: none;
}
  a:visited {
      color: #232f34;
  }
  .update-button {
    border: none;
    background: none;
    color: #2c3e50;
    width: 45px;
    height: 45px;
    font-size: 20px;
    float: right;
    cursor: pointer;
  }
  .update-button:focus {
    outline:0;
  }
</style>
