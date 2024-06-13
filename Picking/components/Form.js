
import * as React from "react";
import { useState } from "react";
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Alert,KeyboardAvoidingView,Platform   } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { FontFamily, Border, FontSize, Color, Padding } from "../GlobalStyles";

const Form = () => {
  const navigation = useNavigation();
  const [UserID, setUserID] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = async () => {
    // Validar que se haya ingresado un correo y una contraseña
    if (!UserID || !pass) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    try {
      // Realizar la llamada a la API para autenticar al usuario
      const response = await fetch("http://10.0.0.6:70/user");
      const data = await response.json();
      console.log("respuesta del data", data)
      const user = data.find((user2) => user2.UserID === UserID);

      if (user && user.Pass === pass) {
        // Almacenar la sesión del usuario en AsyncStorage
        await AsyncStorage.setItem("Id", String(user.Id));
        console.log("Inicio de sesión exitoso ", user.Id, "-", user.UserID, "-", user.Pass);
        navigation.navigate("OrdenesPendientes", { Id: user.Id});
      } else {
        // Credenciales incorrectas
        Alert.alert("Error", "Correo o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Ocurrió un error al intentar iniciar sesión.");
    }
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@slc.com.gt"
            keyboardType="email-address"
            placeholderTextColor="#9ca3af"
            onChangeText={setUserID}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry={true}
            placeholderTextColor="#9ca3af"
            onChangeText={setPass}
          />
        </View>
        <TouchableOpacity style={styles.button} activeOpacity={0.2} onPress={handleLogin}>
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCentralRemovebgPreviewIcon: {
    width: 200,
    height: 100,
    resizeMode: "contain",
  },
  form: {
    width: "80%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: "#000",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
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

export default Form;

/*
  correoTypo: {
    fontFamily: FontFamily.robotoMedium,
    fontWeight: "500",
    letterSpacing: -0.2,
    flex: 1,
    overflow: "hidden",
  },
  emailFlexBox: {
    
    alignItems: "center",
    borderRadius: Border.br_11xs,
  },
  frame1SpaceBlock: {
    marginTop: 16,
    alignSelf: "stretch",
  },
  correo: {
    fontSize: FontSize.size_sm,
    lineHeight: 20,
    color: Color.colorDarkslategray,
    textAlign: "left",
    overflow: "hidden",
  },
  label: {
    alignItems: "baseline",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  email: {
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorLightgray,
    borderWidth: 1,
    height: 54,
    marginTop: 8,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  form: {
    alignSelf: "stretch",
  },
  inicio: {
    fontSize: FontSize.size_base,
    lineHeight: 24,
    color: Color.colorWhite,
    textAlign: "center",
    overflow: "hidden",
  },
  button: {
    backgroundColor: Color.colorDodgerblue,
    paddingHorizontal: 0,
    paddingVertical: Padding.p_5xs,
    alignItems: "center",
    borderRadius: Border.br_11xs,
    flexDirection: "row",
  },
  inputContainer: {
    marginBottom: 16,
  },















import * as React from "react";
import { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontFamily, Border, FontSize, Color, Padding } from "../GlobalStyles";

const Form = () => {

  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Validar que se haya ingresado un correo y una contraseña
    if (!email || !password) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    // Realizar la llamada a la API para autenticar al usuario
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => {
        const user = data.find((user) => user.email === email);
        if (user && user.username === password) {
          // Inicio de sesión exitoso, navegar a la siguiente pantalla
          console.log("Inicio sesion exitoso ",user.id ,"-",user.email,"-", user.username )
          navigation.navigate("OrdenesPendientes",{ userId: user.id });
        } else {
          // Credenciales incorrectas
          Alert.alert("Error", "Correo o contraseña incorrectos.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Ocurrió un error al intentar iniciar sesión.");
      });
  };

  return (
    <View style={styles.form}>
      <View style={styles.form}>
        <View style={styles.label}>
          <Text style={[styles.correo, styles.correoTypo]} numberOfLines={1}>
            Correo
          </Text>
        </View>
        <TextInput
          style={[styles.email, styles.emailFlexBox]}
          placeholder="ejemplo@slc.com.gt"
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.frame1SpaceBlock}>
        <View style={styles.label}>
          <Text style={[styles.correo, styles.correoTypo]} numberOfLines={1}>
            Contraseña
          </Text>
        </View>
        <TextInput
          style={[styles.email, styles.emailFlexBox]}
          placeholder="Contraseña"
          secureTextEntry={true}
          placeholderTextColor="#9ca3af"
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, styles.frame1SpaceBlock]}
        activeOpacity={0.2}
        onPress={handleLogin}
      >
        <Text style={[styles.inicio, styles.correoTypo]} numberOfLines={1}>
          Inicio
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  correoTypo: {
    fontFamily: FontFamily.robotoMedium,
    fontWeight: "500",
    letterSpacing: -0.2,
    flex: 1,
    overflow: "hidden",
  },
  emailFlexBox: {
    alignItems: "center",
    borderRadius: Border.br_11xs,
  },
  frame1SpaceBlock: {
    marginTop: 16,
    alignSelf: "stretch",
  },
  correo: {
    fontSize: FontSize.size_sm,
    lineHeight: 20,
    color: Color.colorDarkslategray,
    textAlign: "left",
    overflow: "hidden",
  },
  label: {
    alignItems: "baseline",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  email: {
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorLightgray,
    borderWidth: 1,
    height: 54,
    marginTop: 8,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  form: {
    alignSelf: "stretch",
  },
  inicio: {
    fontSize: FontSize.size_base,
    lineHeight: 24,
    color: Color.colorWhite,
    textAlign: "center",
    overflow: "hidden",
  },
  button: {
    backgroundColor: Color.colorDodgerblue,
    paddingHorizontal: 0,
    paddingVertical: Padding.p_5xs,
    alignItems: "center",
    borderRadius: Border.br_11xs,
    flexDirection: "row",
  },
});

export default Form;
*/