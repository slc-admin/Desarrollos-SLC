/*import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button} from "react-native";
import { CameraView, Camera } from "expo-camera";

export default function Form1() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['aztec','ean13', 'ean8', 'qr' , 'pdf417', 'upc_e', 'datamatrix' , 'code39' , 'code93' , 'itf14' , 'codabar', 'code128' , 'upc_a'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});*/
/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    padding: 16,
    backgroundColor: 'blue',
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});
*/


/*
const Form1 = () => {
  const navigation = useNavigation();
  const [scannedId, setScannedId] = useState(null);

  const handleScan = useCallback(async ({ barcodes }) => {
    if (barcodes.length > 0) {
      const scannedBarcodeId = barcodes[0].data;
      setScannedId(scannedBarcodeId);
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/photos");
        const photos = await response.json();
        const foundPhoto = photos.find(photo => photo.id.toString() === scannedBarcodeId);

        if (foundPhoto) {
          Alert.alert("Escaneado correcto", `Orden: ${foundPhoto.title}`, [
            { text: "OK", onPress: () => console.log("OK pressed") }
          ]);
        } else {
          Alert.alert("Escaneado incorrecto", "La orden no existe", [
            { text: "OK", onPress: () => console.log("OK pressed") }
          ]);
        }
      } catch (error) {
        console.error("Error al verificar el código de barras:", error);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        captureAudio={false}
        onGoogleVisionBarcodesDetected={handleScan}
        googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL}
      >
        <BarcodeMask width={300} height={200} edgeRadius={10} />
      </RNCamera>
      <Text style={styles.text}>ID escaneado: {scannedId}</Text>
    </View>
  );
};

*/
/*
const Form1 = () => {
  const onEmailClick = useCallback(() => {
    Alert.alert("Escaneado", "Escaneo correcto", [
      {
        text: "ok",
        onPress: () => console.log("ok pressed"),
      },
    ]);
  }, []);

  return (
    <View style={styles.form}>
      <View style={[styles.frame, styles.frameFlexBox]}>
        <View style={[styles.label, styles.labelFlexBox]}>
          <Text style={[styles.orden, styles.ordenFlexBox]} numberOfLines={1}>
            Orden
          </Text>
        </View>
        <Pressable
          style={[styles.email, styles.labelFlexBox]}
          accessibilityElementsHidden
          onPress={onEmailClick}
        >
          <Text style={[styles.escaneo, styles.ordenFlexBox]} numberOfLines={1}>
            Escaneo
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
*//*
const styles = StyleSheet.create({
  frameFlexBox: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelFlexBox: {
    alignSelf: "stretch",
    flexDirection: "row",
  },
  ordenFlexBox: {
    overflow: "hidden",
    textAlign: "left",
    lineHeight: 20,
    letterSpacing: -0.2,
    fontSize: FontSize.size_sm,
    flex: 1,
  },
  orden: {
    fontWeight: "500",
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
  },
  label: {
    height: 20,
    alignItems: "baseline",
    justifyContent: "center",
  },
  escaneo: {
    fontFamily: FontFamily.robotoRegular,
    color: Color.colorDarkgray,
  },
  email: {
    borderRadius: Border.br_11xs,
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorLightgray,
    borderWidth: 1,
    height: 62,
    paddingTop: Padding.p_base,
    justifyContent: "space-between",
    alignItems: "center",
  },
  frame: {
    height: 82,
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  form: {
    paddingHorizontal: Padding.p_mini,
    paddingTop: Padding.p_31xl,
    maxWidth: 896,
    flexDirection: "row",
    flex: 1,
  },
});
*/
//export default Form1;
