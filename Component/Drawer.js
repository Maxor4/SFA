/**
 * Created by krlme on 06/10/2017.
 */
/**
 * Created by krlme on 03/10/2017.
 */
import React, { Component} from 'react';
import {
    Dimensions,
    FlatList, Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import Couleurs from '../scripts/Couleurs';
import WebService from '../scripts/WebService';

import {ws} from '../index.js';

var width = Dimensions.get('window').width,
    height = Dimensions.get('window').height,
    topBarHeight = 56,
    navBarHeight = Platform.select({
        ios: 66,
        android: 54
    });

const styles = StyleSheet.create({
    container: {
        height: height,
        backgroundColor: Couleurs.darkGray,
        width: width/2.3,
        paddingHorizontal: 5,
        marginTop: topBarHeight,
        marginBottom: navBarHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    filtreMain : {
        width: width/2.6,
        height: 35,
        borderWidth: 1,
        justifyContent: 'center',
        borderRadius:5,
        marginBottom: 15,
    },
    filtre: {
        backgroundColor: Couleurs.list.background
    },
    filtreSelection: {
        backgroundColor: Couleurs.header.background,
    },
    filtreTitre:{
        color: Couleurs.mainColors.orange,
        textAlign: 'center',
        fontSize: 20
    },
    titre: {
        color: Couleurs.mainColors.orange,
        marginVertical: 45,
        fontSize: 28,
    }
});

export default class Drawer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            langue: 25,
            langues : []
        };

        this.props.navigator.setStyle({
            navBarHidden: true
        });
    }

    componentDidMount() {
        this.chargerLangues();
    }

    chargerLangues(){
        ws.getLangues((data) => {
            let langues = WebService.arrayFromHashes(data);

            this.setState({
                langues: langues
            })
        });
    }


    setTri(choix){
        this.setState({langue: choix}, () => {
           this.props.navigator.handleDeepLink({
                link: 'langue',
                payload: this.state.langue
            })
        })
    }

    renderItem(langue){
        return (
            <TouchableOpacity style={[styles.filtreMain, this.state.langue === langue.id ? styles.filtreSelection : styles.filtre]} onPress={()=> {this.setTri(langue.id)}}>
                <Text style={styles.filtreTitre}>{langue.libelle}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.titre}>Langue</Text>
                <FlatList
                    data={this.state.langues}
                    extraData={this.state} //Permet de rerender à chaque textInput et eviter le textinput non modifiable
                    renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
        );

    }
}
