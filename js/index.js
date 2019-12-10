import { pk_num, storage, searchBar, genSels, orderSel, sortDir, orderCheck, typeSels, RANGEDIC, TYPE_COLORS, initModalOffFunction } from "./init.js";
import { languageSelector, loadLocalization, loadPokemonLocalization } from "./localizer.js";
import { rangeCompress, rangePair, initializePokemonList, fillPokemonBasicInfo, fillPokemonExtraInfo, loadCardInfo } from "./functions.js";

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js');
// }

window.onload = function () {
    var gens = [];
    var range = [];
    var pk_list = [];

    if (storage.getItem("pkStrg") != null) {
        // var pkStrg = JSON.parse(storage.getItem("pkStrg"));
        // pkStrg.forEach(pokemon => {
        //     var pk = new Pokemon(pokemon.id, pokemon.url, pokemon.name, pokemon.img, pokemon.types, pokemon.stats);
        //     if (pokemon["description"] != undefined) pk.setDescription(pokemon.description);
        //     if (pokemon["evolChain"] != undefined) pk.setEvolChain(pokemon.evolChain);
        //     if (pokemon["loc_names"] != undefined) pk.setLocNames(pokemon.loc_names);
        //     pk_list.push(pk);
        // });
        // loadCardInfo(pk_list);
    } else {
        initializePokemonList(pk_list, pk_num);
        fillPokemonBasicInfo(pk_list);
        fillPokemonExtraInfo(pk_list);

        // var xml = new XMLHttpRequest();
        // xml.open("GET", url_pk_list, true);
        // xml.send(null);
        // xml.onreadystatechange = function () {
        //     if (this.readyState == 4 && this.status == 200) {
        //         var r = JSON.parse(this.response);
        //         loadPokemonInfoOnStorage(r.results.slice(0, pk_num));
        //     }
        // }
    }

    typeSels.forEach(selector => {
        var opt = document.createElement("option");
        var id = "any";
        opt.value = "any";
        opt.id = `t_${id}Type`;
        opt.className = "t_string";
        opt.innerText = i18next.t(`t_${id}Type`);
        opt.selected = true;
        selector.appendChild(opt);
        for (const key in TYPE_COLORS) {
            var opt = document.createElement("option");
            opt.value = key;
            opt.id = `t_${key}Type`;
            opt.className = "t_string";
            opt.innerText = key;
            selector.appendChild(opt);
        }
        selector.onchange = filterPk;
    });
    for (const key in genSels) {
        if (genSels.hasOwnProperty(key)) {
            const el = genSels[key];
            el.onclick = toggleGenButton;
        }
    }
    orderCheck.onchange = filterGen;
    searchBar.onkeyup = filterGen;
    sortDir.onchange = filterGen;
    orderSel.onchange = filterGen;

    loadLocalization();
    loadPokemonLocalization();
    languageSelector();
    initModalOffFunction();

    function checkRange(pokemon) {
        var r = false;
        range.forEach(subrange => {
            if (subrange[0] <= pokemon.id && subrange[1] >= pokemon.id) {
                r = true;
            }
        });
        return r;
    }

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
        loadCardInfo(filteredList.filter(pokemon => {
            if (orderCheck.checked == true) {
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
        }).filter(pokemon => { return checkRange(pokemon) }).sort(orderPk))
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

    function toggleGenButton(evt) {
        var sel = evt.currentTarget;
        if (sel.className == "genSel genSelOn") {
            sel.className = "genSel genSelOff";
        } else {
            sel.className = "genSel genSelOn";
        }
        filterGen();
    }

    function filterGen() {
        gens = [];
        range = [];
        var selectedGen = document.getElementsByClassName("genSelOn");
        for (const key in selectedGen) {
            if (selectedGen.hasOwnProperty(key)) {
                const el = selectedGen[key];
                gens.push(el.id.substring(3));
            }
        }
        gens.forEach(gen => {
            RANGEDIC[gen].forEach(el => {
                range.push(el);
            });
        });
        range = rangeCompress(range);
        range = rangePair(range);
        filterPk();
    }
}