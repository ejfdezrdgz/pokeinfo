const i18next = window.i18next;
const Backend = window.i18nextXHRBackend;

export var loc_code = localizationCode();
var localePath = `../resources/locales/${loc_code}.json`;
loadLocalization(localePath);

export function loadLocalization(localePath) {
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

function getLocale() {
    return window.localStorage.getItem("locale");
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
                localePath = `../resources/locales/${language}.json`;
                loadLocalization(localePath);
                document.getElementById("langSelModal").style.display = "none";
            });
    }
}