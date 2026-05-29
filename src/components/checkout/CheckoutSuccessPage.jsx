import React from 'react';

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded shadow mt-12 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Booking Confirmed!</h1>
      <p className="text-lg mb-6">Your appointment has been reserved. Check your email for confirmation and details.</p>
      <a href="/" className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Back to Home</a>
    </div>
  );
}
