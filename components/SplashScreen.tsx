import factuticket from "@/assets/lotties/lottieFactuticket.json";

import LottiView from "lottie-react-native";

export default function SplashScreen({ onFinish = (isCancelled) => {} }: { onFinish: (isCancelled: boolean) => void }) {
   return (
      <LottiView
         source={factuticket}
         onAnimationFinish={onFinish}
         autoPlay
         resizeMode="cover"
         loop={false}
         style={{ flex: 1, width: "100%" }}
      />
   );
}
