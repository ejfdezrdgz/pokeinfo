import { storage } from "./init.js";

const i18next = window.i18next;
const Backend = window.i18nextXHRBackend;
var localePath = getLocalePath();

export function loadLocalization() {
    i18next
        .use(Backend)
        .init({
            backend: {
                loadPath: localePath
            }
        }, function (err, t) {
            updateLocalization();
        });
}

export function loadPokemonLocalization() {
    i18next
        .use(Backend)
        .init({
            backend: {
                loadPath: localePath
            }
        }, function (err, t) {
            updatePokemonLocalization();
        });
}

function getLocale() {
    return window.localStorage.getItem("locale");
}

function getLocalePath() {
    var loc = localizationCode();
    var path = `./resources/locales/${loc}.json`;
    return path;
}

function updateLocalization() {
    var strings = document.getElementsByClassName("t_string");
    for (let item of strings) {
        if (item.tagName != "INPUT") {
            item.innerHTML = i18next.t(item.id);
        } else {
            item.placeholder = i18next.t(item.id);
        }
    }
}

function updatePokemonLocalization() {
    var articles = document.getElementsByClassName("mainArticle");
    var pkStrg = JSON.parse(storage.getItem("pkStrg"));
    var loc_code = localizationCode();
    for (let item of articles) {
        var num_id = item.id.split("card")[1] - 1;
        var loc_name = pkStrg[num_id].loc_names[loc_code];
        item.children.item(1).innerHTML = loc_name;
    }
}

export function localizationCode() {
    var locale = getLocale();
    var code = locale != null || locale != undefined || locale != "" ? locale : "en";
    return code;
}

export function languageSelector() {
    var langFlags = document.getElementsByClassName("langFlag");
    for (let item of langFlags) {
        item.addEventListener("click",
            function (event) {
                event.preventDefault();
                var language = item.id.split("/")[0].slice(0, -4);
                window.localStorage.setItem("locale", language);
                localePath = getLocalePath();
                loadLocalization(localePath);
                loadPokemonLocalization();
                document.getElementById("langSelModal").style.display = "none";
            });
    }
}