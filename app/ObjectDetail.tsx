// ObjectDetail.tsx
import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';

const ObjectDetail = ({ route, navigation }) => {
  const { objects } = route.params;
  const object = objects[0];

  const handleLoanRequest = () => {
    // Implementar lógica de solicitud de préstamo aquí
    alert(`Solicitud de préstamo para ${object.NOMBRE} enviada.`);
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{ uri: object.imgURL }} />
      <Text style={styles.title}>{object.NOMBRE}</Text>
      <Text style={styles.subtitle}>Disponibles: {objects.length}</Text>
      <Button title="Solicitar préstamo" onPress={handleLoanRequest} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ObjectDetail;
