import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";
import { logOut as logOutFunction } from "../services/Functions";
import { Ionicons, FontAwesome } from "@expo/vector-icons";


const Index = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [user, setUser] = useState({});
  const [content, setContent] = useState("servicos");
  const [tipoServico, setTipoServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUserFromLocalStorage();
      if (user) {
        await loadServices(user);
        await loadAvaliacoes(user);
      } else {
        navigation.navigate("Home");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuth();
      setIsAuthenticated(auth);
    };

    checkAuth();
  }, []);

  const isAuth = async () => {
    const jwt = await AsyncStorage.getItem("jwtToken");
    if (!jwt) return false;

    const now = new Date().getTime();
    const tokenTimestampStr = await AsyncStorage.getItem("timestamp");
    if (!tokenTimestampStr) return false;

    const tokenTimestamp = parseInt(tokenTimestampStr);
    const expirationTime = 8 * 60 * 60 * 1000; // 8 horas
    return now - tokenTimestamp <= expirationTime;
  };

  const getUserFromLocalStorage = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error("Error getting user from AsyncStorage:", error);
      return null;
    }
  };

  const loadServices = async (user) => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const url = user.cpf ? "/servicos" : `/servicos/prestador/${user.id}`;
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setServices(response.data);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadAvaliacoes = async (user) => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const url = user.cpf
        ? `/avaliacoes/usuario/${user.id}`
        : `/avaliacoes/prestador/${user.id}`;
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setAvaliacoes(response.data);
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const handleContent = (tipo) => {
    setContent(tipo);
  };

  const handleUserClick = () => {
    navigation.navigate("User");
  };

  const logOut = async () => {
    try {
      await logOutFunction(); // Chama a função de logout
      navigation.navigate("Home"); // Navega para a tela Home após o logout
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Erro", "Erro ao sair. Por favor, tente novamente.");
    }
  };

  const handleSubmit = async () => {
    const jwtToken = await AsyncStorage.getItem("jwtToken");

    if (descricao.trim() !== "") {
      const data = {
        idPrestador: user.id,
        tipoServico: tipoServico,
        descricao: descricao,
      };

      try {
        const response = await api.post("/servicos", data, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.status === 201) {
          Alert.alert("Sucesso", "Serviço cadastrado com sucesso");
          setTipoServico("");
          setDescricao("");
          loadServices(user);
        }
      } catch (error) {
        Alert.alert("Erro", "Erro ao cadastrar Serviço.");
        console.error(error);
      }
    } else {
      console.log("A descrição está vazia");
    }
  };

  const renderServices = () => {
    const handleCardClick = (id) => {
      navigation.navigate("Servico", { id });
    };

    const handleServiceDelete = async (id) => {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const url = `/servicos/${id}`;
      const response = await api.delete(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.status === 204) {
        loadServices(user);
        Alert.alert("Serviço deletado com sucesso");
      } else {
        console.log("Erro ao deletar serviço");
      }
    };

    const handleAvaliacaoDelete = async (id) => {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      const url = `/avaliacoes/${id}`;
      const response = await api.delete(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.status === 204) {
        loadAvaliacoes(user);
        Alert.alert("Avaliação deletada com sucesso");
      } else {
        console.log("Erro ao deletar avaliação");
      }
    };

    if (content === "servicos") {
      return (
        <ScrollView style={styles.scrollView}>
          <View style={styles.innerContainer}>
            {user.cnpj && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Cadastrar Serviço</Text>
                <TextInput
                  placeholder="Tipo de serviço"
                  style={styles.input}
                  value={tipoServico}
                  onChangeText={setTipoServico}
                />
                <TextInput
                  placeholder="Descreva seu serviço..."
                  style={styles.textArea}
                  value={descricao}
                  onChangeText={setDescricao}
                  maxLength={255}
                  multiline={true}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Enviar Cadastro</Text>
                </TouchableOpacity>
              </View>
            )}
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.card}
                onPress={() => handleCardClick(service.id)}
              >
                <View>
                  <Text style={styles.cardTitle}>{service.tipoServico}</Text>
                  <Text>{service.descricao}</Text>
                </View>
                {user.cnpj && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleServiceDelete(service.id);
                    }}
                  >
                    <FontAwesome name="trash" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={styles.scrollView}>
          <View style={styles.innerContainer}>
            {avaliacoes.map((avaliacao) => (
              <View key={avaliacao.id} style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>
                    {avaliacao.nomePrestador}
                  </Text>
                  <Text>{avaliacao.comentario}</Text>
                  <View style={styles.ratingContainer}>
                    {Array.from({ length: avaliacao.nota }).map((_, i) => (
                      <FontAwesome
                        key={i}
                        name="star"
                        size={18}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
                {user.cpf && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAvaliacaoDelete(avaliacao.id);
                    }}
                  >
                    <FontAwesome name="trash" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
  };

  if (!isAuthenticated) {
    Alert.alert("Sessão expirada", "Por favor, faça login novamente.");
    navigation.navigate("Home");
    return null;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text onPress={handleUserClick}>
          Olá, {user.name?.split(" ")[0]}
        </Text>
        <TouchableOpacity onPress={logOut}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.nav}>
        <Text
          style={content === "servicos" ? styles.activeNavText : styles.navText}
          onPress={() => handleContent("servicos")}
        >
          Serviços
        </Text>
        <Text
          style={
            content === "avaliacoes" ? styles.activeNavText : styles.navText
          }
          onPress={() => handleContent("avaliacoes")}
        >
          Avaliações Dadas
        </Text>
      </View>
      {renderServices()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  navText: {
    fontSize: 18,
    color: "#000",
  },
  activeNavText: {
    fontSize: 18,
    color: "#007BFF",
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
});

export default Index;
