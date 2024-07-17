import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput, Platform } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import cloudinary from './cloudinaryConfig';

const ContractForm = ({ user, object, onLoanRegister }) => {
  const [ceiitName, setCeiitName] = useState('');
  const [loanSignature, setLoanSignature] = useState('');
  const [receiverSignature, setReceiverSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
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
    console.log("Saving signatures...");
    loanSignRef.current.readSignature();
    receiverSignRef.current.readSignature();
    setIsSigned(true);
    Alert.alert("Firmas guardadas correctamente");
  };

  const handleSaveContract = async () => {
    console.log("Saving contract...");
    if (!ceiitName || !loanSignature || !receiverSignature) {
      Alert.alert("Por favor complete todos los campos");
      return;
    }

    const fileUri = await getFileUri();
    console.log("File URI:", fileUri);
    if (fileUri) {
      await saveForm(fileUri);
      const cloudinaryUrl = await uploadToCloudinary(fileUri);
      if (cloudinaryUrl) {
        handleLoanRegisterClick(cloudinaryUrl);
        await shareFile(fileUri);
      }
    }
  };

  const handleLoanRegisterClick = (cloudinaryUrl) => {
    console.log("Registering loan with URL:", cloudinaryUrl);
    onLoanRegister({
      userId: user._id,
      ceiitId: object._id,
      date: new Date().toISOString(),
      linkOpenLoan: cloudinaryUrl,
    });
    Alert.alert("Préstamo registrado correctamente");
  };

  const handleLoanSignature = (signature) => {
    console.log("Loan signature captured");
    setLoanSignature(signature);
  };

  const handleReceiverSignature = (signature) => {
    console.log("Receiver signature captured");
    setReceiverSignature(signature);
  };

  const clearForm = () => {
    console.log("Clearing form...");
    setCeiitName('');
    setLoanSignature('');
    setReceiverSignature('');
    setIsSigned(false);
    loanSignRef.current.clearSignature();
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

      addText('Contrato de Préstamo', width - 2 * margin);
      y -= lineSpacing;
      addText(new Date().toLocaleDateString(), width - 2 * margin);
      y -= lineSpacing;
      addText(object.Lugar || '', width - 2 * margin);
      y -= lineSpacing;

      const contractText = `Por medio del presente, doy fe que ${user.name || ''} ${user.surName || ''} con matrícula ${user.tuition || ''} tiene en su poder el objeto ${object.NOMBRE || ''} con número de serie ${object._id} en óptimas condiciones y se compromete a regresarlo igualmente en condiciones en el plazo establecido.`;
      addText(contractText, width - 2 * margin);
      y -= lineSpacing;
      addText(`Nombre del encargado: ${ceiitName}`, width - 2 * margin);

      if (loanSignature) {
        const loanSignatureImage = await pdfDoc.embedPng(`data:image/png;base64,${loanSignature}`);
        page.drawImage(loanSignatureImage, {
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
    const fileName = `contract_form_${new Date().getTime()}.pdf`;
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
      name: `contract_form_${new Date().getTime()}.pdf`,
    });
    data.append('upload_preset', 'contracts'); // Reemplaza con tu upload preset de Cloudinary

    try {
      console.log("Uploading to Cloudinary with data:", data);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dbdy6vu2o/upload`,
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
      <Text style={styles.text}>{object.Lugar}</Text>
      <Text style={styles.text}>
        Por medio del presente, doy fe que {user.name} {user.surName} con matrícula {user.tuition} tiene en su poder el objeto {object.NOMBRE} con número de serie {object._id} en óptimas condiciones y se compromete a regresarlo igualmente en condiciones en el plazo establecido.
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

export default ContractForm;
