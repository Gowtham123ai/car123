import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  });

  // Email Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Send Confirmation Email
  app.post("/api/email/confirm-booking", async (req, res) => {
    const { email, bookingDetails } = req.body;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured. Skipping email.");
      return res.status(200).json({ status: "skipped", message: "Email not configured" });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmed: ${bookingDetails.carName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Booking Confirmed!</h2>
          <p>Hi there,</p>
          <p>Your booking for <strong>${bookingDetails.carName}</strong> has been successfully confirmed.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <div style="margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            <p><strong>Dates:</strong> ${bookingDetails.startDate} to ${bookingDetails.endDate}</p>
            <p><strong>Total Price:</strong> ₹${bookingDetails.totalPrice}</p>
            <p><strong>Payment ID:</strong> ${bookingDetails.paymentId}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 14px;">Thank you for choosing Vel cars. Have a safe journey!</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ status: "success" });
    } catch (error) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send confirmation email" });
    }
  });

  // Create Razorpay Order
  app.post("/api/payment/order", async (req, res) => {
    const { amount, currency = "INR" } = req.body;
    try {
      const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency,
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order" });
    }
  });

  // Verify Razorpay Payment (Simplified for demo, in production use crypto to verify signature)
  app.post("/api/payment/verify", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // In a real app, you would verify the signature here
    // For now, we'll assume it's valid if we received the data
    res.json({ status: "success" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
