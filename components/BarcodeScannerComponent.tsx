import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';

const BarcodeScannerComponent = ({ onScan }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

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
        Alert.alert("Este objeto no está disponible, intente con otro");
      } else {
        onScan(object);
      }
    } catch (error) {
      console.error("Error fetching object data:", error);
      Alert.alert("Error al obtener datos del objeto");
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
