/**
 * Created by mkerihuel on 01/12/2017.
 */

import { Navigation } from "react-native-navigation";

import Main from "../Views/Main";
import Tri from "../Component/Drawer";
import NavBar from '../Component/NavBar';

const Register = {
    registerScreens(callback) {

        Navigation.registerComponent('SFA.main', () => Main);
        Navigation.registerComponent('SFA.Tri', () => Tri);
        Navigation.registerComponent('SFA.NavBar', () => NavBar);


        if (typeof callback === "function"){
            callback();
        }
    }
};

module.exports = Register;
