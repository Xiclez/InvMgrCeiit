// app/HomeScreen.tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Button title="Escanear QR" onPress={() => navigation.navigate('ScannerScreen')} />
    </View>
  );
};

export default HomeScreen;
