import { useTranslation } from "react-i18next";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const LanguageSwitcher = () => {

  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const currentLang = i18n.language;

  return (
    <div className="dropdown dropdown-end">

      {/* Button */}
      <button
        tabIndex={0}
        className="btn btn-sm btn-outline border-white text-white hover:bg-white hover:text-green-800 flex items-center gap-2"
      >
        <GlobeAltIcon className="h-5 w-5" />
        {currentLang.toUpperCase()}
      </button>

      {/* Dropdown */}
      <ul
        tabIndex={0}
        className="dropdown-content mt-3 z-[1] w-44 p-2 shadow-xl bg-white rounded-xl border text-gray-700"
      >

        <li>
          <button
            onClick={() => changeLanguage("en")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-100 transition"
          >
            🇬🇧 English
          </button>
        </li>

        <li>
          <button
            onClick={() => changeLanguage("hi")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-100 transition"
          >
            🇮🇳 हिंदी
          </button>
        </li>

        <li>
          <button
            onClick={() => changeLanguage("mr")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-100 transition"
          >
            🇮🇳 मराठी
          </button>
        </li>

      </ul>

    </div>
  );
};

export default LanguageSwitcher;