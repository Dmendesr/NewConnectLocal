import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { api } from '../services/api';

const User = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUser(user);
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return <Text>Carregando...</Text>;
    }

    const handleLogout = async () => {
        try {
            // Limpa os dados de usuário do AsyncStorage
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('jwtToken');
            // Redireciona o usuário para a tela inicial ('Home')
            navigation.navigate('Home');
        } catch (error) {
            console.error('Erro ao realizar logout:', error);
            Alert.alert('Erro ao realizar logout. Por favor, tente novamente mais tarde.');
        }
    };

    const handleCEPInput = (cep) => {
        cep = cep.replace(/\D/g, '');
        if (cep.length === 8) {
            handleCEPChange(cep);
        } else {
            setUser({ ...user, cep });
        }
    };

    const handleCEPChange = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                Alert.alert('CEP não encontrado');
                return;
            }
            setUser({
                ...user,
                rua: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf
            });
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const handleSubmit = async () => {
        const data = { ...user };
        delete data.id;
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        const url = `/usuarios/${user.id}`;
        const response = await api.put(url, data, {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        });
        if (response.status == 204) {
            const response = await api.get(url, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`
                }
            });
            if (response.status === 200) {
                const updatedUser = response.data;
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                Alert.alert('Dados atualizados com sucesso!');
                navigation.navigate('User', { updatedUser });
            }
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Olá, <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
                </Text>
                <Button title="Log Out" onPress={handleLogout} color="#841584" />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput
                    style={styles.input}
                    value={user.name}
                    onChangeText={(name) => setUser({ ...user, name })}
                />

                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={user.email}
                    onChangeText={(email) => setUser({ ...user, email })}
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Número:</Text>
                <TextInput
                    style={styles.input}
                    value={user.contato}
                    onChangeText={(contato) => setUser({ ...user, contato })}
                    keyboardType="phone-pad"
                />

                {user.cpf && (
                    <>
                        <Text style={styles.label}>CPF:</Text>
                        <TextInput
                            style={styles.input}
                            value={user.cpf}
                            onChangeText={(cpf) => setUser({ ...user, cpf })}
                            keyboardType="numeric"
                        />
                    </>
                )}

                {user.cnpj && (
                    <>
                        <Text style={styles.label}>CNPJ:</Text>
                        <TextInput
                            style={styles.input}
                            value={user.cnpj}
                            onChangeText={(cnpj) => setUser({ ...user, cnpj })}
                            keyboardType="numeric"
                        />
                    </>
                )}

                <Text style={styles.label}>CEP:</Text>
                <TextInput
                    style={styles.input}
                    value={user.cep}
                    onChangeText={handleCEPInput}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Rua:</Text>
                <TextInput
                    style={styles.input}
                    value={user.rua}
                    onChangeText={(rua) => setUser({ ...user, rua })}
                />

                <Text style={styles.label}>Número:</Text>
                <TextInput
                    style={styles.input}
                    value={user.numero}
                    onChangeText={(numero) => setUser({ ...user, numero })}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Complemento:</Text>
                <TextInput
                    style={styles.input}
                    value={user.complemento}
                    onChangeText={(complemento) => setUser({ ...user, complemento })}
                />

                <Text style={styles.label}>Bairro:</Text>
                <TextInput
                    style={styles.input}
                    value={user.bairro}
                    onChangeText={(bairro) => setUser({ ...user, bairro })}
                />

                <Text style={styles.label}>Cidade:</Text>
                <TextInput
                    style={styles.input}
                    value={user.cidade}
                    onChangeText={(cidade) => setUser({ ...user, cidade })}
                />

                <Text style={styles.label}>Estado:</Text>
                <TextInput
                    style={styles.input}
                    value={user.estado}
                    onChangeText={(estado) => setUser({ ...user, estado })}
                />

                <View style={styles.buttonContainer}>
                    <Button title="Voltar" onPress={() => navigation.navigate('Index')} color="#FFA500" />
                    <Button title="Salvar" onPress={handleSubmit} color="#008000" />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    userName: {
        color: '#841584'
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        fontSize: 16
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16
    }
});

export default User;
