import { Pokemon } from "./pokemon.js";
import { localizationCode } from "./localizer.js";
import { TYPE_BACK, TYPE_COLORS, RANGEDIC, API_URL, API_URL_POKE, API_URL_SPECIES, LANGUAGES, storage, section, cardModal } from "./init.js";

export function back_colors(pk) {
    var style = TYPE_BACK;
    var cp, cs;
    cp = cs = TYPE_COLORS[pk.types["primary"]];
    if (pk.types["secondary"] != undefined) {
        cs = TYPE_COLORS[pk.types["secondary"]];
    }
    style = style.split('_COLOR1_').join(cp);
    style = style.split('_COLOR2_').join(cs);
    return style;
}

export function sortPokemon(a, b) {
    if (a.id > b.id) return 1
    else if (a.id < b.id) return -1
    else return 0
}

export function rangeCompress(range) {
    if (range.length > 0) {
        range.forEach(el => {
            if (el - 1 == range[range.indexOf(el) - 1]) {
                range.splice(range.indexOf(el) - 1, 2);
                rangeCompress(range);
            }
        });
    }
    return range;
}

export function rangePair(range) {
    var r = [];
    while (range.length > 0) {
        r.push(range.splice(0, 2));
    }
    return r;
}

export function genParse(pk) {
    for (let key in RANGEDIC) {
        var el = RANGEDIC[key];
        if (pk.id >= el[0] && pk.id <= el[1]) {
            switch (key) {
                case "1":
                    return "I";
                case "2":
                    return "II";
                case "3":
                    return "III";
                case "4":
                    return "IV";
                case "5":
                    return "V";
                case "6":
                    return "VI";
                case "7":
                    return "VII";
                case "NEW":
                    return "NEW";
                case "SP":
                    return "SP";
            }
        }
    }
}

export function fillPokemonInfo(list, num) {
    initializePokemonList(list, num);
    fillPokemonBasicInfo(list);
    fillPokemonExtraInfo(list);
    // setTimeout(() => { savePokemonInfo(list); }, 4000);
    // setTimeout(() => { loadCardInfo(list.sort(sortPokemon)); }, 5000);
}

export function initializePokemonList(list, num) {
    return new Promise(function (resolve) {
        for (let i = 0; i < num; i++) {
            console.log("INIT");

            var pokemon = new Pokemon(i + 1, "", "", "", {}, {});
            list.push(pokemon);
        }
        console.log(Date.now());
        resolve();
    })
}

export function fillPokemonBasicInfo(list) {
    return new Promise(function (resolve) {
        for (const pokemon of list) {
            console.log("BASIC");

            var xml = new XMLHttpRequest();
            var url = API_URL + API_URL_POKE + pokemon.id;

            xml.open("GET", url, true);
            xml.send();
            xml.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var r = JSON.parse(this.response);

                    var types = {};
                    r.types.forEach(el => {
                        if (el.slot == 1) {
                            types["primary"] = el.type.name;
                        } else if (el.slot == 2) {
                            types["secondary"] = el.type.name;
                        }
                    });

                    var stats = {};
                    r.stats.forEach(el => {
                        stats[el.stat.name] = el.base_stat;
                    });

                    var abilities = [];
                    r.abilities.forEach(function (el, index) {
                        abilities[index] = {};
                        abilities[index]["slot"] = el.slot;
                        abilities[index]["is_hidden"] = el.is_hidden;
                        abilities[index]["ability"] = {};
                        abilities[index]["ability"]["name"] = el.ability.name;
                        abilities[index]["ability"]["url"] = el.ability.url;
                    });

                    list.find(function (el) {
                        if (el["id"] == pokemon.id) {
                            el["url"] = url;
                            el["img"] = r.sprites.front_default;
                            el["name"] = r.name;
                            el["types"] = types;
                            el["stats"] = stats;
                            el["height"] = r.height;
                            el["base_exp"] = r.base_experience;
                            el["abilities"] = abilities;
                        }
                    })
                }
            }
        }
        console.log(Date.now());
        resolve();
    })
}

export function fillPokemonExtraInfo(list) {
    return new Promise(function (resolve) {
        for (const pokemon of list) {
            console.log("EXTRA");

            var xml = new XMLHttpRequest();
            var url = API_URL + API_URL_SPECIES + pokemon.id;

            xml.open("GET", url, true);
            xml.send();
            xml.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var r = JSON.parse(this.response);

                    var loc_names = {};
                    r.names.forEach(item => {
                        LANGUAGES.forEach(lang => {
                            if (item.language.name == lang) {
                                loc_names[lang] = item.name;
                            }
                        });
                    });

                    var evol_from = null;
                    if (r.evolves_from_species != null) {
                        evol_from = r.evolves_from_species.name;
                    }

                    var flavor_text = {};
                    LANGUAGES.forEach(lang => {
                        flavor_text[lang] = {};
                        r.flavor_text_entries.forEach(item => {
                            if (item.language.name == lang) {
                                flavor_text[lang][item.version.name] = item.flavor_text;
                            }
                        })
                    })

                    var genera = {};
                    LANGUAGES.forEach(lang => {
                        genera[lang] = {};
                        r.genera.forEach(item => {
                            if (item.language.name == lang) {
                                genera[lang] = item.genus;
                            }
                        })
                    })

                    list.find(function (el) {
                        if (el["id"] == pokemon.id) {
                            el["genera"] = genera;
                            el["base_hap"] = r.base_happiness;
                            el["loc_names"] = loc_names;
                            el["evol_from"] = evol_from;
                            el["flavor_text"] = flavor_text;
                            el["evol_chain_id"] = parseInt(r.evolution_chain.url.split("/")[6]);
                        }
                    })
                }
            }
        }
        console.log(Date.now());
        resolve();
    })
}

