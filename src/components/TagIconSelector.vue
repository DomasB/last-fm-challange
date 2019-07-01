<template>
    <div class="icon-settings">
        <div class="controls">
            {{tagName}}
            <div v-if="selectedIcon" class="tag-icon" :style="'background-color: '+selectedColor "><font-awesome-icon :icon="selectedIcon"></font-awesome-icon></div>
            <input class="color" type="color" v-model="selectedColor">
            <button class="save-button" @click="save()">Save</button>
        </div>
        <div class="icon-container">
            <div class="icon" v-for="icon in iconsArray" :class="selectedIcon === icon ? 'selected' : ''" @click="selectIcon(icon)"> <font-awesome-icon :icon="icon"></font-awesome-icon></div>
        </div>
    </div>
</template>

<script>
    import {faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench} from '@fortawesome/fontawesome-free-solid';
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    import fontawesome from '@fortawesome/fontawesome'
    fontawesome.library.add(faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench);
    export default {
        name: "TagIconSelector",
        props: ["tagName", "tagId", "tagColor", "tagIcon"],
        data () {
            return {
                iconsArray: ['adjust', 'anchor', 'asterisk', 'baseball-ball', 'bed', 'beer', 'bell', 'birthday-cake', 'bolt', 'bomb', 'book-open', 'bookmark', 'briefcase', 'broadcast-tower', 'building', 'broom', 'bug', 'bullhorn', 'bullseye', 'burn', 'car', 'certificate', 'check-circle', 'chess-king', 'chess-queen', 'chess-rook', 'child', 'church', 'circle', 'clock', 'closed-captioning', 'coffee', 'cog', 'cogs', 'comment', 'compact-disc', 'compass', 'compress', 'couch', 'crosshairs', 'crow', 'crown', 'cube', 'deaf', 'dna', 'dot-circle', 'dove', 'exclamation-circle', 'eye', 'feather', 'female', 'fighter-jet', 'fire', 'flag', 'flask', 'frog', 'frown', 'gem', 'genderless', 'glass-martini', 'glasses', 'globe', 'graduation-cap', 'hand-paper', 'hand-peace', 'home', 'heart', 'heartbeat', 'headphones', 'industry', 'infinity', 'info-circle', 'kiwi-bird', 'leaf', 'lemon', 'life-ring', 'lightbulb', 'lock', 'location-arrow', 'magnet', 'male', 'map', 'map-marker', 'map-pin', 'mars', 'mars-double', 'meh', 'microchip', 'microphone', 'minus-circle', 'moon', 'music', 'neuter', 'paint-brush', 'paw', 'plane', 'pills', 'plug', 'poo', 'podcast', 'power-off', 'question-circle', 'quidditch', 'road', 'robot', 'rocket', 'seedling', 'shopping-bag', 'shower', 'sign-language', 'skull', 'smile', 'smoking', 'snowflake', 'space-shuttle', 'star', 'suitcase', 'sun', 'syringe', 'tablets', 'tachometer-alt', 'tint', 'thermometer-full', 'tree', 'umbrella', 'university', 'user-astronaut', 'user-circle', 'user-secret', 'venus', 'vial', 'volume-up', 'wine-glass', 'wrench'],
                selectedIcon: 'none',
                selectedColor: 'none'
            }
        },
        created() {
          this.selectedIcon = this.tagIcon;
          this.selectedColor = this.tagColor;
        },
        methods: {
            selectIcon(name) {
                this.selectedIcon = name;
            },
            save() {
                this.$emit('saveIcon');
                this.$store.dispatch('saveTag', {id: this.tagId, name: this.tagName, icon: this.selectedIcon, color: this.selectedColor});
            }
        },
        computed: {
        },
        components: {
            FontAwesomeIcon
        }

    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .icon-settings {
        position:fixed;
        top:100px;
        right:20px;
        background-color: white;
        box-shadow: 0px 2px 8px 2px #bfbfbf;
        z-index: 900;
    }
  .icon-container {
      width: 600px;
      height: 400px;
      display: inline-block;
  }
    .icon {
        display:inline-block;
        margin: 5px;
        font-size: 30px;
    }
  .selected {
      border: 2px solid red;
  }
  .controls {
      display: inline-block;
      padding: 10px;
      text-align: center;
  }
  .tag-icon {
      width: 40px;
      height: 40px;
      font-size: 20px;
      color: white;
      border-radius: 20px;
      line-height: 40px;
      margin: 5px;
  }
    .color {
        margin: 5px;
    }
    .save-button {
        display: block;
        margin: 5px;
    }
</style>
