import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView, Pressable, Alert } from "react-native";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';

const OrdenesPendientes = () => {
  
  const navigation = useNavigation();
  const [ordenes, setOrdenes] = useState([]);
  const [Id, setUserId] = useState(null);

  useEffect(() => {
    const getStoredUserId = async () => {
      try {
        // Obtener el ID de usuario almacenado en AsyncStorage
        const storedUserId = await AsyncStorage.getItem("Id");
        if (storedUserId) {
          console.log("usuario logueado",storedUserId)
          setUserId(parseInt(storedUserId));
        }
      } catch (error) {
        console.error("Error al obtener el ID de usuario de AsyncStorage:", error);
      }
    };

    getStoredUserId();
  }, []);

  useFocusEffect(
  React.useCallback(() => {
    setOrdenes([]);
    const fetchOrdenes = async () => {
      try {
        const [response1, response2] = await Promise.all([
          fetch(`http://10.0.0.6:70/ordenes/1/${Id}`),
          fetch(`http://10.0.0.6:70/ordenes/6/${Id}`)
        ]);

        const todos1 = await response1.json();
        const todos2 = await response2.json();

        // Agregar propiedad estado a cada item
        const todos1WithEstado = todos1.map(item => ({ ...item, estado: "INGRESO"}));
        const todos2WithEstado = todos2.map(item => ({ ...item, estado: "ENTREGA" }));

        console.log("usuario igualar ", Id);
        console.log("todos1 usuario igualar ", todos1WithEstado);
        console.log("todos2 usuario igualar ", todos2WithEstado);

        // Combinar los resultados de ambas solicitudes
        const todos = [...todos1WithEstado, ...todos2WithEstado];

        // Filtrar los todos por el userId
        const userOrdenes = todos.filter(item => item.IdUser === Id);

        if (userOrdenes.length > 0) {
          setOrdenes(userOrdenes);
        } else {
          Alert.alert("El usuario no tiene ordenes pendientes");
        }

        console.log("ya igualado usuario ", userOrdenes);
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      }
    };

    // Verificar que userId no sea null antes de llamar a fetchOrdenes
    if (Id) {
      fetchOrdenes();
    }
  }, [Id])
);

  /*
  useFocusEffect(
    React.useCallback(() => {
      const fetchOrdenes = async () => {
        try {
          const response = await fetch(`http://10.0.0.6:70/ordenes/1/${Id}`);
          const todos = await response.json();
          console.log("usuario igualar ",Id)
          console.log("todos usuario igualar ",todos)
          //console.log("todos usuario igualar2: ",todos[0].Estado)
          // Filtrar los todos por el userId
          const userOrdenes = todos.filter(item => item.IdUser === Id);
          if(userOrdenes){
            setOrdenes(userOrdenes);
          }else{
            Alert.alert("El usuario no tiene ordenes pendientes")
          }
          console.log("ya igualado usuario ",userOrdenes)
        } catch (error) {
          console.error("Error al obtener las órdenes:", error);
        }
      };

      // Verificar que userId no sea null antes de llamar a fetchOrdenes
      if (Id) {
        fetchOrdenes();
      }
    }, [Id])
  );
*/

  return (
    <View style={styles.ordenespendientes}>
      <Header ordenes="Ordenes" onUserIconPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
          {ordenes.map(orden => (
          <View key={orden.Id}  style={styles.card}>
            <Text style={styles.ordenTitle}>
            {orden.Docentry} {'\n'}
            </Text>
            <Text style={styles.ordenText}>Estado: {orden.estado} </Text>
            <Text style={styles.ordenText}>
            {orden.CardName} {'\n'}
            {orden.CustomerName} {'\n'}
            {orden.InvoiceDate}
              </Text>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("Escaneo",{ Id: orden.Id, OrderNumber: orden.OrderNumber })}
            >
              <Text style={styles.buttonText}>Escaneo</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ordenespendientes: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  ordenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#313FEA",
  },
  ordenText: {
    fontSize: 18,
    marginBottom: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4ED53E",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default OrdenesPendientes;



/*
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`http://181.78.105.161:88/orders/status/0/user/${userId}`);
        const todos = await response.json();
        console.log("usuario igualar ",userId)
        console.log("todos usuario igualar ",todos)
        // Filtrar los todos por el userId
        const userOrdenes = todos.filter(item => item.userId === userId);
        if(userOrdenes){
          setOrdenes(userOrdenes);
        }else{
          Alert.alert("El usuario no tiene ordenes pendientes")
        }
        console.log("ya igualado usuario ",userOrdenes)
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      }
    };

    // Verificar que userId no sea null antes de llamar a fetchOrdenes
    if (userId) {
      fetchOrdenes();
    }
  }, [userId]);
*/

/*import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, ScrollView  ,Pressable  } from "react-native";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";


const OrdenesPendientes = ({route }) => {
  const navigation = useNavigation();
  const [ordenes, setOrdenes] = useState([]);
  const userId = route.params.userId;

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos");
        const todos = await response.json();
        
        // Filtrar los todos por el userId
        const userOrdenes = todos.filter(item => item.userId === userId);
        console.log("Inicio sesion exitoso ")
        setOrdenes(userOrdenes);
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      }
    };

    fetchOrdenes();
  }, [userId]);

  return (
    <View style={styles.ordenespendientes}>
      <Header ordenes="Ordenes" onUserIconPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        {ordenes.map(orden => (
          <View key={orden.id} style={styles.card}>
            <Text style={styles.ordenTitle}>{orden.id}</Text>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("Escaneo")}
            >
              <Text style={styles.buttonText}>Escaneo</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ordenespendientes: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
  },
  ordenTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },

});

export default OrdenesPendientes;
*/