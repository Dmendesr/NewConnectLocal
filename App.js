import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Index from './screens/Index';
import Servico from './screens/Servico';
import User from './screens/User';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer  style={styles.container}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name='Home' component={Home} />
          <Stack.Screen name='Cadastro' component={Cadastro} />
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="Servico" component={Servico} />
          <Stack.Screen name="User" component={User} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
