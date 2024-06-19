import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/HomeScreen';
import ScannerScreen from './app/ScannerScreen';
import UserSearchScreen from './app/UserSearchScreen';
import ContractScreen from './app/ContractScreen';
import PrestamosScreen from './app/PrestamosScreen';
import { registerRootComponent } from 'expo';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ScannerStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
      <Stack.Screen name="UserSearchScreen" component={UserSearchScreen} />
      <Stack.Screen name="ContractScreen" component={ContractScreen} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Scanner" component={ScannerStack} />
        <Tab.Screen name="Prestamos" component={PrestamosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;

registerRootComponent(App);
