import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, View, Text } from "react-native";
import Form from "../components/Form";
import { Padding, FontFamily, Color, Border } from "../GlobalStyles";
import { AutoFocus } from "expo-camera/build/legacy/Camera.types";
const Login = () => {
  return (
    <View style={[styles.login, styles.loginFlexBox]}>
      <View style={[styles.frame, styles.loginFlexBox]}>
        <View style={[styles.margin, styles.marginLayout]}>
          <Image
            style={[styles.logoCentral1, styles.logoCentral1FlexBox]}
            source={require("../assets/logo-central-1.png")}
            contentFit="contain" // Ajusta la imagen para que se contenga dentro del contenedor
          />
        </View>
        <View style={[styles.margin1, styles.marginLayout]}>
          <View style={styles.heading}>
            <Text
              style={[styles.inicioSesion, styles.logoCentral1FlexBox]}
              numberOfLines={1}
            >
              Inicio Sesión
            </Text>
          </View>
        </View>
        <Form />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  marginLayout: {
    maxWidth: 236.375,
    paddingBottom: Padding.p_5xl,
    flexDirection: "row",
  },
  logoCentral1FlexBox: {
    overflow: "hidden",
    flex: 1,
  },
  logoCentral1: {
    width: "100%",
    height: "100%", // Ajusta la imagen al tamaño completo del contenedor
  },
  margin: {
    width: "100%", // Asegúrate de que el contenedor tenga el tamaño completo deseado
    height: 124,    // Ajusta la altura según sea necesario
  },
  inicioSesion: {
    fontSize: 30,
    letterSpacing: -0.4,
    lineHeight: 36,
    fontWeight: "700",
    fontFamily: FontFamily.montserratBold,
    color: Color.colorGray,
    textAlign: "center",
  },
  heading: {
    alignItems: "baseline",
    flexDirection: "row",
    flex: 1,
    marginBottom: 18,
  },
  margin1: {
    width: "100%",
  },
  frame: {
    borderRadius: Border.br_5xs,
    backgroundColor: Color.colorWhite,
    height: 610,
    padding: 32,
    maxWidth: 448,
  },
  login: {
    backgroundColor: Color.colorWhitesmoke_200,
    padding: Padding.p_5xl,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Login;
