import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const DeliveryTest = () => {
  const orderId = "test123"; // same id used in track page

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("Sending:", lat, lng);

        socket.emit("updateLocation", {
          orderId,
          lat,
          lng,
        });
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return <h2>🚚 Sending Live Location...</h2>;
};

export default DeliveryTest;