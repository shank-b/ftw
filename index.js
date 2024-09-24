require("dotenv").config(); // Ensure .env file is loaded
const express = require("express");
const Razorpay = require("razorpay");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Serve static HTML file
app.use(express.static(path.join(__dirname, "public")));

// Create Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Correctly accessing the environment variable
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Correctly accessing the environment variable
});

// Endpoint to create payment link
app.post("/create-payment-link", async (req, res) => {
  const { customer, amount, currency } = req.body;

  // Validate input data
  if (
    !customer ||
    !customer.name ||
    !customer.email ||
    !customer.contact ||
    !amount ||
    !currency
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Customer details (name, email, contact), amount, and currency are required.",
    });
  }

  try {
    const paymentLink = await razorpayInstance.paymentLink.create({
      amount: amount * 100, // Amount in paise
      currency: currency,
      accept_partial: false,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.contact,
      },
      description: "Payment for order",
      notify: {
        sms: true,
        email: true,
      },
    });
    res.json({ status: "success", payment_link: paymentLink.short_url });
  } catch (error) {
    console.error("Error creating payment link:", error); // Log full error
    res.status(500).json({
      status: "error",
      message: "Could not create payment link.",
      error: error.message,
    });
  }
});

// Dummy endpoints for balance and ticket status
app.get("/balance", (req, res) => {
  res.json({ balance: "5000" }); // Dummy balance
});

app.get("/ticket-status", (req, res) => {
  res.json({ ticketIDs: ["TICKET123", "TICKET456", "TICKET789"] }); // Dummy ticket IDs
});

app.get("/ticket/:ticketID", (req, res) => {
  const { ticketID } = req.params;
  res.json({ id: ticketID, status: "In progress" }); // Dummy ticket status
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
