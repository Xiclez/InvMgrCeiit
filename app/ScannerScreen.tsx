// app/ScannerScreen.tsx
import React from 'react';
import { View } from 'react-native';
import BarcodeScannerComponent from '../components/BarcodeScannerComponent';
import { useNavigation } from '@react-navigation/native';

const ScannerScreen = () => {
  const navigation = useNavigation();

  const handleScan = (object) => {
    navigation.navigate('UserSearchScreen', { object });
  };

  return (
    <View>
      <BarcodeScannerComponent onScan={handleScan} />
    </View>
  );
};

export default ScannerScreen;
