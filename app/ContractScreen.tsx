// app/ContractScreen.tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ContractForm from '../components/ContractForm';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import qs from 'qs';

const ContractScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, object } = route.params;

  const handleLoanRegister = async ({ userId, ceiitId, date }) => {
    const contractData = {
       userId,
     ceiitId
    };

    try {
      const response = await axios.post(
        'http://ulsaceiit.xyz/ulsa/loanObject',
        qs.stringify(contractData),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (response.status === 200) {
        Alert.alert("Préstamo registrado con éxito");
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error("Error registrando el préstamo:", error);
      Alert.alert("Error registrando el préstamo");
    }
    console.log(contractData)
  };

  return (
    <View style={styles.container}>
      <ContractForm user={user} object={object} onLoanRegister={handleLoanRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ContractScreen;
