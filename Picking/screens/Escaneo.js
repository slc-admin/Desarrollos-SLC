import React, { useState, useEffect , useRef } from "react";
import { Text, View, StyleSheet, Keyboard, TextInput, Alert, Pressable } from "react-native";
//import { BarCodeScanner } from "expo-barcode-scanner";

export default function Form1({ navigation, route}) {

  console.log("datos del orderId2: ", Id)
  const [Id, setOrderId] = useState("");
  const [OrderNumber, setOrderNumber] = useState("");
  const [scanned, setScanned] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scanned && Id) {
      handleBarcodeInput(Id);
    }
  }, [scanned]);

  

  const handleBarcodeInput = async () => {
    setScanned(true);
    const { exists, data, barcodeId } = await checkBarcodeExists(Id);
    console.log("valor del params", Id);
    console.log("valor a comparar docentry", barcodeId);
    console.log("valor del exist", exists);
    // Convertir los IDs a números enteros para comparar
    const orderIdInt = parseInt(barcodeId);
    const scannedIdInt = parseInt(OrderNumber);
    const orderId2 = parseInt(Id);

/*
    if (!exists || !data) {
      Alert.alert("Código de barras no encontrado", `Código escaneado: ${id}`);
      return;
    }
*/
    if (exists && orderId2 === orderIdInt) {
      try {
        const response = await fetch(`http://10.0.0.6:70/pickeado/${Id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ /* Incluye aquí cualquier dato adicional si es necesario */ })
        });

        console.log("response del PUT", response);
  
        if (response.ok) {
          
          Alert.alert("Escaneado correcto", `Se actualizó correctamente la orden ${barcodeId} en el almacén`, [
            { text: "OK", onPress: () => navigation.navigate("OrdenesPendientes") }
          ]);
        } else {
          const errorData = await response.json();
          Alert.alert("Error", `Hubo un problema al actualizar la orden ${barcodeId} en el almacén: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error al actualizar la orden en el almacén:", error);
        Alert.alert("Error", "Hubo un problema al actualizar la orden en el almacén");
      }
    } else {
      Alert.alert("Código de barras no encontrado", `Código escaneado: ${Id}`);
    }
  };
  const checkBarcodeExists = async (barcodeId) => {
    try {
      const response = await fetch(`http://10.0.0.6:70/orden/${barcodeId}`);
      const data = await response.json(); // Convertir la respuesta a JSON
      console.log("datos del response1: ", response);
      console.log("datos del data1: ", data);
      if (data && data.length > 0) {
        console.log("datos del ID: ", barcodeId);
        console.log("datos del response2: ", response);
        console.log("datos del data2: ", data);
        console.log("info. data.Id y data.Docentry: ", data[0].Id, data[0].Docentry);
        return { exists: true, data: data[0], barcodeId: data[0].Docentry }; // Devuelve el primer objeto de datos
      } else {
        console.log("entro al else 1: ");
        return { exists: false, data: null, barcodeId }; // No se encontraron datos
      }
    } catch (error) {
      console.log("entro al else catch: ");
      console.error("Error al verificar el código de barras:", error);
      return { exists: false, data: null, barcodeId: null };
    }
  };
const handleInputChange = (text) => {
  setOrderId(text);
  setScanned(text.length > 0); // Activa el escaneo cuando el campo de texto no está vacío
};
const handleScanAgain = () => {
  setOrderId("");
  setScanned(false);
  if (inputRef.current) {
    inputRef.current.focus();
  }
};

  return (
    <View style={styles.container}>
      {/* <Text>{orderId}</Text> */}
      <Text>Escanee el código de barras:</Text>
      <TextInput
      ref={inputRef}
        style={styles.input}
        autoFocus
        onChangeText={handleInputChange}
        value={Id}
        onFocus={() => Keyboard.dismiss()} // Oculta el teclado al enfocar el campo de texto
      />
      <Pressable style={styles.button} onPress={handleScanAgain}>
        <Text>Escanear nuevamente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "80%"
  },
  button: {
    backgroundColor: "#4ED53E",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});



