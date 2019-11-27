import { TYPE_BACK, TYPE_COLORS, RANGEDIC } from "./init.js";

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