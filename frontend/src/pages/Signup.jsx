import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { ClipLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import AuthNavbar from "../components/AuthNavbar";

const Signup = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = formData;
    if (!name || !email || !password) {
      toast.error(t("signup.fillFields"));
      return;
    }

    const success = await register({
      ...formData,
      role: "user",
    });

    if (success) navigate("/home");

    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <>
      <AuthNavbar />

      <div className="min-h-screen pt-24 flex items-center justify-center 
        bg-gradient-to-br from-green-100 via-white to-green-200 px-4">

        {loading ? (
          <div className="flex flex-col items-center bg-white p-10 rounded-xl shadow-xl">
            <ClipLoader color="#16a34a" size={50} />
            <p className="text-green-700 mt-4 font-semibold">
              {t("signup.creating")}
            </p>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl 
            px-8 py-12 w-full max-w-md min-h-[560px] 
            flex flex-col justify-center border border-white/30">

            <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
              {t("signup.title")}
            </h2>

            <p className="text-center text-gray-500 mb-6">
              {t("signup.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                name="name"
                placeholder={t("signup.name")}
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 
                  focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />

              <input
                type="email"
                name="email"
                placeholder={t("signup.email")}
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 
                  focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />

              <input
                type="password"
                name="password"
                placeholder={t("signup.password")}
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 
                  focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 
                  text-white font-semibold py-2.5 rounded-lg transition"
              >
                {t("signup.signupButton")}
              </button>

            </form>

            <p className="text-center text-gray-500 mt-6">
              {t("signup.haveAccount")}{" "}
              <Link
                to="/login"
                className="text-green-600 font-semibold hover:underline"
              >
                {t("signup.login")}
              </Link>
            </p>

          </div>
        )}
      </div>
    </>
  );
};

export default Signup;