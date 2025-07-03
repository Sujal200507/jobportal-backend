import {v2 as cloudinary} from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

console.log("Cloudinary Config - CLOUD_NAME:", process.env.CLOUD_NAME ? "Present" : "Missing");
console.log("Cloudinary Config - API_KEY:", process.env.API_KEY ? "Present" : "Missing");
console.log("Cloudinary Config - API_SECRET:", process.env.API_SECRET ? "Present" : "Missing");

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});
export default cloudinary;