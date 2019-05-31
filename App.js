import { Navigation } from 'react-native-navigation';

import Register from './scripts/Register';
import Couleurs from "./scripts/Couleurs";

try {
  Register.registerScreens(() => {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'SFA.main', // unique ID registered with Navigation.registerScreen
        navigatorStyle: {
          navBarCustomView: "SFA.NavBar",
          navBarBackgroundColor: Couleurs.header.background,
          navBarCustomViewInitialProps: {
            placeholder: "Rechercher",
            link: "recherche",
          },
          navBarComponentAlignment: "fill", //Pour ios, sinon sa prend que la moitié de l'écran
        }, // override the navigator style for the screen, see "Styling the navigator" below (optional)
      },
      drawer: { // optional, add this if you want a side menu drawer in your app
        left: { // optional, define if you want a drawer from the left
          screen: 'SFA.Tri' // unique ID registered with Navigation.registerScreen
        },
      }
    })
  });
}
catch(error) {
  console.log(error)
}

/*export default class App extends Component<Props> {

  constructor(props) {
    super(props);

    this.startApp();
  }

  startApp() {
    Navigation.events().registerAppLaunchedListener(() => {
      registerScreens(() => {
        Navigation.startSingleScreenApp({
          screen: {
            screen: 'example.test', // unique ID registered with Navigation.registerScreen
            title: 'Welcome', // title of the screen as appears in the nav bar (optional)
            navigatorStyle: {}, // override the navigator style for the screen, see "Styling the navigator" below (optional)
            navigatorButtons: {} // override the nav buttons for the screen, see "Adding buttons to the navigator" below (optional)
          },
        });
      });
    });
  }
  // start the app

}*/