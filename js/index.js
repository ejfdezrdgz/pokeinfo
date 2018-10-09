import { Pokemon } from "./pokemon.js";
import { type_colors } from "./constants.js";
import { back_colors, sortPokemon } from "./functions.js";

const GEN = { "1": 151, "2": 251, "3": 386, "4": 494 };

window.onload = function() {
    var pk_list = [];
    var pk_num = GEN["1"];
    var searchBar = document.getElementById("searchBar");
    var orderSel = document.getElementById("orderSel");
    var sortDir = document.getElementById("sortdir");
    var ordercheck = document.getElementById("exactorder");
    var typeSels = document.getElementsByName("typeSel");
    var section = document.getElementById("content");
    var xml = new XMLHttpRequest();
    var url = "https://pokeapi.co/api/v2/pokemon/";
    var url_loc = "https://pokeapi.co/api/v2/pokemon-species/"
    var loc_code = "en";

    xml.open("GET", url, true);
    xml.send(null);

    xml.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var r = JSON.parse(this.response);
            // loadPokemonList(r.results);
            loadPokemonList(r.results.slice(0, pk_num));
        }
    }

    typeSels.forEach(selector => {
        var opt = document.createElement("option");
        opt.innerText = "-- ANY TYPE --";
        opt.value = "any";
        opt.selected = true;
        selector.appendChild(opt);
        for (const key in type_colors) {
            var opt = document.createElement("option");
            opt.value = key;
            opt.innerText = key;
            selector.appendChild(opt);
        }
        selector.onchange = filterPk;
    });
    ordercheck.onchange = filterPk;
    searchBar.onkeyup = filterPk;
    sortDir.onchange = filterPk;
    orderSel.onchange = filterPk;

    function filterPk() {
        var pkName = searchBar.value;
        var type1 = document.getElementById("type1Sel").value;
        var type2 = document.getElementById("type2Sel").value;
        var filteredList;
        if (pkName != "") {
            filteredList = pk_list.filter(pokemon => {
                if (pokemon.name.toLowerCase().search(pkName.toLowerCase()) >= 0) {
                    return true;
                }
            })
        } else {
            filteredList = pk_list;
        }
        loadPokemonInfo(filteredList.filter(pokemon => {
            if (ordercheck.checked == true) {
                if (type1 == "any" && type2 == "any") {
                    return true;
                } else if (pokemon.types["primary"] == type1 && pokemon.types["secondary"] == type2) {
                    return true;
                } else if ((pokemon.types["primary"] == type1 && type2 == "any") || ((pokemon.types["secondary"] == type2 && type1 == "any"))) {
                    return true;
                }
            } else {
                if (type1 == "any" && type2 == "any") {
                    return true;
                } else if (type1 != "any" && type2 != "any") {
                    if (pokemon.types["primary"] == type1 && pokemon.types["secondary"] == type2) {
                        return true;
                    }
                } else if ((type1 == "any" && type2 != "any") || (type1 != "any" && type2 == "any")) {
                    if (pokemon.types["primary"] == type1 || pokemon.types["primary"] == type2 || pokemon.types["secondary"] == type1 || pokemon.types["secondary"] == type2) {
                        return true;
                    }
                }
            }
        }).sort(orderPk))
    }

    function orderPk(a, b) {
        var orderStat = orderSel.value;
        if (orderStat != "id") {
            if (sortDir.checked) {
                if (a.stats[orderStat] > b.stats[orderStat]) return 1
                if (a.stats[orderStat] < b.stats[orderStat]) return -1
            } else {
                if (a.stats[orderStat] > b.stats[orderStat]) return -1
                if (a.stats[orderStat] < b.stats[orderStat]) return 1
            }
        }
        if (sortDir.checked) {
            if (a.id > b.id) return -1
            if (a.id < b.id) return 1
        } else {
            if (a.id > b.id) return 1
            if (a.id < b.id) return -1
        }
        return 0;
    }

    function eventCard(evt) {
        var id = evt.currentTarget.id.slice(6);
        var xmlobj = new XMLHttpRequest();
        url = url_loc + id + "/";
        xmlobj.open("GET", url, true);
        xmlobj.send(null);
        xmlobj.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var pkInfo = JSON.parse(this.response);
                var pokemon = pk_list.find(pk => {
                    if (pk.id == id) return true;
                })
                var dList = pkInfo.flavor_text_entries.filter(d => {
                    if (d.language.name == loc_code) return true;
                })
                pokemon.name = pkInfo.names.filter(n => {
                    if (n.language.name == loc_code) return true;
                })[0].name;
                pokemon.setDescription(dList);
                modal.style.display = "block";
                document.getElementById("detailCard").innerHTML = "";
                document.getElementById("detailCard").appendChild(htmlCard(pokemon));

                console.log(pokemon);
            }
        }
    }

    function htmlCard(pokemon) {
        var card = document.createElement("article");
        var p = document.createElement("p");
        p.innerText = pokemon.name;
        var img = document.createElement("img");
        img.src = pokemon.img;
        card.appendChild(img);
        card.appendChild(p);
        card.style = back_colors(pokemon);
        return card;
    }

    function loadPokemonList(pokelist) {
        pokelist.forEach(pokemon => {
            var xml2 = new XMLHttpRequest();
            var url2 = pokemon.url;
            xml2.open("GET", url2, true);
            xml2.send();
            xml2.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var rp = JSON.parse(this.response);
                    var types = {};
                    rp.types.forEach(el => {
                        if (el.slot == 1) {
                            types["primary"] = el.type.name
                        } else if (el.slot == 2) {
                            types["secondary"] = el.type.name
                        }
                    });
                    var stats = {};
                    rp.stats.forEach(el => {
                        stats[el.stat.name] = el.base_stat
                    });
                    var pk = new Pokemon(rp.id, rp.name, rp.sprites.front_default, types, stats);
                    pk_list.push(pk);

                    // console.log(pk_list);

                    if (pk_list.length >= pk_num) {
                        pk_list.sort(sortPokemon);
                        loadPokemonInfo(pk_list);
                    }
                }
            }
        });
    }

    function loadPokemonInfo(list) {
        section.innerHTML = "";
        document.getElementsByClassName("loader")[0].setAttribute("style", "display: none");
        list.forEach(pokemon => {
            var card = document.createElement("article");
            card.onclick = eventCard;
            card.id = "pkcard" + pokemon.id;
            var p = document.createElement("p");
            p.innerText = pokemon.name;
            var img = document.createElement("img");
            img.src = pokemon.img;
            var span = document.createElement("span");
            span.innerHTML = `Nombre:<br> ${pokemon.name}<hr>Types:<br> ${pokemon.getTypes()}<hr>Stats:<br> ${pokemon.getStats()}`;
            span.className = "tooltiptext";
            card.appendChild(img);
            card.appendChild(p);
            card.appendChild(span);
            card.className = "tooltip";
            card.style = back_colors(pokemon);
            section.appendChild(card);
        })
    }

    var modal = document.getElementById('cardModal');
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}