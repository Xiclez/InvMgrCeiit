import React, { useState } from 'react';
import { View, StyleSheet, Button, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ContractText from '../components/ContractText';

const ContractScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, object } = route.params;
  const [cellphone, setCellphone] = useState('');
  const [ceiitName, setCeiitName] = useState('');

  const handleNext = () => {
    navigation.navigate('ContractSignatureScreen', { user, object, cellphone, ceiitName });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ContractText 
        user={user} 
        object={object} 
        cellphone={cellphone} 
        setCellphone={setCellphone}
        ceiitName={ceiitName}
        setCeiitName={setCeiitName} 
      />
      <Button title="Next" onPress={handleNext} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default ContractScreen;
