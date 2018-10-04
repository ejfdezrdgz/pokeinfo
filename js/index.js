import { Pokemon } from "./pokemon.js";

const type_back = `background: _COLOR1_;
background: linear-gradient(-45deg, _COLOR1_ 0%, _COLOR1_ 40%, _COLOR2_ 60%, _COLOR2_ 100%);`;
const type_colors = {
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
    "fairy": "#EE99AC",
    "unknown": "#68A090",
    "shadow": "#68A090"
}

window.onload = function() {
    var list = [];
    var section = document.getElementById("contenido");
    var xml = new XMLHttpRequest();
    var url = "https://pokeapi.co/api/v2/pokemon/";
    var url_loc = "https://pokeapi.co/api/v2/pokemon-species/"

    xml.open("GET", url, true);
    xml.send();

    xml.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var r = JSON.parse(this.response);
            loadPokemonList(r.results.slice(0, 151));
        }
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
                    list.push(pk);
                    if (list.length >= 151) {
                        list.sort(sortPokemon);
                        console.log(list);
                        loadPokemonInfo();
                    }
                }
            }
        });
    }

    function loadPokemonInfo() {
        list.forEach(pokemon => {
            var card = document.createElement("article");
            var a = document.createElement("a");
            a.innerText = pokemon.name;
            var img = document.createElement("img");
            img.src = pokemon.img;
            var span = document.createElement("span");
            span.innerHTML = `Nombre: ${pokemon.name}`;
            span.className = "tooltiptext";
            card.appendChild(img);
            card.appendChild(a);
            card.appendChild(span);
            card.className = "tooltip";
            card.style = back_colors(pokemon);
            section.appendChild(card);
        })
    }

    function back_colors(pk) {
        var style = type_back;
        var cp, cs;
        cp = cs = type_colors[pk.types["primary"]];
        if (pk.types["secondary"] != undefined) {
            cs = type_colors[pk.types["secondary"]];
        }
        style = style.split('_COLOR1_').join(cp);
        style = style.split('_COLOR2_').join(cs);
        return style;
    }

    function sortPokemon(a, b) {
        if (a.id > b.id) return 1
        else if (a.id < b.id) return -1
        else return 0
    }
}