import React, { useEffect, useState } from 'react';
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


import { api } from '../services/api';

const Servico = () => {
    const route = useRoute();
    const { id } = route.params;
    const navigation = useNavigation();
    const [service, setService] = useState(null);
    const [user, setUser] = useState({});
    const [prestadorDetails, setPrestadorDetails] = useState(null);
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [avaliacoes, setAvaliacoes] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUser(user);
            }
        };

        const fetchService = async () => {
            try {
                const jwtToken = await AsyncStorage.getItem('jwtToken');
                const response = await api.get(`/servicos/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
                setService(response.data);

                const prestadorResponse = await api.get(`/usuarios/${response.data.idPrestador}`, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
                setPrestadorDetails(prestadorResponse.data);
            } catch (error) {
                console.error('Erro ao carregar o serviço:', error);
            }
        };

        const fetchAvaliacoes = async () => {
            try {
                const jwtToken = await AsyncStorage.getItem('jwtToken');
                const response = await api.get(`/avaliacoes/servico/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });
                setAvaliacoes(response.data);
            } catch (error) {
                console.error('Erro ao carregar as avaliações:', error);
            }
        };

        fetchUser();
        fetchService();
        fetchAvaliacoes();
    }, [id]);

    const handleNavigateToGoogleMaps = () => {
        if (prestadorDetails) {
            const { rua, numero, bairro, cidade, estado, cep } = prestadorDetails;
            const address = `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}, ${cep}`;
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            Linking.openURL(url);
        }
    };

    const handleAvaliacaoSubmit = async () => {
        if (service && user) {
            const data = {
                idUser: user.id,
                nomeUser: user.name,
                idPrestador: service.idPrestador,
                nomePrestador: prestadorDetails?.name,
                idServico: service.id,
                nota: nota,
                comentario: comentario,
            };

            try {
                const jwtToken = await AsyncStorage.getItem('jwtToken');
                const response = await api.post('/avaliacoes', data, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`
                    }
                });

                if (response.status === 201) {
                    Alert.alert('Avaliação enviada com sucesso!');
                    setNota(0);
                    setComentario('');
                    fetchAvaliacoes();  // Recarregar avaliações após enviar uma nova
                }
            } catch (error) {
                console.error('Erro ao enviar avaliação:', error);
            }
        }
    };

    const out = () => {
        logOut();
        navigation.navigate('Home');
    };

    const fetchAvaliacoes = async () => {
        try {
            const jwtToken = await AsyncStorage.getItem('jwtToken');
            const response = await api.get(`/avaliacoes/servico/${id}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            setAvaliacoes(response.data);
        } catch (error) {
            console.error('Erro ao carregar as avaliações:', error);
        }
    };

    if (!service) {
        return <Text>Carregando...</Text>;
    }

    if (!prestadorDetails) {
        return <Text>Carregando...</Text>;
    }

    const renderNotaIcon = (selectedNota) => {
        const icons = [
            {
                nota: 1,
                icon: (
                    <MaterialCommunityIcons
                        name="emoticon-sad-outline"
                        size={24}
                        color="red"
                    />
                ),
                text: 'Muito Ruim',
            },
            {
                nota: 2,
                icon: (
                    <MaterialCommunityIcons
                        name="emoticon-neutral-outline"
                        size={24}
                        color="orange"
                    />
                ),
                text: 'Ruim',
            },
            {
                nota: 3,
                icon: (
                    <MaterialCommunityIcons
                        name="emoticon-happy-outline"
                        size={24}
                        color="yellow"
                    />
                ),
                text: 'Regular',
            },
            {
                nota: 4,
                icon: (
                    <MaterialCommunityIcons
                        name="emoticon-excited-outline"
                        size={24}
                        color="green"
                    />
                ),
                text: 'Bom',
            },
            {
                nota: 5,
                icon: (
                    <MaterialCommunityIcons
                        name="emoticon-cool-outline"
                        size={24}
                        color="green"
                    />
                ),
                text: 'Muito Bom',
            },
        ];

        return icons.map((iconObj) => (
            <View key={iconObj.nota} style={styles.iconContainer}>
                <TouchableOpacity onPress={() => setNota(iconObj.nota)}>
                    {React.cloneElement(iconObj.icon, {
                        color:
                            selectedNota === iconObj.nota
                                ? iconObj.icon.props.color
                                : 'black',
                    })}
                </TouchableOpacity>
                <Text style={styles.iconText}>{iconObj.text}</Text>
            </View>
        ));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{
                        uri: 'https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2024-1-e4-proj-infra-t4-connectlocal/blob/main/src/frontend/src/images/ConnectLogo.png?raw=true',
                    }}
                    style={styles.logo}
                />
                <View style={styles.headerRight}>
                    <Text style={styles.headerText}>
                        Olá {user?.name?.split(' ')[0]}
                    </Text>
                    <TouchableOpacity onPress={out} style={styles.logoutButton}>
                        <Ionicons name="log-out" size={24} color="purple" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.serviceDetails}>
                <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
                <Text style={styles.serviceText}>
                    <Text style={styles.boldText}>Tipo de Serviço: </Text>
                    {service.tipoServico}
                </Text>
                <Text style={styles.serviceText}>
                    <Text style={styles.boldText}>Descrição: </Text>
                    {service.descricao}
                </Text>
            </View>

            <View style={styles.providerDetails}>
                <Text style={styles.sectionTitle}>Detalhes do Prestador</Text>
                <Text style={styles.providerText}>
                    <Text style={styles.boldText}>Nome: </Text>
                    {prestadorDetails.name}
                </Text>
                <Text style={styles.providerText}>
                    <Text style={styles.boldText}>Email: </Text>
                    {prestadorDetails.email}
                </Text>
                <Text style={styles.providerText}>
                    <Text style={styles.boldText}>Contato: </Text>
                    {prestadorDetails.contato}
                </Text>
                <Text style={styles.providerText}>
                    <Text style={styles.boldText}>CNPJ: </Text>
                    {prestadorDetails.cnpj}
                </Text>
                <Text style={styles.providerText}>
                    <Text style={styles.boldText}>Endereço: </Text>
                    {`${prestadorDetails.rua}, ${prestadorDetails.numero}, ${prestadorDetails.complemento}, ${prestadorDetails.bairro}, ${prestadorDetails.cidade}, ${prestadorDetails.estado}, ${prestadorDetails.cep}`}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Index')}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={handleNavigateToGoogleMaps}>
                    <MaterialCommunityIcons name="map-marker" size={24} color="white" />
                    <Text style={styles.mapButtonText}>Google Maps</Text>
                </TouchableOpacity>
            </View>

            {user.cpf && (
                <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Avaliar Serviço</Text>
                    <View style={styles.ratingContainer}>{renderNotaIcon(nota)}</View>

                    <TextInput
                        value={comentario}
                        onChangeText={setComentario}
                        style={styles.textArea}
                        placeholder="Comentário"
                        multiline
                        numberOfLines={4}
                    />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleAvaliacaoSubmit}>
                        <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.reviewSection}>
                <Text style={styles.sectionTitle}>Avaliações</Text>
                {avaliacoes.length === 0 ? (
                    <View style={styles.noReviews}>
                        <FontAwesome name="frown-o" size={48} color="gray" />
                        <Text style={styles.noReviewsText}>
                            Serviço não avaliado, deixe uma avaliação!
                        </Text>
                    </View>
                ) : (
                    avaliacoes.map((avaliacao) => (
                        <View key={avaliacao.id} style={styles.review}>
                            <View style={styles.stars}>
                                {[...Array(avaliacao.nota)].map((_, index) => (
                                    <FontAwesome
                                        key={index}
                                        name="star"
                                        size={24}
                                        color="yellow"
                                    />
                                ))}
                            </View>
                            <Text style={styles.reviewUser}>{avaliacao.nomeUser}</Text>
                            <Text style={styles.reviewComment}>{avaliacao.comentario}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 40,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        color: '#6b21a8',
        marginRight: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        color: '#6b21a8',
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    serviceDetails: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    serviceText: {
        fontSize: 16,
        color: '#555',
    },
    boldText: {
        fontWeight: 'bold',
    },
    providerDetails: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    providerText: {
        fontSize: 16,
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: '#f59e0b',
        padding: 16,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    mapButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    ratingSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    iconContainer: {
        alignItems: 'center',
    },
    iconText: {
        fontSize: 12,
        marginTop: 4,
    },
    textArea: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#10b981',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewSection: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    noReviews: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    noReviewsText: {
        color: '#777',
        marginTop: 8,
    },
    review: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    stars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    reviewUser: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    reviewComment: {
        color: '#555',
    },
});

export default Servico;
