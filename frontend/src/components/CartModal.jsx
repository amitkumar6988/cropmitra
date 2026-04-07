import React from "react";
import { useCartStore } from "../store/cartStore";
import { useNavigate } from "react-router-dom";

const CartModal = () => {
  const {
    cart,
    cartModalOpen,
    closeCartModal,
    updateQuantity,
  } = useCartStore();

  const safeCart = cart.filter((item) => item?.crop?._id);

  const navigate = useNavigate();

  if (!cartModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Soft overlay */}
      <div
        className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"
        onClick={closeCartModal}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg p-6 z-50 rounded-2xl shadow-2xl border border-green-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            My Cart ({safeCart.length} items)
          </h2>
          <button
            onClick={closeCartModal}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {safeCart
            .map((item) => (
            <div
              key={item.crop._id}
              className="flex items-center gap-4 border-b pb-3"
            >
              <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center text-2xl border">
                🌱
              </div>

              <div className="flex-1">
                <p className="font-medium">{item.crop.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{item.crop.price} / {item.crop.unit}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.crop._id, item.quantity - 1)
                    }
                    disabled={item.quantity === 1}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    −
                  </button>

                  <span className="font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.crop._id, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="font-semibold">
                ₹{(item.crop.price ?? 0) * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              closeCartModal();
              navigate("/cart");
            }}
            className="bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-medium"
          >
            View Cart
          </button>

          <button
            onClick={closeCartModal}
            className="border py-2.5 rounded-lg hover:bg-gray-50 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
