// KhaltiPayment.js
import React from "react";
import KhaltiCheckout from "khalti-checkout-web";

const KhaltiPayment = () => {
  const khaltiConfig = {
    publicKey: "test_public_key_dc74e7c1533d4b528858a3f43fded43a", // Replace with yours
    productIdentity: "1234567890",
    productName: "Premium Course",
    productUrl: "http://localhost:3000/product/premium",
    eventHandler: {
      onSuccess(payload) {
        console.log("Payment success!", payload);
        // Send payload.token to your backend for verification
      },
      onError(error) {
        console.log("Payment error", error);
      },
      onClose() {
        console.log("Widget closed");
      },
    },
    paymentPreference: ["KHALTI"],
  };

  const checkout = new KhaltiCheckout(khaltiConfig);

  return (
    <button
      onClick={() => checkout.show({ amount: 1000 })} // 1000 paisa = Rs.10
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Pay with Khalti
    </button>
  );
};

export default KhaltiPayment;
