import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return setMessage("All fields are required");
    }

    if (password !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `http://localhost:4000/api/auth/reset-password/${token}`,
        { password }
      );

      setMessage(res.data.message);

      // redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);

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
          Reset Password 🔑
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your new password
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            {loading ? "Updating..." : "Update Password"}
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
          Back to{" "}
          <Link to="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;