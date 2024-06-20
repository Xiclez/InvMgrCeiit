import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BarcodeScannerComponent = ({ onScan }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const url = `http://ulsaceiit.xyz/ulsa/searchObject?id=${encodeURIComponent(data)}`;

    console.log('Request URL:', url);

    try {
      const response = await axios.get(url);
      const object = response.data;
      if (!object.isAvailable) {
        Alert.alert(
          "Este objeto está bajo préstamo",
          "¿Desea realizar la devolución?",
          [
            {
              text: "Cancelar",
              onPress: () => setScanned(false),
              style: "cancel"
            },
            {
              text: "Aceptar",
              onPress: async () => {
                try {
                  const loanResponse = await axios.get(`http://ulsaceiit.xyz/ulsa/getLoanByObjectId?id=${object._id}`);
                  const loan = loanResponse.data;
                  console.log('Loan fetched:', loan);

                  const userResponse = await axios.get('http://ulsaceiit.xyz/users/buscar_usuario', { params: { id: loan.nameUser } });
                  const user = userResponse.data.usuarios.find(u => u._id === loan.nameUser);
                  console.log('User fetched:', user);

                  navigation.navigate('ReturnContractForm', { user, object, loanId: loan._id });
                } catch (error) {
                  console.error("Error al devolver el préstamo:", error);
                  Alert.alert("Error al devolver el préstamo");
                  setScanned(false);
                }
              }
            }
          ]
        );
      } else {
        onScan(object);
      }
    } catch (error) {
      console.error("Error fetching object data:", error);
      Alert.alert("Error al obtener datos del objeto");
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: 400 }}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
};

export default BarcodeScannerComponent;
