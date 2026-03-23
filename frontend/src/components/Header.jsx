import React from "react";
import { Bars3Icon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

const Header = () => {

  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <header className="navbar bg-green-800 text-white fixed top-0 z-50 shadow-lg px-4 lg:px-10">

      {/* Logo */}
      <div className="flex-1">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold hover:text-amber-400 transition"
        >
          <img
            src={logo}
            alt="Cropmitra Logo"
            className="h-9 w-9 rounded-full bg-white p-1 object-contain scale-125"
          />
          <span>Cropmitra</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="flex-none hidden lg:flex items-center gap-4">

        <ul className="menu menu-horizontal px-1 text-lg font-medium">
          <li>
            <a href="#features" className="hover:text-amber-400">
              {t("navbar.features")}
            </a>
          </li>

          <li>
            <a href="#how-it-works" className="hover:text-amber-400">
              {t("navbar.howItWorks")}
            </a>
          </li>

          <li>
            <Link to="/login" className="hover:text-amber-400">
              {t("navbar.login")}
            </Link>
          </li>
        </ul>

        <Link
          to="/signup"
          className="btn btn-warning text-green-800 font-bold hover:bg-amber-400"
        >
          {t("navbar.getStarted")}
        </Link>

        {/* 🌐 Language Dropdown */}
        <div className="dropdown dropdown-end">

          <button
            tabIndex={0}
            className="btn btn-ghost text-white flex items-center gap-2 hover:bg-green-700"
          >
            <GlobeAltIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {i18n.language.toUpperCase()}
            </span>
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content mt-3 z-[1] w-44 p-2 shadow-xl bg-white rounded-xl border text-gray-700"
          >

            <li>
              <button
                onClick={() => changeLanguage("en")}
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-100 transition ${
                  i18n.language === "en" ? "bg-green-50 font-semibold" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  🇬🇧 English
                </span>
                {i18n.language === "en" && "✓"}
              </button>
            </li>

            <li>
              <button
                onClick={() => changeLanguage("hi")}
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-100 transition ${
                  i18n.language === "hi" ? "bg-green-50 font-semibold" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  🇮🇳 हिंदी
                </span>
                {i18n.language === "hi" && "✓"}
              </button>
            </li>

            <li>
              <button
                onClick={() => changeLanguage("mr")}
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-100 transition ${
                  i18n.language === "mr" ? "bg-green-50 font-semibold" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  🇮🇳 मराठी
                </span>
                {i18n.language === "mr" && "✓"}
              </button>
            </li>

          </ul>

        </div>

      </div> {/* <-- Desktop Navigation closed */}

      {/* Mobile Menu */}
      <div className="flex-none lg:hidden">
        <div className="dropdown dropdown-end">

          <div tabIndex={0} role="button" className="btn btn-ghost">
            <Bars3Icon className="h-6 w-6 text-white" />
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52 text-gray-800"
          >
            <li><a href="#features">{t("navbar.features")}</a></li>
            <li><a href="#how-it-works">{t("navbar.howItWorks")}</a></li>
            <li><Link to="/login">{t("navbar.login")}</Link></li>

            <li>
              <Link to="/signup" className="btn btn-warning btn-sm mt-2">
                {t("navbar.getStarted")}
              </Link>
            </li>

          </ul>

        </div>
      </div>

    </header>
  );
};

export default Header;