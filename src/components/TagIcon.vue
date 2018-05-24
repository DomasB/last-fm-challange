<template>
    <div class="tag-icon" :style="'background-color: ' + selectedColor" :name="tagName">
        <router-link v-if="isLink" :to="'/tag/' + encodeURIComponent(tagName)">
            <font-awesome-icon :icon="selectedIcon" :name="tagName"></font-awesome-icon>
        </router-link>
        <div v-else>
            <font-awesome-icon :icon="selectedIcon" :name="tagName"></font-awesome-icon>
        </div>
    </div>
</template>

<script>
    import fetcher from "@/fetcher";
    import {faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench} from '@fortawesome/fontawesome-free-solid';
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
    import fontawesome from '@fortawesome/fontawesome';
    fontawesome.library.add(faAdjust, faAnchor, faAsterisk, faBaseballBall, faBed, faBeer, faBell, faBirthdayCake, faBolt, faBomb, faBookOpen, faBookmark, faBriefcase, faBroadcastTower, faBuilding, faBroom, faBug, faBullhorn, faBullseye, faBurn, faCar, faCertificate, faCheckCircle, faChessKing, faChessQueen, faChessRook, faChild, faChurch, faCircle, faClock, faClosedCaptioning, faCoffee, faCog, faCogs, faComment, faCompactDisc, faCompass, faCompress, faCouch, faCrosshairs, faCrow, faCrown, faCube, faDeaf, faDna, faDotCircle, faDove, faExclamationCircle, faEye, faFeather, faFemale, faFighterJet, faFire, faFlag, faFlask, faFrog, faFrown, faGem, faGenderless, faGlassMartini, faGlasses, faGlobe, faGraduationCap, faHandPaper, faHandPeace, faHome, faHeart, faHeartbeat, faHeadphones, faIndustry, faInfinity, faInfoCircle, faKiwiBird, faLeaf, faLemon, faLifeRing, faLightbulb, faLock, faLocationArrow, faMagnet, faMale, faMap, faMapMarker, faMapPin, faMars, faMarsDouble, faMeh, faMicrochip, faMicrophone, faMinusCircle, faMoon, faMusic, faNeuter, faPaintBrush, faPaw, faPlane, faPills, faPlug, faPoo, faPodcast, faPowerOff, faQuestionCircle, faQuidditch, faRoad, faRobot, faRocket, faSeedling, faShoppingBag, faShower, faSignLanguage, faSkull, faSmile, faSmoking, faSnowflake, faSpaceShuttle, faStar, faSuitcase, faSun, faSyringe, faTablets, faTachometerAlt, faTint, faThermometerFull, faTree, faUmbrella, faUniversity, faUserAstronaut, faUserCircle, faUserSecret, faVenus, faVial, faVolumeUp, faWineGlass, faWrench);
    export default {
        name: "TagIcon",
        props:{
          tagName: {
              default: 'reggae',
              type: String
          },
            tagColor: {
              default: '#FFFFFF',
                type: String
            },
            tagIcon: {
              default: "info-circle",
                type:String
            },
            isLink: {
              default: false,
                type: Boolean
            }
        },
        data () {
            return {
                selectedIcon: 'info-circle',
                selectedColor: '#FFFFFF'
            }
        },
        created() {
            if(this.tagIcon !== 'info-circle' && this.tagColor !== '#FFFFFF') {
                this.selectedIcon = this.tagIcon;
                this.selectedColor = this.tagColor;
                console.log(this.tagIcon, this.selectedIcon)
            } else {
                let url = "http://localhost:3000/api/gettagbyname/" + this.tagName;
                let callback = r => {
                    this.selectedIcon = r.tag_icon || 'info-circle';
                    this.selectedColor = r.tag_color;
                }
                fetcher(url, callback)
            }
        },
        watch: {
            tagColor(color) {
                this.selectedColor = color;
            },
            tagIcon(icon) {
                this.selectedIcon = icon;
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
