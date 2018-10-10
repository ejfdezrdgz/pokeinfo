import { Pokemon } from "./pokemon.js";
import { type_colors } from "./constants.js";
import { back_colors, sortPokemon } from "./functions.js";

const GEN = { "1": 151, "2": 251, "3": 386, "4": 494, "5": 649 };

window.onload = function() {
    var pk_list = [];
    var pk_num = GEN["1"];
    var storage = window.localStorage;
    var searchBar = document.getElementById("searchBar");
    var orderSel = document.getElementById("orderSel");
    var sortDir = document.getElementById("sortdir");
    var ordercheck = document.getElementById("exactorder");
    var typeSels = document.getElementsByName("typeSel");
    var section = document.getElementById("content");
    var url = "https://pokeapi.co/api/v2/pokemon/";
    var url_sp = "https://pokeapi.co/api/v2/pokemon-species/"
    var url_evo = "https://pokeapi.co/api/v2/evolution-chain/";
    var loc_code = "en";

    if (storage.getItem("pkStrg") != null) {
        var pkStrg = JSON.parse(storage.getItem("pkStrg"));
        pkStrg.forEach(pokemon => {
            var pk = new Pokemon(pokemon.id, pokemon.name, pokemon.img, pokemon.types, pokemon.stats);
            if (pokemon["description"] != undefined) pk.setDescription(pokemon.description);
            if (pokemon["evolChain"] != undefined) pk.setEvolChain(pokemon.evolChain);
            pk_list.push(pk);
        });
        loadPokemonInfo(pk_list);
    } else {
        var xml = new XMLHttpRequest();
        xml.open("GET", url, true);
        xml.send(null);
        xml.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var r = JSON.parse(this.response);
                // loadPokemonList(r.results);
                loadPokemonList(r.results.slice(0, pk_num));
            }
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
        var pokemon = pk_list.filter(pk => {
            if (pk.id == id) return true;
        })[0]
        if (pokemon["evolChain"] != undefined) {
            buildModal(pokemon);
        } else {
            var xmlobj = new XMLHttpRequest();
            url = url_sp + id + "/";
            xmlobj.open("GET", url, true);
            xmlobj.send(null);
            xmlobj.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var pkInfo = JSON.parse(this.response);
                    var dList = pkInfo.flavor_text_entries.filter(d => {
                        if (d.language.name == loc_code) return true;
                    })
                    pokemon.name = pkInfo.names.filter(n => {
                        if (n.language.name == loc_code) return true;
                    })[0].name;
                    pokemon.setDescription(dList);

                    var xmlevol = new XMLHttpRequest();
                    url = pkInfo.evolution_chain.url;
                    xmlevol.open("GET", url, true);
                    xmlevol.send(null);
                    xmlevol.onreadystatechange = function() {
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

    function buildModal(pokemon) {
        modal.style.display = "block";
        document.getElementById("detailCard").innerHTML = "";
        document.getElementById("detailCard").appendChild(htmlModal(pokemon));
    }

    function htmlModal(pokemon) {
        var content = document.createElement("div");
        content.className = "modalCont";
        var header = document.createElement("div");
        header.className = "modalHeader";
        var body = document.createElement("div");
        var card = document.createElement("article");
        card.style = back_colors(pokemon);
        var separator = document.createElement("hr");
        var p = document.createElement("p");
        p.innerText = pokemon.name;
        var img = document.createElement("img");
        img.src = pokemon.img;
        var stats = document.createElement("div");
        stats.className = "modalStats";
        // Add stats
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
                        loadPokemonInfo(pk_list.sort(sortPokemon));
                        storage.setItem("pkStrg", JSON.stringify(pk_list));
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
            card.className = "tooltip mainArticle";
            card.style = back_colors(pokemon);
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