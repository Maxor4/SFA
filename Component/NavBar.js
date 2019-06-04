import React, { Component} from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import {Navigation, ScreenVisibilityListener as RNNScreenVisibilityListener} from "react-native-navigation";
import Couleurs from "../scripts/Couleurs";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Couleurs.transparent,
        paddingVertical: 10,
        paddingRight: 12,
    },
    bouton: {
        flex: 0.2,
        marginLeft: 10
    },
    boutonFocus: {
        flex: 0.3,
        marginLeft: 10
    },
    onFocus:{
        height: 40,
        color: Couleurs.noir,
        backgroundColor:Couleurs.blanc,
        fontSize: 16,
        paddingLeft: 10,
        borderRadius:5,
    },
    focusFlex1:{
        flex: 0.7,
    },
    focusFlex2:{
        flex: 1,
    },
    focusFlex3:{
        flex: 0.8,
    },
    textBouton:{
        color: Couleurs.mainColors.orange,
        backgroundColor: Couleurs.transparent,
        fontSize: 16
    }
});


export default class NavBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            focusInput: false,
            text : "",
            rechercheEffectue: false
        };

    }

    componentDidMount() {
        // lien doc pour listener :https://wix.github.io/react-native-navigation/#/screen-api?id=listen-to-visibility-events-globally
        this.listener = new RNNScreenVisibilityListener({
            //Mis willAppear à la place de didDisappear car navigator ne lit pas didDisappear et willDisappear sur ios
            willAppear: ({screen}) => {
                if ((screen === "SFA.Main" || screen === "SFA.Main") && (this.state.text.length > 0 || this.state.focusInput)) {
                    this.setState({
                        text : "",
                        focusInput: false,
                    });
                }
            },
        });
        this.listener.register();
    }

    /**
     * RENDER
     */

    render() {

        const flex = (this.state.text.length > 0 && !this.state.rechercheEffectuee) ?
            styles.focusFlex1 :
            styles.focusFlex3;

        return (
            <View style={styles.container}>
                <TextInput
                    style={[
                        styles.onFocus,
                        this.state.focusInput ? flex : styles.focusFlex2
                    ]}
                    underlineColorAndroid={Couleurs.transparent}
                    returnKeyType={"done"}
                    selectionColor={Couleurs.blanc}
                    selectTextOnFocus={true}
                    onFocus={this.rechercheFocus.bind(this,"reponse")}
                    placeholder={typeof this.props.placeholder !== "undefined" ?
                        this.props.placeholder :
                        "Rechercher"
                    }
                    placeholderTextColor={Couleurs.noir}
                    onChangeText={(text) => {
                        this.setState({
                            text : text,
                            rechercheEffectuee: false
                        });
                    }}
                    value={this.state.text}
                    onSubmitEditing={this.sendRecherche.bind(this)}
                />

                {this.renderBouton()}
            </View>
        );
    }

    renderBouton() {
        if (!this.state.focusInput) {
            return null;
        } else if (this.state.text.length > 0 && !this.state.rechercheEffectuee){
            return (
                <TouchableOpacity style={styles.boutonFocus}
                                  onPress={this.sendRecherche.bind(this)}>
                    <Text style={styles.textBouton}>Rechercher</Text>
                </TouchableOpacity>
            );
        } 
            return (
                <TouchableOpacity style={styles.bouton}
                                  onPress={this.handleBtnRetour.bind(this)}>
                    <Text style={styles.textBouton}>Annuler</Text>
                </TouchableOpacity>
            );
        
    }

    /**
     * FONCTIONS
     */

    sendRecherche() {
        Keyboard.dismiss();
        if (this.state.text !== null && this.state.text.length > 0) {
            Navigation.handleDeepLink({
                link: this.props.link,
                payload: this.state.text
            });

            this.setState({
                rechercheEffectuee: true
            });
        }
    }

    rechercheFocus() {
        this.setState({
            focusInput:true,
        });
    }

    handleBtnRetour() {
        Navigation.handleDeepLink({
            link: "retourRecherche",
        });
        this.setState({
            text: "",
            focusInput:false,
            rechercheEffectue: false
        });
        Keyboard.dismiss();
    }
}
