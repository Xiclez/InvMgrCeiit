import React from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';

export const contractText = (user, object, cellphone, ceiitName) => `
Contrato de Préstamo
Fecha: ${new Date().toLocaleDateString()}
Lugar: CEIIT ULSA Cd. Chihuahua, Chihuahua
Parte Prestamista: 
Parte Prestataria: 
Nombre: ${user.name} ${user.surName}
Matrícula: ${user.tuition}
Teléfono: ${cellphone || '[Agregar número de contacto]'}
Nombre del encargado: ${ceiitName || '[Agregar nombre del encargado]'}
Objeto del Préstamo: 
Nombre: ${object.NOMBRE}
Número de serie: ${object._id}
Condiciones del objeto al momento del préstamo: Óptimas
Condiciones del Préstamo:
1. Plazo del Préstamo: El objeto debe ser devuelto en condiciones óptimas el [agregar fecha límite].
2. Responsabilidades del Prestatario:
  o El prestatario se compromete a cuidar y mantener el objeto en condiciones óptimas durante el periodo del préstamo.
  o El prestatario deberá notificar inmediatamente al prestamista en caso de cualquier daño, pérdida o robo del objeto.
3. Devolución del Objeto:
  o El objeto debe ser devuelto al prestamista en FABLAB CEIIT ULSA.
  o El prestatario deberá asegurarse de que el objeto se encuentra en las mismas condiciones en que fue prestado.
4. Incumplimiento: En caso de no devolver el objeto en la fecha acordada o de devolverlo en condiciones no óptimas, el prestatario se compromete a cubrir el costo de reparación o total en caso de descompostura.
`;

const ContractText = ({ user, object, cellphone, setCellphone, ceiitName, setCeiitName }) => {
  return (
    <View>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Image source={require('../assets/logoInvMgr.png')} style={styles.logo} />
      </View>
      <Text style={styles.header}>Contrato de Préstamo</Text>
      <Text style={styles.text}><Text style={styles.bold}>Fecha:</Text> {new Date().toLocaleDateString()}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Lugar:</Text> CEIIT ULSA Cd. Chihuahua, Chihuahua</Text>
      <Text style={styles.text}><Text style={styles.bold}>Parte Prestataria:</Text></Text>
      <Text style={styles.text}><Text style={styles.bold}>Nombre:</Text> {user.name} {user.surName}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Matrícula:</Text> {user.tuition}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Teléfono:</Text> </Text>
      <TextInput
        style={styles.input}
        placeholder="Agregar número de contacto"
        value={cellphone}
        onChangeText={setCellphone}
      />
      <Text style={styles.text}><Text style={styles.bold}>Parte Prestamista:</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Agregar nombre del encargado"
        value={ceiitName}
        onChangeText={setCeiitName}
      />
      <Text style={styles.text}><Text style={styles.bold}>Objeto del Préstamo:</Text></Text>
      <Text style={styles.text}><Text style={styles.bold}>Nombre:</Text> {object.NOMBRE}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Número de serie:</Text> {object._id}</Text>
      <Text style={styles.text}><Text style={styles.bold}>Condiciones del objeto al momento del préstamo:</Text> Óptimas</Text>
      <Text style={styles.text}><Text style={styles.bold}>Condiciones del Préstamo:</Text></Text>
      <Text style={styles.text}>1. Plazo del Préstamo: El objeto debe ser devuelto en condiciones óptimas el [agregar fecha límite].</Text>
      <Text style={styles.text}>2. Responsabilidades del Prestatario:</Text>
      <Text style={styles.text}>  o El prestatario se compromete a cuidar y mantener el objeto en condiciones óptimas durante el periodo del préstamo.</Text>
      <Text style={styles.text}>  o El prestatario deberá notificar inmediatamente al prestamista en caso de cualquier daño, pérdida o robo del objeto.</Text>
      <Text style={styles.text}>3. Devolución del Objeto:</Text>
      <Text style={styles.text}>  o El objeto debe ser devuelto al prestamista en FABLAB CEIIT ULSA.</Text>
      <Text style={styles.text}>  o El prestatario deberá asegurarse de que el objeto se encuentra en las mismas condiciones en que fue prestado.</Text>
      <Text style={styles.text}>4. Incumplimiento: En caso de no devolver el objeto en la fecha acordada o de devolverlo en condiciones no óptimas, el prestatario se compromete a cubrir el costo de reparación o total en caso de descompostura.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
    fontSize: 16,
    padding: 10,
  },
});

export default ContractText;
