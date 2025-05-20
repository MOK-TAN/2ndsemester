// EsewaPayment.js
import React from "react";

const EsewaPayment = () => {
  const handleEsewaPayment = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://uat.esewa.com.np/epay/main"; // Use prod URL for live

    const data = {
      amt: 100,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: 100,
      pid: "ABC123", // unique payment ID
      scd: "EPAYTEST", // replace with your Merchant Code
      su: "http://localhost:3000/success", // success URL
      fu: "http://localhost:3000/failure", // failure URL
    };

    Object.keys(data).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <button
      onClick={handleEsewaPayment}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Pay with eSewa
    </button>
  );
};

export default EsewaPayment;
