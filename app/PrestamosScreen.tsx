import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import axios from 'axios';

const PrestamosScreen = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrestamos = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await fetch('http://ulsaceiit.xyz/ulsa/getAllLoans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Loans fetched:', data);
      const loans = await Promise.all(data.obj.map(async (loan) => {
        try {
          const userResponse = await axios.get('http://ulsaceiit.xyz/users/buscar_usuario', {
            params: { id: loan.nameUser },
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const objectResponse = await axios.get(`http://ulsaceiit.xyz/ulsa/searchObject`, {
            params: { id: loan.nameObj },
            headers: { 'Authorization': `Bearer ${token}` },
          });
          console.log('User fetched:', userResponse.data);
          console.log('Object fetched:', objectResponse.data);
          const user = userResponse.data.usuarios.find(u => u._id === loan.nameUser);
          const object = objectResponse.data;
          return {
            ...loan,
            userName: user ? user.name : 'N/A',
            userApellido: user ? user.surName : 'N/A',
            userMatricula: user ? user.tuition : 'N/A',
            objectName: object ? object.NOMBRE : 'N/A',
          };
        } catch (error) {
          console.error('Error fetching user or object data:', error);
          return loan;
        }
      }));
      setPrestamos(loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      Alert.alert("Error al obtener los préstamos");
    }
  };

  useEffect(() => {
    fetchPrestamos();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrestamos().then(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>Nombre: {item.userName}</Text>
      <Text>Apellido: {item.userApellido}</Text>
      <Text>Matrícula: {item.userMatricula}</Text>
      <Text>Objeto: {item.objectName}</Text>
      <Text>Fecha Apertura: {new Date(item.date).toLocaleString()}</Text>
      {item.status ? (
        <Text>Status: Activo</Text>
      ) : (
        <>
          <Text>Fecha Cierre: {item.returnDate ? new Date(item.returnDate).toLocaleString() : 'N/A'}</Text>
          <Text>Status: Inactivo</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={prestamos}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default PrestamosScreen;
