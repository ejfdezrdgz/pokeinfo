import { Pokemon } from "./pokemon.js";
import { type_colors } from "./constants.js";
import { back_colors, sortPokemon } from "./functions.js";

window.onload = function() {
    var stat;
    var pk_list = [];
    var searchBar = document.getElementById("searchBar");
    var orderSel = document.getElementById("orderSel");
    var sortDir = document.getElementById("sortdir");
    var ordercheck = document.getElementById("exactorder");
    var typeSels = document.getElementsByName("typeSel");
    var section = document.getElementById("content");
    var xml = new XMLHttpRequest();
    var url = "https://pokeapi.co/api/v2/pokemon/";
    var url_loc = "https://pokeapi.co/api/v2/pokemon-species/"

    xml.open("GET", url, true);
    xml.send();

    xml.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var r = JSON.parse(this.response);
            // loadPokemonList(r.results);
            loadPokemonList(r.results.slice(0, 151));
            // loadPokemonList(r.results.slice(0, 900));
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
        selector.onchange = filterPokemon;
    });
    ordercheck.onchange = filterPokemon;
    searchBar.onkeyup = searchPokemon;
    sortDir.onchange = orderPokemon;
    orderSel.onchange = orderPokemon;
    
    function orderPokemon() {
        stat = "";
        if (orderSel.value != "id") {
            stat = orderSel.value;
        }
        loadPokemonInfo(pk_list.sort(orderByStat));
    }

    function orderById(a, b) {
        if (sortDir.checked) {
            if (a.stats["id"] > b.stats["id"]) return 1
            else if (a.stats["id"] < b.stats["id"]) return -1
            else return 0
        } else {
            if (a.stats["id"] > b.stats["id"]) return -1
            else if (a.stats["id"] < b.stats["id"]) return 1
            else return 0
        }
    }

    function orderByStat(a, b) {
        if (sortDir.checked) {
            if (a.stats[stat] > b.stats[stat]) return 1
            else if (a.stats[stat] < b.stats[stat]) return -1
            else return 0
        } else {
            if (a.stats[stat] > b.stats[stat]) return -1
            else if (a.stats[stat] < b.stats[stat]) return 1
            else return 0
        }
    }

    function filterPokemon() {
        var sel1Value = document.getElementById("type1Sel").value;
        var sel2Value = document.getElementById("type2Sel").value;
        if (sel1Value == sel2Value) {
            sel2Value = "any";
        }
        var list = [];
        if (ordercheck.checked == true) {
            pk_list.forEach(pokemon => {
                if (sel1Value == "any" && sel2Value == "any") {
                    list.push(pokemon);
                } else if (pokemon.types["primary"] == sel1Value && pokemon.types["secondary"] == sel2Value) {
                    list.push(pokemon);
                } else if ((pokemon.types["primary"] == sel1Value && sel2Value == "any") || ((pokemon.types["secondary"] == sel2Value && sel1Value == "any"))) {
                    list.push(pokemon);
                }
            })
        } else {
            pk_list.forEach(pokemon => {
                if (sel1Value == "any" && sel2Value == "any") {
                    list.push(pokemon);
                } else if (sel1Value != "any" && sel2Value != "any") {
                    if (pokemon.types["primary"] == sel1Value && pokemon.types["secondary"] == sel2Value) {
                        list.push(pokemon);
                    }
                } else if ((sel1Value == "any" && sel2Value != "any") || (sel1Value != "any" && sel2Value == "any")) {
                    if (pokemon.types["primary"] == sel1Value || pokemon.types["primary"] == sel2Value || pokemon.types["secondary"] == sel1Value || pokemon.types["secondary"] == sel2Value) {
                        list.push(pokemon);
                    }
                }
            });
        }
        loadPokemonInfo(list);
    }

    function searchPokemon() {
        loadPokemonInfo(pk_list.filter(pokemon => {
            if (pokemon.name.toLowerCase().search(searchBar.value.toLowerCase()) >= 0) {
                return true;
            }
        }));
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

                    pk_list.sort(sortPokemon);
                    loadPokemonInfo(pk_list);

                    // if (pk_list.length >= 151) {
                    //     pk_list.sort(sortPokemon);
                    //     // console.log(pk_list);
                    //     loadPokemonInfo(pk_list);
                    // }
                }
            }
        });
    }

    function loadPokemonInfo(list) {
        section.innerHTML = "";
        document.getElementsByClassName("loader")[0].setAttribute("style", "display: none");
        list.forEach(pokemon => {
            var card = document.createElement("article");
            var a = document.createElement("a");
            a.innerText = pokemon.name;
            var img = document.createElement("img");
            img.src = pokemon.img;
            var span = document.createElement("span");
            span.innerHTML = `Nombre:<br> ${pokemon.name}<hr>Types:<br> ${pokemon.getTypes()}<hr>Stats:<br> ${pokemon.getStats()}`;
            span.className = "tooltiptext";
            card.appendChild(img);
            card.appendChild(a);
            card.appendChild(span);
            card.className = "tooltip";
            card.style = back_colors(pokemon);
            section.appendChild(card);
        })
    }
}