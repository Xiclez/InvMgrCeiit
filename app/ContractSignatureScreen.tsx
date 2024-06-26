import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ContractSignature from '../components/ContractSignature';

const ContractSignatureScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, object } = route.params;

  return (
    <View style={styles.container}>
      <ContractSignature user={user} object={object} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ContractSignatureScreen;
