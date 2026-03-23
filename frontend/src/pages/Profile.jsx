import ProfileTopBar from "../components/ProfileTopBar";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Profile = () => {

  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("profilePage.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("profilePage.loginRequired")}
      </div>
    );
  }

  const cards = [
    { title: "orders", icon: "📦", path: "/orders" },
    { title: "addresses", icon: "📍", path: "/addresses" },

    ...(user?.role === "farmer"
      ? [
          { title: "farmerOrders", icon: "🚜", path: "/farmer/orders" },
          { title: "addCrop", icon: "🌾", path: "/farmer/add-crop" },
          { title: "myCrops", icon: "🌱", path: "/farmer/my-crops" },
        ]
      : []),
  ];

  return (
    <>
      <ProfileTopBar />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="grid sm:grid-cols-2 gap-8 mt-10">

            {cards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}
                className="cursor-pointer bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition"
              >

                <h2 className="text-2xl font-bold">
                  {card.icon} {t(`profilePage.cards.${card.title}.title`)}
                </h2>

                <p className="text-gray-500 mt-2">
                  {t(`profilePage.cards.${card.title}.desc`)}
                </p>

              </div>
            ))}

          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;