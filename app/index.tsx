import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
   return (
      <ScrollView className="flex-1 bg-factuticket-cian">
         {/* Hero Section */}
         <View className="bg-gradient-to-r from-factuticket-dark to-factuticket-light p-6 m-4 rounded-xl mt-40">
            <Text className="text-white text-2xl font-bold text-center mb-2">¡Bienvenido! 🚀</Text>
         </View>
      </ScrollView>
   );
}
