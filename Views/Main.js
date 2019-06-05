import React, {Component} from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import Icon from'react-native-vector-icons/Ionicons';

import Couleurs from '../scripts/Couleurs';
import WebService from '../scripts/WebService';

import {ws} from '../index.js';

var width = Dimensions.get('window').width;

export default class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            recherche: false,
            refreshing: false,
            collapsed: true,
            sections: true,
            mots: false,
            listeRecherche: [],
            listeData: [],
            sousSections: [],
            listeMots: [],
            categorie : null,
            activeSections: [],
            section: null,
            langue : 32,
            openId: null
        };

        this.props.navigator.setOnNavigatorEvent(this.DeepLinkEvent.bind(this));
    }

    DeepLinkEvent(event) {
        if (event.type === "DeepLink") {
            const parts = event.link.split("/");
            const payload = event.payload;

            switch (parts[0]) {

                case "recherche":
                    this.setState({
                        recherche: true
                    }, () => {
                        this.recherche(payload);
                    });
                    break;

                case "retourRecherche" :
                    this.return();
                    break;

                case "clearCache" :
                    this.setState({
                        listeRecherche: [],
                    });
                    break;

                case "langue" :
                    this.setState({
                        langue: payload,
                    }, () => {
                        this.changerLangue()
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

    changerLangue(){
        let mots = this.state.listeMots;

        ws.getTraductions(this.state.section.id, this.state.langue, (traductions) => {
            mots.forEach((mot) => {
                mot.traduction = '';
                traductions.forEach((traduction) => {
                    if (traduction.mot.id === mot.id){
                        mot.traduction = traduction.libelle
                    }
                });
            });

            this.setState({
                listeMots: mots
            })
        });
    }

    recherche(text) {
        let present = false,
            productArray = [];

        if (typeof text === "undefined") {
            this.chargerListe();
            this.setState({
                sections: true,
                mots : false
            });
        } else {
            ws.getAllMots((mots) => {
                if (text !== null && text.length > 0) {
                    let productFilter = {},
                        regex = text.toLowerCase();

                    if (mots !== null) {
                        Object.keys(mots).forEach((key) => {

                            if (mots[key].libelle.toLowerCase().includes(regex)) {
                                productFilter[key] = mots[key];
                                present = true;
                            }
                        });
                    }

                    productArray = WebService.arrayFromHashes(productFilter);

                    productArray.forEach((mot) => {
                        ws.getTraductionMot(mot.id, this.state.langue, (traductions) => {
                            mot.traduction = '';
                            traductions.forEach((traduction) => {
                                if (traduction.mot.id === mot.id){
                                    mot.traduction = traduction.libelle
                                }
                            });
                        });
                    });

                    this.setState({
                        sections: false,
                        mots: true,
                        listeMots: productArray
                    })
                } else {
                    this.chargerListe();
                    this.setState({
                        sections: true,
                        mots : false
                    });
                }
            })
        }
    }

    chargerListe() {
        ws.chargerTout((data) => {
            this.setState({
                listeData: WebService.arrayFromHashes(data)
            });
        })
    }

    return(){
        this.setState({
            recherche: false,
            sections: true,
            mots: false,
            activeSections: []
        });
    }

    render() {
        if(this.state.sections){
            return (
                <ScrollView contentContainerStyle={styles.container} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.chargerListe.bind(this)}
                        enabled={true}
                    />
                }>
                    <Accordion
                        //Obligé de le mettre dans une scrollView, bug de la librairie, ne peut pas scroll dans l'accordion. cf. https://github.com/oblador/react-native-collapsible/issues/170
                        style={styles.container}
                        sectionContainerStyle={styles.contentAccordion}
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
        } else {
            let section = typeof this.state.section !== 'undefined' && this.state.section !== null;

            return (
                <View style={styles.container}>
                    {!this.state.recherche ?
                        <TouchableOpacity onPress={this.return.bind(this)} style={{position: 'absolute', top : 10, left: 15}}>
                            <Icon name={"ios-arrow-round-back"} style={styles.iconeBack}/>
                        </TouchableOpacity>:
                        null
                    }
                    {section ?
                        <Text style={styles.titreSection}>{this.state.section.libelle}</Text> :
                        null
                    }
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={!section ? styles.container : null}>
                        <FlatList
                            contentContainerStyle={styles.liste}
                            data={this.state.mots ? this.state.listeMots : this.state.sousSections}
                            extraData={this.state} //Permet de rerender à chaque textInput et eviter le textinput non modifiable
                            renderItem={({item}) => this.renderItem(item)}
                            keyExtractor={item => item.id.toString()}
                        />
                    </ScrollView>
                </View>
            )
        }
    }

    renderItem(item) {
        if(this.state.mots){
            let open = (item.id === this.state.openId && !this.state.collapsed);

            return (
                <View style={styles.viewTrad}>
                    <TouchableOpacity style={[styles.title, {marginBottom : open ? 8 : 28}]} onPress={this.setOpen.bind(this, item.id)}>
                        <Text style={styles.titleText}>{item.libelle}</Text>
                    </TouchableOpacity>
                    {open?
                        <View style={styles.traduction}>
                            <Text style={styles.traductionText}>{item.traduction}</Text>
                        </View> :
                        null
                    }
                </View>
            )
        }
        return (
            <TouchableOpacity style={styles.item} onPress={this.openSection.bind(this, item)}>
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

    setSection(section) {
        this.setState({
            activeSections: section,
        });
    }

    setOpen(id) {
        this.setState({
            collapsed : id === this.state.openId ? !this.state.collapsed : false,
            openId: id,
        });
    }

    openSection(section){
        if(typeof section.filles !== 'undefined'){
            this.setState({
                sections: false,
                sousSections : WebService.arrayFromHashes(section.filles)
            })
        }
        else {
            ws.getMots(section.id, (mots) =>{
                ws.getTraductions(section.id, this.state.langue, (traductions) => {
                    mots.forEach((mot) => {
                        mot.traduction = '';
                        traductions.forEach((traduction) => {
                            if (traduction.mot.id === mot.id){
                                mot.traduction = traduction.libelle
                            }
                        });
                    });

                    this.setState({
                        section: section,
                        sections: false,
                        mots: true,
                        listeMots: mots
                    })
                });
            })
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Couleurs.lightGray
    },
    contentAccordion: {
        marginBottom: 28
    },
    liste: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Couleurs.lightGray
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
    },
    traduction: {
        overflow: 'visible',
        width: width*0.65,
        borderRadius : 10,
        backgroundColor: Couleurs.list.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
        paddingVertical: 3,
    },
    traductionText: {
        textAlign: 'center',
        fontSize: 18
    },
    viewTrad: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    titreSection: {
        marginVertical : 40,
        color: Couleurs.mainColors.orange,
        fontSize : 26,
        textAlign: 'center'
    },
    iconeBack: {
        fontSize: 40,
        color: Couleurs.noir,
    }
});
