import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Footer = () => {

  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSignupClick = (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("footer.enterEmail"));
      return;
    }

    toast.success(t("footer.redirecting"));

    setTimeout(() => {
      navigate("/signup");
    }, 1000);
  };

  return (
    <footer id="contact" className="bg-green-900 text-white pt-16 pb-8">

      {/* CTA */}
      <div className="max-w-4xl mx-auto text-center mb-12 px-4">

        <h2 className="text-3xl font-bold mb-6">
          {t("footer.title")}
        </h2>

        <div className="join justify-center w-full max-w-lg mx-auto">

          <input
            type="email"
            placeholder={t("footer.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered join-item w-2/3 text-gray-800"
          />

          <button
            onClick={handleSignupClick}
            className="btn btn-warning join-item text-green-800 font-bold hover:bg-amber-400"
          >
            {t("footer.signup")}
          </button>

        </div>
      </div>

      <div className="divider opacity-30 mx-auto w-11/12 my-0"></div>

      {/* Bottom */}
      <div className="footer max-w-7xl mx-auto p-4 flex flex-col sm:flex-row justify-between items-center text-gray-300">

        <aside className="mb-4 sm:mb-0 text-sm">
          <p>
            © {new Date().getFullYear()} Cropmitra. {t("footer.rights")}
          </p>
        </aside>

        <nav className="flex items-center gap-6 text-sm">

          <a href="#" className="link link-hover">
            {t("footer.privacy")}
          </a>

          <a href="#" className="link link-hover">
            {t("footer.terms")}
          </a>

          <div className="flex gap-4 ml-4">
            <a href="#" className="hover:text-amber-500"><FaFacebookF /></a>
            <a href="#" className="hover:text-amber-500"><FaTwitter /></a>
            <a href="#" className="hover:text-amber-500"><FaLinkedinIn /></a>
          </div>

        </nav>

      </div>
    </footer>
  );
};

export default Footer;