export function savePokemonInfo(list) {
    console.log("SAVE");
    console.log(Date.now());

    storage.setItem("pkStrg", JSON.stringify(list));
}

export function loadCardInfo(type, out_list) {
    console.log(Date.now());
    return new Promise(function (resolve) {
        var list = null;
        if (type == "full") {
            list = JSON.parse(storage.getItem("pkStrg"));
        } else if (type == "partial") {
            list = out_list;
        }
        section.innerHTML = "";
        document.getElementsByClassName("loader")[0].setAttribute("style", "display: none");
        list.forEach(pokemon => {
            console.log("LOAD");

            var card = document.createElement("article");
            card.onclick = eventCard;
            card.id = "pkcard" + pokemon.id;
            card.className = "tooltip mainArticle";
            card.style = back_colors(pokemon);
            var idCorner = document.createElement("div");
            idCorner.innerHTML = pokemon.id;
            idCorner.className = "cardCorner cardIdCorner";
            var genCorner = document.createElement("div");
            genCorner.innerHTML = genParse(pokemon);
            genCorner.className = "cardCorner cardGenCorner";
            var p = document.createElement("p");
            var loc_code = localizationCode();
            console.log(pokemon);
            console.log(loc_code);
            p.innerText = pokemon.loc_names[loc_code];
            var img = document.createElement("img");
            img.src = pokemon.img;
            card.appendChild(img);
            card.appendChild(p);
            card.appendChild(idCorner);
            card.appendChild(genCorner);
            section.appendChild(card);
        })
        resolve();
    })
}

export function eventCard(evt) {
    var id = evt.currentTarget.id.slice(6);
    var list = JSON.parse(storage.getItem("pkStrg"));
    var pokemon = list.filter(pk => { if (pk.id == id) return true; })[0];
    buildModal(pokemon);
}

export function buildModal(pokemon) {
    cardModal.style.display = "block";
    document.getElementById("detailCard").innerHTML = "";
    document.getElementById("detailCard").appendChild(htmlModal(pokemon));
}

export function htmlModal(pokemon) {
    var loc_code = localizationCode();
    var content = document.createElement("div");
    content.className = "modalCont";
    var header = document.createElement("div");
    header.className = "modalHeader";
    var body = document.createElement("div");
    var card = document.createElement("article");
    card.style = back_colors(pokemon);
    card.className = "modalCard";
    var img = document.createElement("img");
    img.src = pokemon.img;
    var nameP = document.createElement("p");
    nameP.innerText = pokemon.loc_names[loc_code];
    var idCorner = document.createElement("div");
    idCorner.innerHTML = pokemon.id;
    idCorner.className = "cardCorner cardIdCorner";
    var genCorner = document.createElement("div");
    genCorner.innerHTML = genParse(pokemon);
    genCorner.className = "cardCorner cardGenCorner";
    var separator = document.createElement("hr");
    var stats = document.createElement("div");
    stats.className = "modalStats";
    var evol = document.createElement("div");
    evol.className = "modalEvol";
    var ep = document.createElement("h4");
    ep.id = "evolP";
    ep.innerText = "Evolution chain";
    evol.appendChild(ep);
    // var evolBody = document.createElement("div");
    // evolBody.className = "evolBody";
    // pokemon.evolChain.forEach(el => {
    //     var p = document.createElement("p");
    //     p.innerText = el;
    //     var sep = document.createElement("p");
    //     sep.innerText = "→";
    //     evolBody.appendChild(p);
    //     evolBody.appendChild(sep);
    // });
    // evolBody.removeChild(evolBody.lastChild);
    // evol.appendChild(evolBody);
    var desc = document.createElement("div");
    var flavor_text = pokemon["flavor_text"];
    for (let key in flavor_text) {
        if (key == loc_code) {
            for (let edition in flavor_text[key]) {
                var element = flavor_text[key][edition];
                var descP = document.createElement("p");
                var text = element.split("\n").join(" ");
                descP.innerText = text;
                descP.className = "descP";
                desc.appendChild(descP);
            }
        }
    }
    card.appendChild(img);
    card.appendChild(nameP);
    card.appendChild(idCorner);
    card.appendChild(genCorner);
    header.appendChild(card);
    header.appendChild(stats);
    header.appendChild(evol);
    body.appendChild(desc);
    content.appendChild(header);
    content.appendChild(separator);
    content.appendChild(body);
    return content;
}