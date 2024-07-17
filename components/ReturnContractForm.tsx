import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Button, Alert, StyleSheet, TextInput, Platform } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import cloudinaryConfig from './cloudinaryConfig';  // Importa la configuración de Cloudinary

const ReturnContractForm = ({ route }) => {
  const { user, object, loanId } = route.params;
  const [ceiitName, setCeiitName] = useState('');
  const [returnSignature, setReturnSignature] = useState('');
  const [receiverSignature, setReceiverSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const returnSignRef = useRef(null);
  const receiverSignRef = useRef(null);
  const [logoBase64, setLogoBase64] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (!user || !object || !loanId) {
      Alert.alert("Error", "No se han pasado los parámetros necesarios");
      navigation.goBack();
      return;
    }
    console.log("User:", user);
    console.log("Object:", object);
    console.log("Loan ID:", loanId);

    const loadLogo = async () => {
      const base64 = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'logo_base64.txt');
      setLogoBase64(base64);
    };
    loadLogo();
  }, [user, object, loanId]);

  const handleSaveSignatures = () => {
    console.log("Saving signatures...");
    returnSignRef.current.readSignature();
    receiverSignRef.current.readSignature();
    setIsSigned(true);
    Alert.alert("Firmas guardadas correctamente");
  };

  const handleSaveContract = async () => {
    console.log("Saving contract...");
    if (!ceiitName || !returnSignature || !receiverSignature) {
      Alert.alert("Por favor complete todos los campos");
      return;
    }

    const fileUri = await getFileUri();
    console.log("File URI:", fileUri);
    if (fileUri) {
      await saveForm(fileUri);
      const cloudinaryUrl = await uploadToCloudinary(fileUri);
      if (cloudinaryUrl) {
        await handleReturnRegisterClick(cloudinaryUrl);
        await shareFile(fileUri);
      }
    }
  };

  const handleReturnRegisterClick = async (cloudinaryUrl) => {
    console.log("Registering return with Cloudinary URL:", cloudinaryUrl);
    const requestData = {
      loanId: loanId, 
      linkCloseLoan: cloudinaryUrl 
    };
    console.log("Request data:", requestData);

    try {
      const response = await axios.post('http://ulsaceiit.xyz/ulsa/returnLoan', requestData, { headers: { 'Content-Type': 'application/json' } });
      console.log("Response from server:", response.data);
      if (response.status === 200) {
        Alert.alert("Devolución registrada correctamente");
        navigation.navigate('ScannerScreen');
      } else {
        throw new Error(response.data.mensaje || "Error desconocido");
      }
    } catch (error) {
      console.error("Error al registrar la devolución:", error);
      Alert.alert("Error al registrar la devolución");
    }
  };

  const handleReturnSignature = (signature) => {
    console.log("Return signature captured");
    setReturnSignature(signature);
  };

  const handleReceiverSignature = (signature) => {
    console.log("Receiver signature captured");
    setReceiverSignature(signature);
  };

  const clearForm = () => {
    console.log("Clearing form...");
    setCeiitName('');
    setReturnSignature('');
    setReceiverSignature('');
    setIsSigned(false);
    returnSignRef.current.clearSignature();
    receiverSignRef.current.clearSignature();
  };

  const saveForm = async (fileUri) => {
    try {
      console.log("Creating PDF document...");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño A4 en puntos
      const { width, height } = page.getSize();
      const fontSize = 12;
      const margin = 50;
      const lineSpacing = 16;
      let y = height - margin;

      // Insertar la imagen en la esquina superior derecha
      if (logoBase64) {
        const logoImage = await pdfDoc.embedPng(`data:image/png;base64,${logoBase64}`);
        page.drawImage(logoImage, {
          x: width - margin - 100, // Ajustar la posición en la esquina superior derecha
          y: height - margin - 100,
          width: 100,
          height: 100,
        });
      }

      const addText = (text, maxWidth) => {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let testWidth = fontSize * 0.6 * testLine.length; // Aproximar ancho de la línea
          if (testWidth > maxWidth && n > 0) {
            page.drawText(line, { x: margin, y, size: fontSize, color: rgb(0, 0, 0) });
            line = words[n] + ' ';
            y -= lineSpacing;
          } else {
            line = testLine;
          }
        }
        page.drawText(line, { x: margin, y, size: fontSize, color: rgb(0, 0, 0) });
        y -= lineSpacing;
      };

      addText('Contrato de Devolución', width - 2 * margin);
      y -= lineSpacing;
      addText(new Date().toLocaleDateString(), width - 2 * margin);
      y -= lineSpacing;
      addText(object.lugar || 'Cd. Chihuahua, Chihuahua', width - 2 * margin);
      y -= lineSpacing;

      const contractText = `Por medio del presente, se certifica que ${user.name || ''} ${user.surName || ''} con matrícula ${user.tuition || ''} ha devuelto el objeto ${object.NOMBRE || ''} con número de serie ${object._id} en óptimas condiciones, y que ha sido inspeccionado y validado su funcionamiento y condiciones.`;
      addText(contractText, width - 2 * margin);
      y -= lineSpacing;
      addText(`Nombre del encargado: ${ceiitName}`, width - 2 * margin);

      if (returnSignature) {
        const returnSignatureImage = await pdfDoc.embedPng(`data:image/png;base64,${returnSignature}`);
        page.drawImage(returnSignatureImage, {
          x: margin,
          y: y - 6 * lineSpacing,
          width: 100,
          height: 50,
        });
        y -= 6 * lineSpacing;
        addText(ceiitName, width - 2 * margin); // Leyenda debajo de la firma del aval
      }

      if (receiverSignature) {
        const receiverSignatureImage = await pdfDoc.embedPng(`data:image/png;base64,${receiverSignature}`);
        page.drawImage(receiverSignatureImage, {
          x: margin,
          y: y - 6 * lineSpacing,
          width: 100,
          height: 50,
        });
        y -= 6 * lineSpacing;
        addText(user.name, width - 2 * margin); // Leyenda debajo de la firma del que recibe
      }

      const pdfBytes = await pdfDoc.saveAsBase64();
      console.log("Writing PDF document to file system...");
      await FileSystem.writeAsStringAsync(fileUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Checking if file exists:", fileUri);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("El archivo PDF no se pudo crear.");
      }

      console.log("File saved successfully");

      Alert.alert(`Formulario guardado en ${fileUri}`);
    } catch (error) {
      console.error("Error saving form:", error.message);
      Alert.alert("Error al guardar el formulario: " + error.message);
    }
  };

  const getFileUri = async () => {
    const fileName = `return_contract_${new Date().getTime()}.pdf`;
    let fileUri = '';

    if (Platform.OS === 'android') {
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
    } else if (Platform.OS === 'ios') {
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
    } else {
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
    }

    console.log("Generated file URI:", fileUri);
    return fileUri;
  };

  const uploadToCloudinary = async (fileUri) => {
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: 'application/pdf',
      name: `return_contract_${new Date().getTime()}.pdf`,
    });
    data.append('upload_preset', cloudinaryConfig.upload_preset); // Usando el preset configurado

    try {
      console.log("Uploading to Cloudinary with data:", data);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/upload`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log("Cloudinary upload response:", response.data);
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      Alert.alert("Error al subir el archivo a Cloudinary");
      return null;
    }
  };

  const shareFile = async (fileUri) => {
    if (await Sharing.isAvailableAsync()) {
      console.log("Sharing file:", fileUri);
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert("No se puede compartir el archivo en esta plataforma.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{new Date().toLocaleDateString()}</Text>
      <Text style={styles.text}>{object.lugar || 'Cd. Chihuahua, Chihuahua'}</Text>
      <Text style={styles.text}>
        Por medio del presente, se certifica que {user.name} {user.surName} con matrícula {user.tuition} ha devuelto el objeto {object.NOMBRE} con número de serie {object._id} en óptimas condiciones, y que ha sido inspeccionado y validado su funcionamiento y condiciones.
      </Text>
      <TextInput
        style={styles.largeInput}
        placeholder="Nombre del encargado"
        value={ceiitName}
        onChangeText={setCeiitName}
        editable={!isSigned}
      />
      <Text>Firma del Aval</Text>
      <SignatureCanvas
        ref={returnSignRef}
        onOK={handleReturnSignature}
        onEmpty={() => setReturnSignature('')}
        descriptionText="Firma"
        clearText="Limpiar"
        confirmText="Guardar"
        webStyle={`.m-signature-pad--footer { display: none; }`}
        backgroundColor={isSigned ? 'white' : 'transparent'}
        penColor={isSigned ? 'black' : 'blue'}
        dotSize={isSigned ? 0 : 1}
      />
      <Text>Firma del Recibidor</Text>
      <SignatureCanvas
        ref={receiverSignRef}
        onOK={handleReceiverSignature}
        onEmpty={() => setReceiverSignature('')}
        descriptionText="Firma"
        clearText="Limpiar"
        confirmText="Guardar"
        webStyle={`.m-signature-pad--footer { display: none; }`}
        backgroundColor={isSigned ? 'white' : 'transparent'}
        penColor={isSigned ? 'black' : 'blue'}
        dotSize={isSigned ? 0 : 1}
      />
      <Button title="Guardar Firmas" onPress={handleSaveSignatures} />
      <Button title="Limpiar" onPress={clearForm} />
      <Button title="Guardar Contrato" onPress={handleSaveContract} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  largeInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
    fontSize: 16,
    padding: 10,
    height: 60,
    textAlignVertical: 'top',
  },
});

export default ReturnContractForm;
