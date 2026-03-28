import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setMessage("Please enter email");

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
          Forgot Password 🔐
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your email to receive reset link
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-green-600 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;