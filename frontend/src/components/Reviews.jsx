import React from "react";
import { Star, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Reviews = () => {

  const { t } = useTranslation();

  const reviews = [
    {
      name: "Rahul Sharma",
      rating: 5,
      comment: t("reviews.r1"),
      verified: true,
    },
    {
      name: "Anita Verma",
      rating: 4,
      comment: t("reviews.r2"),
      verified: true,
    },
    {
      name: "Local Vendor",
      rating: 3,
      comment: t("reviews.r3"),
      verified: false,
    },
  ];

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="bg-white rounded-2xl shadow p-4">

      <h2 className="font-bold text-lg mb-2">
        {t("reviews.title")}
      </h2>

      {/* Average Rating */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>

        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              fill={i < Math.round(avgRating) ? "currentColor" : "none"}
            />
          ))}
        </div>

        <span className="text-sm text-gray-500">
          ({reviews.length} {t("reviews.count")})
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <div key={idx} className="border-b pb-3">

            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.name}</span>

              {review.verified && (
                <CheckCircle size={14} className="text-green-600" />
              )}
            </div>

            <div className="flex text-yellow-400 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < review.rating ? "currentColor" : "none"}
                />
              ))}
            </div>

            <p className="text-sm text-gray-600">{review.comment}</p>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Reviews;