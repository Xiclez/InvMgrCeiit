import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/HomeScreen';
import ScannerScreen from './app/ScannerScreen';
import UserSearchScreen from './app/UserSearchScreen';
import ContractScreen from './app/ContractScreen';
import ContractSignatureScreen from './app/ContractSignatureScreen';
import PrestamosScreen from './app/PrestamosScreen';
import ObjectScreen from './app/ObjectScreen';
import ObjectDetail from './app/ObjectDetail'; // Importamos la nueva pantalla de detalles
import BarcodeScannerComponent from './components/BarcodeScannerComponent';
import ReturnContractForm from './components/ReturnContractForm';
import Login from './components/Login';
//import NotificationsScreen from './app/NotificationsScreen'; // Importamos la nueva pantalla de notificaciones

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ObjectStack() {
  return (
    <Stack.Navigator initialRouteName="ObjectScreen">
      <Stack.Screen name="Objetos" component={ObjectScreen} />
      <Stack.Screen name="ObjectDetail" component={ObjectDetail} />
      
      
    </Stack.Navigator>
  );
}

function ScannerStack() {
  return (
    <Stack.Navigator initialRouteName="Scanner">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
      <Stack.Screen name="UserSearchScreen" component={UserSearchScreen} />
      <Stack.Screen name="ContractScreen" component={ContractScreen} />
      <Stack.Screen name="ContractSignatureScreen" component={ContractSignatureScreen} />
      <Stack.Screen name="BarcodeScannerComponent" component={BarcodeScannerComponent} />
      <Stack.Screen name="ReturnContractForm" component={ReturnContractForm} />
    </Stack.Navigator>
  );
}

const App: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogin = (userRole: string, id: string) => {
    setRole(userRole);
    setUserId(id);
  };

  if (!role) {
    return <Login onLogin={(userRole: string, id: string) => handleLogin(userRole, id)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Objetos" component={ObjectStack} />
        {role === 'Desarrollador' && <Tab.Screen name="Scanner" component={ScannerStack} />}
        <Tab.Screen name="Prestamos">
          {props => <PrestamosScreen {...props} role={role} userId={userId} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
