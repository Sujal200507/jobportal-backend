import express from "express";
import connectDB from "./db/connection.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

// Initialize environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS config (Allow frontend on Vercel or localhost)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://jobportal-frontend-gilt.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
};
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// Health check endpoint for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

// index.js or server.js
console.log("Updated");

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at port ${PORT}`);
});
