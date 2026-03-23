import { useState } from "react";
import { useFarmerStore } from "../store/farmerStore";
import { useTranslation } from "react-i18next";

const FarmerApplyForm = ({ onClose }) => {

  const { applyFarmer, loading } = useFarmerStore();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    farmName: "",
    location: "",
    licenseNumber: "",
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await applyFarmer(form);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <form
        onSubmit={submitHandler}
        className="bg-white p-6 rounded-lg w-full max-w-md space-y-4"
      >

        <h2 className="text-xl font-semibold">
          {t("farmerApply.title")} 🌾
        </h2>

        <input
          type="text"
          placeholder={t("farmerApply.farmName")}
          required
          value={form.farmName}
          onChange={(e) =>
            setForm({ ...form, farmName: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder={t("farmerApply.location")}
          required
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder={t("farmerApply.license")}
          value={form.licenseNumber}
          onChange={(e) =>
            setForm({ ...form, licenseNumber: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            {t("farmerApply.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading
              ? t("farmerApply.submitting")
              : t("farmerApply.submit")}
          </button>

        </div>

      </form>
    </div>
  );
};

export default FarmerApplyForm;