<template>
  <div id="app">
    <div id="nav">
      <router-link to="/artists/100/1">Artists</router-link> |
      <router-link to="/completedartists/">Completed Artists</router-link> |
      <router-link to="/albums/100/1">Albums</router-link>
      <button v-if="this.$store.state.adminCookie" class="update-button" @click="updateDatabase()" :title="update">
        <font-awesome-icon icon="sync" :spin="updating" />
      </button>
      <div id="completed" class="progress-bar" :style="completedPercent"></div>
      <div id="new" class="progress-bar" :style="newPercent"></div>
      <div id="remaining" class="progress-bar"></div>
    </div>
    <router-view v-if="!this.$store.state.loading"/>
    <Loader v-else>Loading...</Loader>
  </div>
</template>

<script>
// @ is an alias to /src
import fetcher from "@/fetcher";
import Loader from "@/components/Loader.vue";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import {faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench} from '@fortawesome/fontawesome-free-solid';
import fontawesome from '@fortawesome/fontawesome';
fontawesome.library.add(faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench);
import { faSync } from "@fortawesome/fontawesome-free-solid";
export default {
  name: "App",
  data() {
    return {
      update: "Update",
      updating: false
    };
  },
  methods: {
    updateDatabase() {
      this.updating = true;
      this.update = "Updating";
      let url = document.location.protocol + "//" + document.location.hostname + ":3000/api/triggerupdate/";
      let callback = r => {
        if (r.status == "Done!") {
          this.updating = false;
          this.update = "Updated " + r.updated + " tracks";
          this.$store.dispatch("getCompleted");
          if (this.$store.state.album)
            this.$store.dispatch(
              "getAlbumInfo",
              this.$store.state.album.album_id
            );
        }
      };
      fetcher(url, callback);
    }
  },
  computed: {
    newPercent() {
      return this.$store.getters.newPercent;
    },
    completedPercent() {
      return this.$store.getters.completedPercent;
    }
  },
    created() {
        this.$store.dispatch("getCompleted");
        this.$store.dispatch("getTags");
        this.$store.dispatch("getAdminCookie");
    },
  components: {
    FontAwesomeIcon,
    Loader
  }
};
</script>
<style>
body {
  margin: 0px;
}
#app {
  margin-top: 90px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 15px;
  position: fixed;
  display: block;
  top: 0px;
  background-color: white;
  z-index: 10;
  width: 100%;
  height: 25px;
  box-shadow: 1px 6px 8px 0px #00000030;
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
  position: fixed;
  top: 5px;
  right: 20px;
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
  outline: 0;
}
.progress-bar {
  height: 2px;
  display: inline;
  position: absolute;
  top: 0px;
  left: 0px;
}
#completed {
  background-color: #19a019;
  z-index: 13;
}
#new {
  background-color: #9cef96;
  z-index: 12;
}
#remaining {
  width: 100%;
  background-color: #d8d8d8;
  z-index: 11;
}
</style>
