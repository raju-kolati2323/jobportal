// const Razorpay = require('razorpay');
// require('dotenv').config();

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Function to create a new order
// const createOrder = async (amount) => {
//   try {
//     const options = {
//       amount: amount * 100,
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//       payment_capture: 1, // Automatically capture the payment after authorization
//     };

//     const order = await razorpayInstance.orders.create(options);
//     return order;
//   } catch (error) {
//     console.error('Error creating Razorpay order:', error);
//     throw error;
//   }
// };

// module.exports = { createOrder };
