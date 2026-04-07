import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatBot = async (req, res) => {
  try {

    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const result = await model.generateContent(
      `You are CropMitra assistant helping farmers sell crops on the CropMitra platform.

User question: ${message}`
    );

    const reply = result.response.text();

    res.json({ reply });

  } catch (error) {
    res.status(500).json({ error: "Chatbot failed" });
  }
};