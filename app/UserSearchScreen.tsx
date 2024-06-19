// app/UserSearchScreen.tsx
import React from 'react';
import { View } from 'react-native';
import UserSearchForm from '../components/UserSearchForm';
import { useNavigation, useRoute } from '@react-navigation/native';

const UserSearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { object } = route.params;

  const handleUserSelect = (user) => {
    navigation.navigate('ContractScreen', { user, object });
  };

  return (
    <View>
      <UserSearchForm onUserSelect={handleUserSelect} />
    </View>
  );
};

export default UserSearchScreen;
