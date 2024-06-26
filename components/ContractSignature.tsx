import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import SignatureCanvas from 'react-native-signature-canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import qs from 'qs';
import { contractText } from './ContractText'; // Import the contract text

const ContractSignature = () => {
  const route = useRoute();
  const { user, object, cellphone, ceiitName } = route.params || {};

  const [loanSignature, setLoanSignature] = useState('');
  const [receiverSignature, setReceiverSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loanSignRef = useRef(null);
  const receiverSignRef = useRef(null);
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => {
    const loadLogo = async () => {
      const base64 = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'logo_base64.txt');
      setLogoBase64(base64);
    };
    loadLogo();
  }, []);

  const handleSaveSignatures = () => {
    loanSignRef.current.readSignature();
    receiverSignRef.current.readSignature();
    setIsSigned(true);
    Alert.alert("Firmas guardadas correctamente");
  };

  const handleSaveContract = async () => {
    if (!loanSignature || !receiverSignature) {
      Alert.alert("Por favor complete todos los campos");
      return;
    }

    setIsLoading(true);
    const fileUri = await getFileUri();
    if (fileUri) {
      await saveForm(fileUri);
      await registerLoan();
      await shareFile(fileUri);
      setIsLoading(false);
    }
  };

  const registerLoan = async () => {
    const contractData = {
      userId: user._id,
      ceiitId: object._id,
    };

    try {
      const response = await axios.post(
        'http://ulsaceiit.xyz/ulsa/loanObject',
        qs.stringify(contractData),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (response.status === 200) {
        Alert.alert("Préstamo registrado con éxito");
      }
    } catch (error) {
      console.error("Error registrando el préstamo:", error);
      Alert.alert("Error registrando el préstamo");
    }
  };

  const handleLoanSignature = (signature) => {
    setLoanSignature(signature);
  };

  const handleReceiverSignature = (signature) => {
    setReceiverSignature(signature);
  };

  const clearForm = () => {
    setLoanSignature('');
    setReceiverSignature('');
    setIsSigned(false);
    loanSignRef.current.clearSignature();
    receiverSignRef.current.clearSignature();
  };

  const saveForm = async (fileUri) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      const fontSize = 12;
      const margin = 50;
      const lineSpacing = 16;
      let y = height - margin;

      if (logoBase64) {
        const logoImage = await pdfDoc.embedPng(`data:image/png;base64,${logoBase64}`);
        page.drawImage(logoImage, {
          x: width - margin - 100,
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
          let testWidth = fontSize * 0.6 * testLine.length;
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

      const contractDetails = contractText(user, object, cellphone, ceiitName);
      const lines = contractDetails.split('\n');
      lines.forEach(line => {
        addText(line, width - 2 * margin);
      });

      if (loanSignature) {
        const loanSignatureImage = await pdfDoc.embedPng(`data:image/png;base64,${loanSignature}`);
        page.drawImage(loanSignatureImage, {
          x: margin,
          y: y - 6 * lineSpacing,
          width: 100,
          height: 50,
        });
        y -= 6 * lineSpacing;
        addText(ceiitName, width - 2 * margin);
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
        addText(`${user.name} ${user.surName}`, width - 2 * margin);
      }

      const pdfBytes = await pdfDoc.saveAsBase64();
      await FileSystem.writeAsStringAsync(fileUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("El archivo PDF no se pudo crear.");
      }

      Alert.alert(`Formulario guardado en ${fileUri}`);
    } catch (error) {
      console.error("Error saving form:", error.message);
      Alert.alert("Error al guardar el formulario: " + error.message);
    }
  };

  const getFileUri = async () => {
    const fileName = `contract_form_${new Date().getTime()}.pdf`;
    let fileUri = '';

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
    } else {
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
    }

    return fileUri;
  };

  const shareFile = async (fileUri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert("No se puede compartir el archivo en esta plataforma.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>{ceiitName}</Text>
      <SignatureCanvas
        ref={loanSignRef}
        onOK={handleLoanSignature}
        onEmpty={() => setLoanSignature('')}
        descriptionText="Firma"
        clearText="Limpiar"
        confirmText="Guardar"
        webStyle={`.m-signature-pad--footer { display: none; }`}
        backgroundColor={isSigned ? 'white' : 'transparent'}
        penColor={isSigned ? 'black' : 'blue'}
        dotSize={isSigned ? 0 : 1}
      />
      <Text>{user.name} {user.surName}</Text>
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
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button title="Guardar Firmas" onPress={handleSaveSignatures} />
          <Button title="Limpiar" onPress={clearForm} />
          <Button title="Guardar Contrato" onPress={handleSaveContract} />
        </>
      )}
    </ScrollView>
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
});

export default ContractSignature;
