export const GENS = { "1": 151, "2": 251, "3": 386, "4": 494, "5": 649, "6": 721, "7": 802, "NEW": 807, "SP": 10157 };
export const RANGEDIC = { "1": [0, 151], "2": [152, 251], "3": [252, 386], "4": [387, 494], "5": [495, 649], "6": [650, 721], "7": [722, 802], "NEW": [803, 807], "SP": [10001, 10157] };
export const TYPE_BACK = `background: _COLOR1_; background: linear-gradient(110deg, _COLOR1_ 0%, _COLOR1_ 40%, _COLOR2_ 60%, _COLOR2_ 100%);`;
export const TYPE_COLORS = {
    "normal": "#A8A878",
    "fighting": "#C03028",
    "flying": "#A890F0",
    "poison": "#A040A0",
    "ground": "#E0C068",
    "rock": "#B8A038",
    "bug": "#A8B820",
    "ghost": "#705898",
    "steel": "#B8B8D0",
    "fire": "#F08030",
    "water": "#6890F0",
    "grass": "#78C850",
    "electric": "#F8D030",
    "psychic": "#F85888",
    "ice": "#98D8D8",
    "dragon": "#7038F8",
    "dark": "#705848",
    "fairy": "#EE99AC"
}
export const TYPE_COLORS_2 = {
    "unknown": "#68A090",
    "shadow": "#68A090"
}

export var pk_num = GENS["1"];
export var storage = window.localStorage;
export var searchBar = document.getElementById("searchBar");
export var genSels = document.getElementsByClassName("genSel");
export var orderSel = document.getElementById("orderSel");
export var sortDir = document.getElementById("sortdir");
export var orderCheck = document.getElementById("exactorder");
export var typeSels = document.getElementsByName("typeSel");
export var closeModalSpan = document.getElementById("closeModal");
export var cardModal = document.getElementById('cardModal');
export var section = document.getElementById("content");
export var API_URL = "https://pokeapi.co/api/v2/";
export var API_URL_GEN = "generation/";
export var API_URL_SPECIES = "pokemon-species/";
export var API_URL_POKELIST = "pokemon/?limit=1000";
export var API_URL_EVOCHAIN = "evolution-chain/";
export var LANGUAGES = ["de", "en", "es"];

var locale = storage.getItem("locale");
if (locale == null || locale == undefined || locale == "") {
    storage.setItem("locale", "en");
} else {
    document.getElementById("langSelModal").style.display = "none";
    storage.setItem("locale", locale);
}

var arrows = document.getElementsByClassName("scroller");
for (let item of arrows) {
    item.addEventListener("click", function (event) {
        var direction = item.id.slice(6);
        switch (direction) {
            case "Up":
                window.scrollTo(0, 0);
                break;

            case "Down":
                window.scrollTo(0, document.body.scrollHeight);
                break;
        }
    });
}

export function initModalOffFunction() {
    closeModalSpan.onclick = onClickCloseModalOff;
    cardModal.onclick = onClickOutModalOff;
    window.onkeydown = onEscapeDownModalOff;
}
function onClickCloseModalOff() {
    cardModal.style.display = "none";
}
function onClickOutModalOff(event) {
    if (event.target == cardModal) {
        cardModal.style.display = "none";
    }
}
function onEscapeDownModalOff(event) {
    if (event.key == "Escape" && cardModal.style.display == "block") {
        cardModal.style.display = "none";
    }
}