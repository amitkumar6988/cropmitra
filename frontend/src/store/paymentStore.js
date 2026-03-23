import { create } from "zustand";
import axios from "axios";
import { axiosInstance } from "../libs/axios";

export const usePaymentStore = create((set) => ({

  loading: false,

  handleOnlinePayment: async ({
    cart,
    selectedAddress,
    totalAmount,
    paymentMethod,
    placeOrder,
    clearCart,
    navigate
  }) => {

    try {

      set({ loading: true });

      if (!selectedAddress) {
        alert("Please select address");
        return;
      }

      // ⭐ STEP 1 — Get Razorpay Key
      const { data: { key } } = await axios.get(
        "http://localhost:4000/api/getkey"
      );

      // ⭐ STEP 2 — Place Order
      const response = await placeOrder({
        items: cart.map(item => ({
          crop: item.crop._id,
          quantity: item.quantity,
          farmer: item.crop.farmer,
          price: item.crop.price
        })),
        address: selectedAddress,
        totalAmount,
        paymentMethod
      });

      const order = response.order;

      if (!order) return;

      if (paymentMethod === "COD") {
        clearCart();
        navigate("/orders");
        return;
      }

      // ⭐ STEP 3 — Create Razorpay Order
      const { data } = await axiosInstance.post(
        "/payment/create-order",
        { orderId: order._id }
      );

      const rpOrder = data.razorpayOrder;

      // ⭐ STEP 4 — Popup
      const options = {
        key,
        amount: rpOrder.amount,
        currency: "INR",
        name: "CropMitra",
        order_id: rpOrder.id,

        handler: async function (response) {
          await axiosInstance.post("/payment/verify", response);
          clearCart();
          navigate("/orders");
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.log(error);
      alert("Payment failed");
    } finally {
      set({ loading: false });
    }
  }

}));