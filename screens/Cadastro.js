import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, KeyboardAvoidingView }
    from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../services/api';

const Cadastro = () => {
    const navigation = useNavigation();
    const [etapa, setEtapa] = useState(1);
    const [tipoConta, setTipoConta] = useState("0");

    const [cadastro, setCadastro] = useState({
        nome: '',
        email: '',
        senha: '',
        senha1: '',
        contato: '',
        tipo: '0',
        doc: '',
    });

    const [endereco, setEndereco] = useState({
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
    });

    const avancarEtapa = () => {
        setEtapa(etapa + 1);
    };

    const retrocederEtapa = () => {
        setEtapa(etapa - 1);
    };


    const handleTipoContaChange = (value) => {
        setTipoConta(value);
        setCadastro({ ...cadastro, tipo: value });
    };

    const renderCamposAdicionais = () => {
        if (tipoConta === "0") {
            return (
                <>
                    <Text style={styles.label}>CPF:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu CPF..."
                        value={cadastro.doc}
                        onChangeText={(text) => setCadastro({ ...cadastro, doc: text })}
                        maxLength={11}
                        keyboardType="numeric"
                    />
                </>
            );
        } else if (tipoConta === "1") {
            return (
                <>
                    <Text style={styles.label}>CNPJ:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu CNPJ..."
                        value={cadastro.doc}
                        onChangeText={(text) => setCadastro({ ...cadastro, doc: text })}
                        maxLength={14}
                        keyboardType="numeric"
                    />
                </>
            );
        }
    };

    const handleCEPInput = (text) => {
        const cep = text.replace(/\D/g, '');
        if (cep.length === 8) {
            handleCEPChange(cep);
        } else {
            setEndereco({
                ...endereco,
                cep: text
            });
        }
    };

    const handleCEPChange = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                console.error('CEP não encontrado');
                return;
            }
            setEndereco({
                rua: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
                cep,
                numero: '',
                complemento: '',
            });
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const validarCadastro = () => {
        for (let key in cadastro) {
            if (!cadastro[key]) {
                return false;
            }
        }

        for (let key in endereco) {
            if (!endereco[key]) {
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        const camposPreenchidos = validarCadastro();
        if (!camposPreenchidos) {
            Alert.alert('Por favor, preencha todos os campos.');
            return;
        }

        if (cadastro.senha !== cadastro.senha1) {
            setEtapa(1);
            renderEtapa();
            return Alert.alert('Senhas são diferentes.');
        }

        try {
            let data = {
                type: tipoConta.toString(), // Converte para string
                name: cadastro.nome,
                password: cadastro.senha,
                contato: cadastro.contato,
                email: cadastro.email,
                rua: endereco.rua,
                numero: endereco.numero,
                complemento: endereco.complemento,
                bairro: endereco.bairro,
                cidade: endereco.cidade,
                estado: endereco.estado,
                cep: endereco.cep
            };

            // Adiciona o campo específico para CNPJ ou CPF, dependendo do tipo de conta
            if (tipoConta === "0") {
                data.cpf = cadastro.doc;
            } else if (tipoConta === "1") {
                data.cnpj = cadastro.doc;
            }

            const response = await api.post('/usuarios', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                Alert.alert('Usuário cadastrado com sucesso! Realize o Login.');
                navigation.navigate("Home");
            }
        } catch (error) {
            Alert.alert('Email já está em uso.');
        }
    };

    const renderEtapa = () => {
        switch (etapa) {
            case 1:
                return (
                    <View>
                        <Text style={styles.label}>Nome:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome completo..."
                            value={cadastro.nome}
                            onChangeText={(text) => setCadastro({ ...cadastro, nome: text })}
                            maxLength={100}
                        />

                        <Text style={styles.label}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="exemplo@exemplo.com"
                            value={cadastro.email}
                            onChangeText={(text) => setCadastro({ ...cadastro, email: text })}
                            maxLength={50}
                        />

                        <Text style={styles.label}>Senha:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={cadastro.senha}
                            onChangeText={(text) => setCadastro({ ...cadastro, senha: text })}
                            secureTextEntry
                            maxLength={30}
                        />

                        <Text style={styles.label}>Confirme a senha:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={cadastro.senha1}
                            onChangeText={(text) => setCadastro({ ...cadastro, senha1: text })}
                            secureTextEntry
                            maxLength={30}
                        />

                        <Text style={styles.label}>Número:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="(xx) xxxxx-xxxx"
                            value={cadastro.contato}
                            onChangeText={(text) => setCadastro({ ...cadastro, contato: text })}
                            maxLength={11}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.backButton]}>
                                <Text style={styles.buttonText}>Voltar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={avancarEtapa} style={[styles.button, styles.nextButton]}>
                                <Text style={styles.buttonText}>Próxima Etapa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text style={styles.label}>Tipo de conta:</Text>
                        <Picker
                            selectedValue={tipoConta.toString()}
                            onValueChange={handleTipoContaChange}
                            style={styles.input}
                        >
                            <Picker.Item label="Contratante" value="0" />
                            <Picker.Item label="Prestador" value="1" />
                        </Picker>

                        {renderCamposAdicionais()}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={retrocederEtapa} style={[styles.button, styles.backButton]}>
                                <Text style={styles.buttonText}>Etapa Anterior</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={avancarEtapa} style={[styles.button, styles.nextButton]}>
                                <Text style={styles.buttonText}>Próxima Etapa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text style={styles.label}>CEP:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu CEP..."
                            value={endereco.cep}
                            onChangeText={handleCEPInput}
                            maxLength={8}
                        />

                        <Text style={styles.label}>Rua:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Rua"
                            value={endereco.rua}
                            onChangeText={(text) => setEndereco({ ...endereco, rua: text })}
                            maxLength={100}
                        />

                        <Text style={styles.label}>Número:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Número"
                            value={endereco.numero}
                            onChangeText={(text) => setEndereco({ ...endereco, numero: text })}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Complemento:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Complemento"
                            value={endereco.complemento}
                            onChangeText={(text) => setEndereco({ ...endereco, complemento: text })}
                            maxLength={100}
                        />

                        <Text style={styles.label}>Bairro:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Bairro"
                            value={endereco.bairro}
                            onChangeText={(text) => setEndereco({ ...endereco, bairro: text })}
                        />

                        <Text style={styles.label}>Cidade:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Cidade"
                            value={endereco.cidade}
                            onChangeText={(text) => setEndereco({ ...endereco, cidade: text })}
                            maxLength={100}
                        />

                        <Text style={styles.label}>Estado:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Estado"
                            value={endereco.estado}
                            onChangeText={(text) => setEndereco({ ...endereco, estado: text })}
                            maxLength={100}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={retrocederEtapa} style={[styles.button, styles.backButton]}>
                                <Text style={styles.buttonText}>Etapa Anterior</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.nextButton]}>
                                <Text style={styles.buttonText}>Enviar Cadastro</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.header}>
                    <Image source={{
                        uri: 'https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2024-1-e4-proj-infra-t4-connectlocal/blob/main/src/frontend/src/images/ConnectLogo.png?raw=true'
                    }}
                        style={styles.logo} />
                    <Text style={styles.title}>Cadastro</Text>
                </View>
                {renderEtapa()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 10,
        //paddingTop: 20,
        paddingBottom: 10
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
    },
    logo: {
        width: 160,
        height: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#805ad5',
        marginTop: 10,
        marginBottom: 0
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    button: {
        flex: 1,
        borderRadius: 5,
        paddingVertical: 7,
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: '#FFD700',
        marginRight: 10,
    },
    nextButton: {
        backgroundColor: '#800080',
        marginLeft: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Cadastro;

