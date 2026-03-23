import { useTranslation } from "react-i18next";

const Testimonials = () => {

  const { t } = useTranslation();

  return (
    <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        {t("testimonials.title")}
      </h2>

      <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-xl border-l-4 border-amber-500">

        <p className="italic text-xl text-gray-700">
          {t("testimonials.quote")}
        </p>

        <cite className="block mt-4 text-lg font-semibold text-green-700">
          {t("testimonials.author")}
        </cite>

      </div>

      <div className="flex justify-center gap-8 mt-10 text-xl text-gray-400">
        <span>{t("testimonials.trust1")}</span>
        <span>{t("testimonials.trust2")}</span>
      </div>

    </section>
  );
};

export default Testimonials;