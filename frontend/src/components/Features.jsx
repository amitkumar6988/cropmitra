import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const Features = () => {

  const { t } = useTranslation();

  const featuresData = [
    {
      icon: ArrowTrendingUpIcon,
      title: t("features.item1.title"),
      description: t("features.item1.description")
    },
    {
      icon: BuildingStorefrontIcon,
      title: t("features.item2.title"),
      description: t("features.item2.description")
    },
    {
      icon: TruckIcon,
      title: t("features.item3.title"),
      description: t("features.item3.description")
    },
    {
      icon: CurrencyDollarIcon,
      title: t("features.item4.title"),
      description: t("features.item4.description")
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-green-50">

      <h2 className="text-4xl font-extrabold text-center text-green-800 mb-16">
        {t("features.sectionTitle")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

        {featuresData.map((feature, index) => (
          <div
            key={index}
            className="card bg-white shadow-xl p-6 text-center transition duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-4 border-green-600"
          >

            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3">
              {feature.title}
            </h3>

            <p className="text-gray-600">
              {feature.description}
            </p>

          </div>
        ))}

      </div>
    </section>
  );
};

export default Features;