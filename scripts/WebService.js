import {
    AsyncStorage,
} from "react-native";

import Config from "../Config/Config.js";
export default class WebService {

    constructor() {
        this.navigator = null;

        this.serveurSymfony = Config.serveur;

        //this.chargerTout();
    }

    chargerTout(callback) {
        let data = [];

        this.getEntites((data) => {
            let mots = data.mot,
                categories = data.section,
                langues = data.langue,
                traductions = data.traduction;

            this.chargerSections(categories, (data) => {
                data = this.chargerMots(mots, data);
            });
        });

        return typeof callback === "function" ?
            callback(data) :
            null;
    }

    chargerMots(mots, categories) {
        let temp = categories;

        mots.forEach((mot) => {
            temp[mots[0].section.idMere].filles[mots[0].section.id].mots[mot.id] = {
                libelle: mot.libelle,
                id: mot.id
            };
        });

        return temp;
    }

    chargerSections(sections, callback) {
        let liste = {},
            listeTemp = {},
            tempTot = {},
            temp = {};

        sections.forEach((section) => {
            tempTot[section.id] = section;
            temp[section.id] = section
        });

        Object.keys(tempTot).forEach((key) => {
            if (tempTot[key].idMere === null) {
                delete temp[key];
                liste[key] = {
                    libelle: tempTot[key].libelle,
                    filles: {},
                    id: key
                }
            }
        });

        Object.keys(temp).forEach((key) => {
            let section = tempTot[key];

            if (typeof listeTemp[section.idMere] === 'undefined' && typeof liste[section.idMere] === 'undefined') {
                listeTemp[section.idMere] = {
                    libelle: tempTot[section.idMere].libelle,
                    filles: {},
                    id: key,
                };
                listeTemp[section.idMere].filles[key] = {
                    libelle: section.libelle,
                    id: key,
                    mots: {}
                };
                delete temp[key];
            } else if (typeof listeTemp[section.idMere] !== 'undefined') {
                listeTemp[section.idMere].filles[key] = {
                    libelle: section.libelle,
                    id: key,
                    mots: {}
                };
                delete temp[key];
            }
        });

        Object.keys(listeTemp).forEach((key) => {
            liste[tempTot[key].idMere].filles[key] = {
                libelle: listeTemp[key].libelle,
                id: key,
                filles: listeTemp[key].filles
            };
            delete temp[key];
        });

        Object.keys(temp).forEach((key) => {
            liste[tempTot[key].idMere].filles[key] = {
                libelle: tempTot[key].libelle,
                id: key,
                mots: {}
            };
        });

        if (typeof callback === "function") {
            callback(liste);
        }
    }

    // ****************
    // STATIC
    // ****************

    static arrayFromHashes(first) {
        const temp = [];

        for (const i in first) {
            temp.push(first[i])
        }
        return temp;
    }

    // ****************
    // REQUEST / REPORT
    // ****************

    request(url, method, data, callback, fallback) {
        try {
            fetch(url, {
                method: method,
                body: data
            }).then((response) => {
                return response.status === 200 ?
                    response.json().then((response) => {
                        return typeof callback === "function" ?
                            callback(response) :
                            null;
                    })
                    :
                    (typeof fallback === "function" ?
                            fallback(response) :
                            null
                    );
            });
        } catch (error) {
            fallback(error);
        }
    }

    // **************
    // SET / RESET
    // **************

    // **************
    // Requests
    // **************

    getEntites(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/entites", "GET", null, callback, fallback);
    }

    getMots(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/mot", "GET", null, callback, fallback);
    }

    getCategories(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/section", "GET", null, callback, fallback);
    }

    getLangues(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/langue", "GET", null, callback, fallback);
    }

    getTraductions(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/traduction", "GET", null, callback, fallback);
    }
}