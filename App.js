import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/HomeScreen';
import ScannerScreen from './app/ScannerScreen';
import UserSearchScreen from './app/UserSearchScreen';
import ContractScreen from './app/ContractScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
        <Stack.Screen name="UserSearchScreen" component={UserSearchScreen} />
        <Stack.Screen name="ContractScreen" component={ContractScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

registerRootComponent(App);
