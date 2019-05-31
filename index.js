/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import WebService from './scripts/WebService';

var ws = new WebService();

export {ws}

AppRegistry.registerComponent(appName, () => App);
