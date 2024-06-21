import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Image, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';


const logoHome = require('../Images/logo_home.png'); 

const Home = () => {
  const navigation = useNavigation();

  const [login, setLogin] = useState({
    email: '',
    password: ''
  });
  const [isInputFocused, setIsInputFocused] = useState(false);

  async function handleSubmit() {
    if (!login.email || !login.password) {
      Alert.alert('Por favor, preencha os campos de Email e Senha.');
      return;
    }
    try {
      const data = {
        email: login.email,
        password: login.password
      };

      const response = await api.post('/usuarios/authentication', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        const token = response.data.jwtToken;
        const user = response.data.user;
        const now = new Date();
        await AsyncStorage.setItem('jwtToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('timestamp', now.getTime().toString());
        navigation.navigate("Index");
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Usuário ou senha inválidos!');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {!isInputFocused && (
          <View style={styles.imageContainer}>
            <Image
              source={logoHome}
              style={styles.image}
            />
            <Text style={styles.welcomeText}>Bem vindo ;)</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Image
            source={{ uri: 'https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2024-1-e4-proj-infra-t4-connectlocal/blob/main/src/frontend/src/images/ConnectLogo.png?raw=true' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Entrar</Text>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitle}>
              Novo por aqui?{' '}
            </Text>
            <TouchableOpacity onPress={() => {
              console.log('Navigating to Cadastro');
              navigation.navigate('Cadastro');
            }}>
              <Text style={styles.link}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@exemplo.com"
              keyboardType="email-address"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onChangeText={(text) => setLogin({ ...login, email: text })}
              value={login.email}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              maxLength={8}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onChangeText={(text) => setLogin({ ...login, password: text })}
              value={login.password}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 120,
    resizeMode: 'contain',

  },
  welcomeText: {
    position: 'absolute',
    alignItems: 'center',
    top: 80,
    fontSize: 30,
    color: '#5a67d8',
  },
 formContainer: {
    width: '100%',
    height: '70%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: '70%',
    height: '10%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5a67d8',
    marginBottom: 10,
  },
  subTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  link: {
    color: '#5a67d8',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginLeft: 5,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#cbd5e0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#5a67d8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