//-----------------------Version penultima-----------------------------

/*import React, { useState, useEffect , useRef } from "react";
import { Text, View, StyleSheet, Keyboard, TextInput, Alert, Pressable } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
//import { BarCodeScanner } from "expo-barcode-scanner";

export default function Form1({ navigation, route}) {

 // console.log("datos del orderId2: ", Id)
 const [Id, setOrderId] = useState("");
 const [OrderNumber, setOrderNumber] = useState("");
 const [scanned, setScanned] = useState(false);
 const inputRef = useRef(null);

 useEffect(() => {
   if (scanned && Id) {
     handleBarcodeInput(Id);
   }
 }, [scanned, Id]);

 const handleBarcodeInput = async (id) => {
   setScanned(false); // Reset scanned state to allow re-scanning
   const { exists, data, barcodeId } = await checkBarcodeExists(id);
   console.log("valor del params", id);
   console.log("valor a comparar docentry", barcodeId);
 
   if (!exists || !data) {
     Alert.alert("Código de barras no encontrado", `Código escaneado: ${id}`);
     return;
   }
 
   // Convertir los IDs a números enteros para comparar
   const orderIdInt = parseInt(barcodeId);
   const scannedIdInt = parseInt(OrderNumber);
   const orderId2 = parseInt(id);
 
   if (orderId2 === orderIdInt) {
     try {
       const response = await fetch(`http://10.0.0.6:70/pickeado/${id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({  })
       });

       console.log("response del PUT", response);
 
       if (response.ok) {
         Alert.alert("Escaneado correcto", `Se actualizó correctamente la orden ${barcodeId} en el almacén`, [
           { text: "OK", onPress: () => navigation.navigate("OrdenesPendientes") }
         ]);
       } else {
         const errorData = await response.json();
         Alert.alert("Error", `Hubo un problema al actualizar la orden ${barcodeId} en el almacén: ${errorData.message}`);
       }
     } catch (error) {
       console.error("Error al actualizar la orden en el almacén:", error);
       Alert.alert("Error", "Hubo un problema al actualizar la orden en el almacén");
     }
   } else {
     Alert.alert("Código de barras no encontrado", `Código escaneado: ${barcodeId}`);
   }
 };

 const checkBarcodeExists = async (barcodeId) => {
   try {
     const response = await fetch(`http://10.0.0.6:70/orden/${barcodeId}`);
     const data = await response.json(); // Convertir la respuesta a JSON

     if (data && data.length > 0) {
       console.log("datos del ID: ", barcodeId);
       console.log("datos del response: ", response);
       console.log("datos del data: ", data);
       console.log("info. data.Id y data.OrderNumber: ", data[0].Id, data[0].Docentry);
       return { exists: true, data: data[0], barcodeId: data[0].Docentry }; // Devuelve el primer objeto de datos
     } else {
       return { exists: false, data: null, barcodeId }; // No se encontraron datos
     }
   } catch (error) {
     console.error("Error al verificar el código de barras:", error);
     return { exists: false, data: null, barcodeId: null };
   }
 };
const handleInputChange = (text) => {
  setOrderId(text);
  setScanned(text.length > 0); // Activa el escaneo cuando el campo de texto no está vacío
};
const handleScanAgain = () => {
  setOrderId("");
  setScanned(false);
  if (inputRef.current) {
    inputRef.current.focus();
  }
};

  return (
    <View style={styles.container}>
     // {/* <Text>{orderId}</Text> }
      <Text>Escanee el código de barras:</Text>
      <TextInput
      ref={inputRef}
        style={styles.input}
        autoFocus
        onChangeText={handleInputChange}
        value={Id}
        onFocus={() => Keyboard.dismiss()} // Oculta el teclado al enfocar el campo de texto
      />
      <Pressable style={styles.button} onPress={handleScanAgain}>
        <Text>Escanear nuevamente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "80%"
  },
  button: {
    backgroundColor: "#4ED53E",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

*/








//---------------------------------------------------------
/*import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";

export default function Form1({ navigation, route}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { orderId } = route.params;
  const { orderNumber } = route.params;
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const { exists, barcodeId} = await checkBarcodeExists(data);
    console.log("valor del params", orderId)
    console.log("valor a comparar ordenid", orderNumber ,barcodeId)
    // Convertir los IDs a números enteros para comparar
    const orderIdInt = parseInt(barcodeId);
    const scannedIdInt = parseInt(orderNumber);
    const orderId2 = parseInt(orderId);
    if (exists && scannedIdInt === orderIdInt) {
      try {
         // Suponiendo que siempre es 1, puedes cambiarlo si es necesario
        const response = await fetch(`http://181.78.105.161:88/order/${orderId2}/warehouse`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "warehouseId": 2
          })
        });
        console.log("response del PUT",response)
        if (response.ok) {
          Alert.alert("Escaneado correcto", "Se actualizó correctamente la orden en el almacén", [
            { text: "OK", onPress: () => navigation.navigate("OrdenesPendientes") }
          ]);
        } else {
          Alert.alert("Error", "Hubo un problema al actualizar la orden en el almacén");
        }
      } catch (error) {
        console.error("Error al actualizar la orden en el almacén:", error);
        Alert.alert("Error", "Hubo un problema al actualizar la orden en el almacén");
      }
    } else {
      Alert.alert("Código de barras no encontrado", "Por favor, escanee nuevamente");
    }
};


  const checkBarcodeExists = async (barcodeId) => { // barcodeId es el numero de la orden leida
    try {
      const response = await fetch(`http://181.78.105.161:88/orders/${orderId}`);
      const data = await response.json(); // Convertir la respuesta a JSON
    console.log("datos del response: ", response)
    console.log("datos del data: ", data)
    console.log("info. data.orderId y data.orderNumber: ", data.orderId, data.orderNumber)
    return { exists: !!data, barcodeId }; // Devuelve true si el ID existe en la API, de lo contrario devuelve false
  } catch (error) {
    console.error("Error al verificar el código de barras:", error);
    return false;
  }
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
          barcodeTypes: ['aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a'],
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
});
*/

/////////////////////////////////////////
/*

import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";

export default function Form1({ navigation, route}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { orderId } = route.params;
  const { orderNumber } = route.params;
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const { exists, barcodeId} = await checkBarcodeExists(data);
    console.log("valor del params", orderId)
    console.log("valor a comparar ordenid", orderNumber ,barcodeId)
    // Convertir los IDs a números enteros para comparar
    const orderIdInt = parseInt(barcodeId);
    const scannedIdInt = parseInt(orderNumber);
    if (exists && scannedIdInt === orderIdInt) {
      Alert.alert("Escaneado correcto", "El código de barras existe en la API", [
        { text: "OK", onPress: () => navigation.navigate("OrdenesPendientes") }
      ]);
      //hacer Update al estado de la orden
      // aquie colococar el update

    } else {
      Alert.alert("Código de barras no encontrado", "Por favor, escanee nuevamente");
    }
};


  const checkBarcodeExists = async (barcodeId) => { // barcodeId es el numero de la orden leida
    try {
      const response = await fetch(`http://181.78.105.161:88/orders/${orderId}`);
      const data = await response.json(); // Convertir la respuesta a JSON
    console.log("data.orderNumber: ", data)
    console.log("data.orderId,data.orderNumber 2: ", data.orderId, data.orderNumber)
    return { exists: !!data, barcodeId }; // Devuelve true si el ID existe en la API, de lo contrario devuelve false
  } catch (error) {
    console.error("Error al verificar el código de barras:", error);
    return false;
  }
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
          barcodeTypes: ['aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a'],
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
});
*/