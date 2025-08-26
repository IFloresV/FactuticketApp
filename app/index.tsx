import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ⚠️ CAMBIA LOCALHOST POR TU IP LOCAL
// Encuentra tu IP con: ipconfig (Windows) o ifconfig (Mac/Linux)
const N8N_WEBHOOK_URL = "http://192.168.3.31:5678/webhook-test/ticket"; // <-- Cambia por tu IP

export default function IndexScreen() {
   const [permission, requestPermission] = useCameraPermissions();
   const [photo, setPhoto] = useState<string | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const cameraRef = useRef<CameraView>(null);

   const takePhoto = async (): Promise<void> => {
      if (cameraRef.current) {
         setIsProcessing(true);
         try {
            const data = await cameraRef.current.takePictureAsync({
               quality: 0.8,
               base64: false,
            });

            if (data) {
               setPhoto(data.uri);
               console.log("Foto tomada:", data.uri);
               await sendToN8N(data.uri);
            }
         } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Error", "No se pudo tomar la foto: ");
         } finally {
            setIsProcessing(false);
         }
      }
   };

   const sendToN8N = async (imageUri: string): Promise<void> => {
      if (!imageUri) {
         Alert.alert("Error", "No hay imagen para enviar");
         return;
      }

      try {
         console.log("Enviando imagen a:", N8N_WEBHOOK_URL);
         console.log("URI de imagen:", imageUri);

         const formData = new FormData();
         formData.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "ticket.jpg",
         } as any);

         const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            body: formData,
            headers: {
               "Content-Type": "multipart/form-data",
               Accept: "application/json",
            },
         });

         console.log("Response status:", response.status);
         console.log("Response headers:", response.headers);

         const responseText = await response.text();
         console.log("Response body:", responseText);

         if (response.ok) {
            try {
               const result = JSON.parse(responseText);
               console.log("Parsed response:", result);

               if (result.success) {
                  Alert.alert(
                     "¡Éxito! 🎉",
                     `Imagen recibida correctamente\n\n` +
                        `Archivo: ${result.imageInfo?.fileName || "ticket.jpg"}\n` +
                        `Tamaño: ${result.imageInfo?.fileSize || "desconocido"}`,
                  );
               } else {
                  Alert.alert("Advertencia ⚠️", result.message || "Respuesta sin éxito");
               }
            } catch (jsonError) {
               Alert.alert("Éxito ✅", "Imagen enviada (respuesta no JSON):\n\n" + responseText.substring(0, 200));
            }
         } else {
            Alert.alert(
               "Error HTTP ❌",
               `Status: ${response.status}\n` +
                  `Error: ${response.statusText}\n\n` +
                  `Respuesta: ${responseText.substring(0, 200)}`,
            );
         }
      } catch (networkError) {
         console.error("Network error:", networkError);
         Alert.alert(
            "Error de Conexión ❌",
            `No se pudo conectar con N8N\n\n` +
               `URL: ${N8N_WEBHOOK_URL}\n` +
               // `Error: ${networkError.message}\n\n` +
               `Verifica:\n` +
               `• N8N esté ejecutándose\n` +
               `• IP correcta en la URL\n` +
               `• Misma red WiFi`,
         );
      }
   };

   const testConnection = async (): Promise<void> => {
      try {
         console.log("Testing connection to:", N8N_WEBHOOK_URL);
         const response = await fetch(N8N_WEBHOOK_URL, {
            method: "GET",
         });

         console.log("Test response:", response.status);

         if (response.ok || response.status === 405) {
            // 405 = Method Not Allowed es normal para webhooks que solo aceptan POST
            Alert.alert("Conexión OK ✅", `N8N está accesible\nStatus: ${response.status}`);
         } else {
            Alert.alert("Conexión Parcial ⚠️", `HTTP ${response.status} - ${response.statusText}`);
         }
      } catch (error) {
         console.error("Connection test error:", error);
         Alert.alert("Error de Conexión ❌", `No se pudo conectar\n\n\n\n` + `URL: ${N8N_WEBHOOK_URL}`);
      }
   };

   if (!permission) {
      return (
         <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="mt-4 text-gray-600">Cargando permisos...</Text>
         </View>
      );
   }

   if (!permission.granted) {
      return (
         <View className="flex-1 justify-center items-center p-6 bg-gray-50">
            <Text className="text-6xl mb-6">📱</Text>
            <Text className="text-center text-xl font-bold mb-4">Acceso a Cámara</Text>
            <Text className="text-center text-gray-600 mb-8 leading-relaxed">
               Para tomar fotos de tickets y procesarlos automáticamente con N8N
            </Text>

            <TouchableOpacity onPress={requestPermission} className="bg-blue-500 px-8 py-4 rounded-xl shadow-lg mb-4">
               <Text className="text-white font-bold text-lg">Conceder Permisos</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={testConnection} className="bg-gray-500 px-6 py-3 rounded-lg">
               <Text className="text-white font-medium">🔗 Test Conexión N8N</Text>
            </TouchableOpacity>
         </View>
      );
   }

   return (
      <View className="flex-1 bg-blue-50">
         {/* Header */}
         <View className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 m-4 rounded-xl mt-12 shadow-lg">
            <Text className="text-white text-3xl font-bold text-center mb-2">📄 Factu-Ticket</Text>
            <Text className="text-blue-100 text-center text-sm">Procesamiento automático con N8N</Text>
         </View>

         {/* Camera Section */}
         <View className="flex-1 m-4 rounded-xl overflow-hidden shadow-lg bg-black">
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
               {/* Overlay guide */}
               <View style={styles.overlay}>
                  <View style={styles.guideFrame}>
                     <Text className="text-white text-center font-bold mb-2">📄 Coloca el ticket aquí</Text>
                     <Text className="text-white text-center text-sm opacity-80">
                        Asegúrate de que esté completo y legible
                     </Text>
                  </View>
               </View>

               {/* Camera Controls - DENTRO del CameraView */}
               <View style={styles.controls}>
                  <TouchableOpacity
                     onPress={takePhoto}
                     disabled={isProcessing}
                     style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
                  >
                     {isProcessing ? (
                        <>
                           <ActivityIndicator size="small" color="#2563eb" />
                           <Text className="text-blue-600 font-bold mt-1">Enviando...</Text>
                        </>
                     ) : (
                        <>
                           <Text className="text-2xl">📸</Text>
                           <Text className="text-blue-600 font-bold">Tomar y Enviar</Text>
                        </>
                     )}
                  </TouchableOpacity>

                  <TouchableOpacity
                     onPress={testConnection}
                     className="mt-3 bg-gray-800 bg-opacity-80 px-4 py-2 rounded-lg"
                  >
                     <Text className="text-white text-sm font-medium">🔗 Test N8N</Text>
                  </TouchableOpacity>
               </View>
            </CameraView>
         </View>

         {/* Photo Preview */}
         {photo && (
            <View className="m-4 bg-white rounded-xl shadow-lg p-4">
               <Text className="text-gray-800 font-bold text-center mb-3">📷 Última foto enviada:</Text>
               <Image source={{ uri: photo }} style={styles.preview} />

               <TouchableOpacity
                  onPress={() => sendToN8N(photo)}
                  disabled={isProcessing}
                  className="mt-3 bg-green-500 py-3 rounded-lg"
               >
                  <Text className="text-white font-bold text-center">🔄 Reenviar a N8N</Text>
               </TouchableOpacity>
            </View>
         )}

         {/* Processing indicator */}
         {isProcessing && (
            <View className="absolute top-24 left-4 right-4 bg-blue-500 p-4 rounded-lg shadow-lg">
               <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold ml-2">🚀 Enviando a N8N...</Text>
               </View>
            </View>
         )}
      </View>
   );
}

const styles = StyleSheet.create({
   camera: {
      flex: 1,
   },
   overlay: {
      position: "absolute",
      top: 60,
      left: 20,
      right: 20,
      alignItems: "center",
   },
   guideFrame: {
      borderWidth: 2,
      borderColor: "white",
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
   },
   controls: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      alignItems: "center",
      paddingHorizontal: 20,
   },
   captureButton: {
      backgroundColor: "white",
      borderRadius: 50,
      paddingVertical: 20,
      paddingHorizontal: 30,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
   },
   captureButtonDisabled: {
      opacity: 0.7,
   },
   preview: {
      width: "100%",
      height: 160,
      borderRadius: 8,
      backgroundColor: "#f0f0f0",
   },
});
