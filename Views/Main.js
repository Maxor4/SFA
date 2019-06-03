import React, {Component} from 'react';
import {
    AsyncStorage,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import Couleurs from '../scripts/Couleurs';
import WebService from '../scripts/WebService';

import {ws} from '../index.js';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

export default class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            recherche: false,
            refreshing: false,
            listeRecherche: [],
            resultat: true,
            derniers: true,
            categorie : null,
        };

        this.props.navigator.setOnNavigatorEvent(this.DeepLinkEvent.bind(this));
        this.chargerListe(false);
    }

    DeepLinkEvent(event) {
        if (event.type === "DeepLink") {
            const parts = event.link.split("/");
            const payload = event.payload;

            switch (parts[0]) {

                case "rechercheProduit":
                    this.recherche(payload);
                    break;

                case "retourRecherche" :
                    this.setState({
                        recherche: false,
                        resultat: true,
                        derniers: true,
                    });
                    this.chargerListe();
                    break;

                case "recherche" :
                    if (!this.state.recherche) {
                        this.setState({
                            recherche: true,
                            derniers: true,
                        });
                    }
                    break;

                case "clearCache" :
                    this.setState({
                        listeRecherche: [],
                    });
                    break;
            }
        } else {
            switch (event.id){
                case "didAppear":
                    this.chargerListe();
                    this.setState({
                        recherche: false,
                    });
                    break;
                case "willDisappear":
                    this.setState({
                        recherche: false,
                    });
                    break;
            }
        }
    }

    recherche(text) {
        let present = false;

        if (typeof text === "undefined") {
            this.chargerListe();
            this.setState({
                refreshing: false,
                resultat: true,
                derniers: true,
            });
        } else {
            this.setState({refreshing: true}, () => {

                AsyncStorage.getItem("listeProduits", (err, rechercheValue) => {
                    const rechercheCache = JSON.parse(rechercheValue);

                    if (text !== null && text.length > 0) {
                        const productFilter = {},
                            regex = text.toLowerCase();

                        if (rechercheCache !== null) {
                            Object.keys(rechercheCache).forEach((key) => {
                                if (rechercheCache[key].libelle.toLowerCase().includes(regex) || rechercheCache[key].reference.toLowerCase().includes(regex)) {
                                    productFilter[key] = rechercheCache[key];
                                    present = true;
                                }
                            });
                        }

                        ws.rechercheProduit(text, (data) => {
                            if (data.produits.length > 0) {
                                present = true;
                                data.produits.forEach((produit) => {
                                    productFilter[produit.id_product+"-"+produit.id_product_attribute] = produit;
                                });
                            }

                            this.setState({
                                refreshing: false,
                                resultat: present,
                                derniers: !present,
                                listeRecherche: present ?
                                    productFilter :
                                    []
                            });
                        }, () => {
                            this.setState({
                                refreshing: false,
                                resultat: present,
                                derniers: !present,
                            });
                        });
                    } else {
                        this.setState({
                            refreshing: false,
                            resultat: present,
                            derniers: !present,
                        });
                    }
                });
            });
        }
    }

    chargerListe(categories) {
        if(categories){
            ws.chargerTout((data) => {
                console.log(data);
                this.setState({
                    listeRecherche: data
                });
            })
        } else {
            ws.getMots(this.state.categorie, (liste) =>{
                this.setState({
                    listeRecherche: liste
                });
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to hgfhfgfg Native!</Text>
                <Text style={styles.instructions}>To get started, edit App.js</Text>
                <Text style={styles.instructions}>{instructions}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
