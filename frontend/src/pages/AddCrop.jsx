import { useState } from "react";
import { useFarmerCropStore } from "../store/farmerCropStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PriceInsightWidget from "../components/PriceInsightWidget";

const CATEGORY_OPTIONS = [
  "fruit",
  "vegetable",
  "grain",
  "pulse",
  "other"
];

const AddCrop = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { addCrop, addLoading } = useFarmerCropStore();

  const initialState = {
    name: "",
    category: "",
    description: "",
    quantity: "",
    unit: "kg",
    price: "",
    discount: "",
    expiryDate: "",
    organic: false,
    location: ""
  };

  const [form, setForm] = useState(initialState);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (["quantity", "price", "discount"].includes(key)) {
        data.append(key, Number(value));
      } else {
        data.append(key, value);
      }
    });

    if (image) data.append("image", image);

    const success = await addCrop(data);

    if (success) {
      setForm(initialState);
      setImage(null);
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center p-6">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
          🌾 {t("addCrop.title")}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <input
            name="name"
            value={form.name}
            placeholder={t("addCrop.cropName")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          >
            <option value="">
              {t("addCrop.selectCategory")}
            </option>

            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </option>
            ))}
          </select>

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            placeholder={t("addCrop.quantity")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="kg">kg</option>
            <option value="ton">ton</option>
            <option value="quintal">quintal</option>
          </select>

          <input
            name="price"
            type="number"
            value={form.price}
            placeholder={t("addCrop.price")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          {form.name && (
            <div className="md:col-span-2">
              <PriceInsightWidget
                cropName={form.name}
                cropId={form.name?.toLowerCase().replace(/\s+/g, "-")}
                currentPrice={parseFloat(form.price) || 0}
                currentUnit={form.unit}
              />
            </div>
          )}

          <input
            name="discount"
            type="number"
            value={form.discount}
            placeholder={t("addCrop.discount")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            name="location"
            value={form.location}
            placeholder={t("addCrop.location")}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <textarea
            name="description"
            value={form.description}
            placeholder={t("addCrop.description")}
            onChange={handleChange}
            className="border p-3 rounded-lg md:col-span-2"
          />

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="organic"
              checked={form.organic}
              onChange={handleChange}
            />
            {t("addCrop.organic")}
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e)=>setImage(e.target.files[0])}
            className="md:col-span-2 border p-2 rounded-lg"
          />

          <button
            disabled={addLoading}
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            {addLoading ? t("addCrop.adding") : t("addCrop.add")}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddCrop;