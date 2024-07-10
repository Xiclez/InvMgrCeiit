import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Image, TouchableOpacity, TextInput } from 'react-native';

const ObjectScreen = ({ navigation }) => {
  const [objects, setObjects] = useState<any[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  const fetchObjects = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      console.log('Fetching objects...');
      const response = await fetch('http://ulsaceiit.xyz/ulsa/getAllObjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Response from server:', data);
      if (data.objs) {
        const groupedObjects = groupBy(data.objs, 'NOMBRE');
        setObjects(groupedObjects);
        setFilteredObjects(groupedObjects); // Set filteredObjects to be the same as objects initially
        console.log('Objects set:', groupedObjects);
      } else {
        console.log('No objects found in response');
      }
    } catch (error) {
      console.error('Error fetching objects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredObjects(objects);
    } else {
      const filtered = Object.values(objects).filter(item =>
        item[0].NOMBRE.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredObjects(filtered);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ObjectDetail', { objects: item })}>
      <Image
        style={styles.image}
        source={{ uri: item[0].imgURL }}
        resizeMode="cover"
      />
      <Text style={styles.label}>{item[0].NOMBRE}</Text>
    </TouchableOpacity>
  );

  const numColumns = 2;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={searchText}
        onChangeText={handleSearch}
      />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={filteredObjects}
          renderItem={renderItem}
          keyExtractor={item => item[0]._id.$oid}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
    width: (Dimensions.get('window').width / 2) - 20,
  },
  image: {
    width: '100%',
    height: 150,
  },
  label: {
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 10,
  },
});

export default ObjectScreen;
