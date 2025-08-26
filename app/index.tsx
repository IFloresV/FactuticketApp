import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
   return (
      <ScrollView className="flex-1 bg-cyan-400">
         {/* Hero Section */}
         <View className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 m-4 rounded-xl">
            <Text className="text-white text-2xl font-bold text-center mb-2">¡Bienvenido! 🚀</Text>
         </View>
      </ScrollView>
   );
}
