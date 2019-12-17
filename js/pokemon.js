export class Pokemon {
    constructor(id, url, name, img, types, stats) {
        this.id = id;
        this.url = url;
        this.name = name;
        this.img = img;
        this.types = types;
        this.stats = stats;
    }

    getTypes() {
        var types = "";
        if (this.types["secondary"] != undefined) {
            types = this.types["primary"] + "/" + this.types["secondary"];
        } else {
            types = this.types["primary"];
        }
        return types;
    }

    getStats() {
        var stats = "";
        for (const key in this.stats) {
            stats += key + ": " + this.stats[key] + "<br>";
        }
        return stats;
    }

    setLocNames(loc_names) {
        this.loc_names = loc_names;
    }

    setEvolChain(evolChain) {
        this.evolChain = evolChain;
    }

    setDescription(desc) {
        this.description = desc;
    }
}