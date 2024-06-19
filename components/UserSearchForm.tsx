import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const UserSearchForm = ({ onUserSelect }) => {
  const [searchField, setSearchField] = useState('name');
  const [searchValue, setSearchValue] = useState('');

  const handleUserSearch = async () => {
    const params = {};
    params[searchField] = searchValue;

    console.log('Request Params:', params);

    try {
      const response = await axios.get('http://ulsaceiit.xyz/users/buscar_usuario', { params });
      const user = response.data;

      if (!user || user.usuarios.length === 0) {
        Alert.alert("Usuario no encontrado");
      } else {
        onUserSelect(user.usuarios[0]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error al buscar usuario");
    }
  };

  return (
    <View>
      <Picker
        selectedValue={searchField}
        onValueChange={(itemValue) => setSearchField(itemValue)}
      >
        <Picker.Item label="Nombre" value="name" />
        <Picker.Item label="Apellido" value="surName" />
        <Picker.Item label="Matrícula" value="tuition" />
      </Picker>
      <TextInput
        placeholder={`Buscar por ${searchField}`}
        value={searchValue}
        onChangeText={setSearchValue}
        keyboardType={searchField === 'tuition' ? 'numeric' : 'default'}
      />
      <Button title="Buscar" onPress={handleUserSearch} />
    </View>
  );
};

export default UserSearchForm;
