import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo1 from '../assets/logo.png';
import logo2 from '../assets/logoInvMgr.png';

interface LoginProps {
  onLogin: (token: string, username: string) => void;
}

const API_URL = 'http://ulsaceiit.xyz/users';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/iniciar_sesion`, {
        usrn: username,
        password: password,
      });

      console.log('Server response:', response.data); // Log the entire response

      if (!response.data || !response.data.jwt) {
        throw new Error('Invalid response from server');
      }

      const token = response.data.jwt;
      onLogin(token, username); // Set the username from input as the response doesn't include it

      // Set token and username in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('username', username);
      setError('');
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <LinearGradient colors={['#6dd5ed', '#2193b0']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={logo1} style={styles.logo} />
          <Image source={logo2} style={styles.logo} />
        </View>
        <Text style={styles.title}>ULSA CEIIT</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <TextInput
          placeholder="Username or email"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>SIGN IN</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Forgot Password pressed')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <Text style={styles.signupPrompt}>Don't have an account? <TouchableOpacity><Text style={styles.signupLink}>Sign up</Text></TouchableOpacity></Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    right: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#4c669f',
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
  forgotPassword: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
  },
  signupPrompt: {
    color: '#fff',
    fontSize: 14,
  },
  signupLink: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});

export default Login;
