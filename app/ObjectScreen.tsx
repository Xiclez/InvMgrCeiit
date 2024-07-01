// ObjectScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';

const ObjectScreen = ({ navigation }) => {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchObjects = async () => {
    try {
      console.log('Fetching objects...');
      const response = await fetch('http://ulsaceiit.xyz/ulsa/getAllObjects');
      const data = await response.json();
      console.log('Response from server:', data);
      if (data.objs) {
        const groupedObjects = groupBy(data.objs, 'NOMBRE');
        setObjects(groupedObjects);
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
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={Object.values(objects)}
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
});

export default ObjectScreen;
