// components/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

interface LoginProps {
  onLogin: (role: string, id: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://ulsaceiit.xyz/users/iniciar_sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usrn: username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Login failed', errorData.mensaje || 'An error occurred');
        return;
      }

      const data = await response.json();
      onLogin(data.obj.role, data.obj._id);
    } catch (error) {
      Alert.alert('Login failed', 'An error occurred');
    }
  };

  return (
    <LinearGradient colors={['#6dd5ed', '#2193b0']} style={styles.gradient}>
      <View style={styles.container}>
        <Image source={require('../assets/logoInvMgr.png')} style={styles.image} />
        <Text style={styles.title}>ULSA CEIIT</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <TextInput
          placeholder="Username"
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
        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Forgot Password pressed')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
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
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
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
  forgotPassword: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Login;
