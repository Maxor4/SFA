import {
    AsyncStorage,
} from "react-native";

import Config from "../Config/Config.js";
export default class WebService {

    constructor() {
        this.navigator = null;

        this.serveurSymfony = Config.serveur;
    }

    chargerTout(callback) {
        this.getCategories((data) => {
            this.chargerSections(data, (liste) => {
                return typeof callback === "function" ?
                    callback(liste) :
                    null;
            });
        });
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

    getMots(id_section, callback, fallback) {
        this.request(this.serveurSymfony + "/lister/mot/section="+id_section, "GET", null, callback, fallback);
    }

    getAllMots(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/mot", "GET", null, callback, fallback);
    }

    getCategories(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/section", "GET", null, callback, fallback);
    }

    getLangues(callback, fallback) {
        this.request(this.serveurSymfony + "/lister/langue", "GET", null, callback, fallback);
    }

    getTraductions(id_section, id_langue, callback, fallback) {
        this.request(this.serveurSymfony + "/lister/traduction/section="+id_section+"/langue="+id_langue, "GET", null, callback, fallback);
    }

    getTraductionMot(id_mot, id_langue, callback, fallback) {
        this.request(this.serveurSymfony + "/lister/traduction/mot="+id_mot+"/langue="+id_langue, "GET", null, callback, fallback);
    }
}