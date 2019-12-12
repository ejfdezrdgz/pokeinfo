import { Pokemon } from "./pokemon.js";
import { loc_code, localizationCode } from "./localizer.js";
import { TYPE_BACK, TYPE_COLORS, RANGEDIC, API_URL, API_URL_POKE, API_URL_SPECIES, LANGUAGES, pk_num, storage, section, cardModal } from "./init.js";

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

export function initializePokemonList(list, num) {
    for (let i = 0; i < num; i++) {
        var pokemon = new Pokemon(i + 1, "", "", "", {}, {});
        list.push(pokemon);
    }
    fillPokemonBasicInfo(list);
}

export async function fillPokemonBasicInfo(list) {
    await list.forEach(pokemon => {
        var xml = new XMLHttpRequest();
        var url = API_URL + API_URL_POKE + pokemon.id;

        xml.open("GET", url, true);
        xml.send();
        xml.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("BASIC");
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
                });
            }
        }
    });
    fillPokemonExtraInfo(list);
}

function a(list) {
    return new Promise(resolve => {
        list.forEach(pokemon => {
            var xml = new XMLHttpRequest();
            var url = API_URL + API_URL_SPECIES + pokemon.id;

            xml.open("GET", url, true);
            xml.send();
            xml.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("EXTRA");
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
                    });
                }
            }
        })
        resolve();
    })
}

export async function fillPokemonExtraInfo(list) {
    await a(list);
    loadVaultedInfo(list);
}

export function loadVaultedInfo(list) {
    console.log("LOAD");
    loadCardInfo(list.sort(sortPokemon));
    storage.setItem("pkStrg", JSON.stringify(list));
}

export function savePokemonList(pk_list) {
    // TODO save list on finish loading data
    // if (pk_list.length >= pk_num) {
    //     loadCardInfo(pk_list.sort(sortPokemon));
    //     storage.setItem("pkStrg", JSON.stringify(pk_list));
    // }
}

export function loadCardInfo(list) {
    section.innerHTML = "";
    document.getElementsByClassName("loader")[0].setAttribute("style", "display: none");
    list.forEach(pokemon => {
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
        p.innerText = pokemon.loc_names[loc_code];
        p.className = "cardPokeName";
        var img = document.createElement("img");
        img.src = pokemon.img;
        card.appendChild(img);
        card.appendChild(p);
        card.appendChild(idCorner);
        card.appendChild(genCorner);
        section.appendChild(card);
    })
}

export function eventCard(evt) {
    var id = evt.currentTarget.id.slice(6);
    var pokemon = pk_list.filter(pk => {
        if (pk.id == id) return true;
    })[0]
    if (pokemon["evolChain"] != undefined) {
        buildModal(pokemon);
    } else {
        var xmlobj = new XMLHttpRequest();
        var url = url_sp + id + "/";
        xmlobj.open("GET", url, true);
        xmlobj.send(null);
        xmlobj.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var pkInfo = JSON.parse(this.response);
                var dList = pkInfo.flavor_text_entries.filter(d => {
                    if (d.language.name == loc_code) return true;
                })
                // pokemon.name = pkInfo.names.filter(n => {
                //     if (n.language.name == loc_code) return true;
                // })[0].name;
                pokemon.setDescription(dList);

                var xmlevol = new XMLHttpRequest();
                url = pkInfo.evolution_chain.url;
                xmlevol.open("GET", url, true);
                xmlevol.send(null);
                xmlevol.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var evolData = JSON.parse(this.response)["chain"];
                        if (evolData != undefined) {
                            var evolChain = [];
                            while (evolData["evolves_to"].length > 0) {
                                evolChain.push(evolData["species"]["name"]);
                                if (evolData["evolves_to"].length > 0) {
                                    evolData = evolData["evolves_to"][0];
                                }
                            }
                            evolChain.push(evolData["species"]["name"]);
                            pokemon.setEvolChain(evolChain);
                            storage.setItem("pkStrg", JSON.stringify(pk_list));
                            buildModal(pokemon);
                        }
                    }
                }
            }
        }
    }
}

export function buildModal(pokemon) {
    cardModal.style.display = "block";
    document.getElementById("detailCard").innerHTML = "";
    document.getElementById("detailCard").appendChild(htmlModal(pokemon));
}

export function htmlModal(pokemon) {
    var content = document.createElement("div");
    content.className = "modalCont";
    var header = document.createElement("div");
    header.className = "modalHeader";
    var body = document.createElement("div");
    var card = document.createElement("article");
    card.style = back_colors(pokemon);
    card.className = "modalCard";
    var separator = document.createElement("hr");
    var p = document.createElement("p");
    p.innerText = pokemon.name;
    var img = document.createElement("img");
    img.src = pokemon.img;
    var stats = document.createElement("div");
    stats.className = "modalStats";
    var evol = document.createElement("div");
    evol.className = "modalEvol";
    var ep = document.createElement("h4");
    ep.id = "evolP";
    ep.innerText = "Evolution chain";
    evol.appendChild(ep);
    var evolBody = document.createElement("div");
    evolBody.className = "evolBody";
    pokemon.evolChain.forEach(el => {
        var p = document.createElement("p");
        p.innerText = el;
        var sep = document.createElement("p");
        sep.innerText = "→";
        evolBody.appendChild(p);
        evolBody.appendChild(sep);
    });
    evolBody.removeChild(evolBody.lastChild);
    evol.appendChild(evolBody);
    var desc = document.createElement("div");
    pokemon.description.forEach(d => {
        var p = document.createElement("p");
        var text = d.flavor_text.split("\n").join(" ");
        p.innerText = text;
        p.className = "descP"
        desc.appendChild(p);
    });
    card.appendChild(img);
    card.appendChild(p);
    header.appendChild(card);
    header.appendChild(stats);
    header.appendChild(evol);
    body.appendChild(desc);
    content.appendChild(header);
    content.appendChild(separator);
    content.appendChild(body);
    return content;
}