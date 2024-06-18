import AsyncStorage from '@react-native-async-storage/async-storage';

export const logOut = async () => {
  try {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('timestamp');
  } catch (error) {
    console.error('Error clearing app data.', error);
    throw error;
  }
};
