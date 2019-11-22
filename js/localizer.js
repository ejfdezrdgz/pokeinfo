i18next.init({
    lng: 'es',
    debug: false,
    resGetPath: `../resources/locales/${lng}.json`
    // ,
    // resources: {
    //     en: {
    //         translation: {
    //             "pageTitle": "PokéInfo Encyclopedia",
    //             "key": "DOOM"
    //         }
    //     },
    //     es: {
    //         translation: {
    //             "pageTitle": "Enciclopedia PokéInfo",
    //             "key": "DOOM"
    //         }
    //     }
    // }
}, function (err, t) {
    document.getElementById('pageTitle').innerHTML = i18next.t('pageTitle');
});