import React, {Component} from 'react';
import {
    AsyncStorage,
    Dimensions,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";

import Couleurs from '../scripts/Couleurs';
import WebService from '../scripts/WebService';

import {ws} from '../index.js';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
    android:
        'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

var width = Dimensions.get('window').width,
    height = Dimensions.get('window').height;

export default class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            recherche: false,
            listeRecherche: [],
            listeData: [],
            resultat: true,
            derniers: true,
            categorie : null,
            activeSections: [],
        };

        this.props.navigator.setOnNavigatorEvent(this.DeepLinkEvent.bind(this));
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
                    this.chargerListe(true);
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
                this.setState({
                    listeData: WebService.arrayFromHashes(data)
                });
            })
        } else {
            ws.getMots(this.state.categorie, (liste) =>{
                this.setState({
                    listeData: WebService.arrayFromHashes(liste)
                });
            })
        }
    }

    setSection(section) {
        this.setState({
            activeSections: section,
        });
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Accordion
                    //Obligé de le mettre dans une scrollView, bug de la librairie, ne peut pas scroll dans l'accordion. cf. https://github.com/oblador/react-native-collapsible/issues/170
                    style={styles.container}
                    sectionContainerStyle={{marginBottom: 28}}
                    activeSections={this.state.activeSections}
                    sections={this.state.listeData}
                    touchableComponent={TouchableOpacity}
                    renderHeader={this.renderSectionTitle.bind(this)}
                    renderContent={this.renderContent.bind(this)}
                    duration={200}
                    onChange={this.setSection.bind(this)}
                />
            </ScrollView>
        );
    }

    renderItem(item) {
        return (
            <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>{item.libelle}</Text>
            </TouchableOpacity>
        );
    }

    renderSectionTitle(section) {
        return (
            <Text style={[styles.title, styles.titleText]}>
                {section.libelle}
            </Text>
        );
    }

    renderContent(section) {
        let liste = WebService.arrayFromHashes(section.filles);
        return (
            <FlatList
                contentContainerStyle={styles.liste}
                data={liste}
                extraData={this.state} //Permet de rerender à chaque textInput et eviter le textinput non modifiable
                renderItem={({item}) => this.renderItem(item)}
                keyExtractor={item => item.id.toString()}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Couleurs.lightGray
    },
    accordion: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Couleurs.lightGray
    },
    liste: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        width: width*0.85,
        borderRadius : 20,
        backgroundColor: Couleurs.blanc,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        paddingVertical: 5
    },
    titleText: {
        textAlign: 'center',
        fontSize: 20
    },
    item: {
        width: width*0.65,
        borderRadius : 10,
        backgroundColor: Couleurs.blanc,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        paddingVertical: 3
    },
    itemText: {
        textAlign: 'center',
        fontSize: 20
    }
});
