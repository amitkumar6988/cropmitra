import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const socket = io("http://localhost:4000");

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [position, setPosition] = useState([19.076, 72.8777]);
  const [isShipped, setIsShipped] = useState(false);

  const positionRef = useRef(position);

  // 🔒 Check Order Status
  useEffect(() => {
    const checkOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/orders/${orderId}`,
          { withCredentials: true }
        );

        if (res.data.status?.toLowerCase() === "shipped") {
          setIsShipped(true);
        } else {
          alert("Order not shipped yet");
          navigate("/orders");
        }
      } catch (err) {
        navigate("/orders");
      }
    };

    checkOrder();
  }, [orderId, navigate]);

  // 🔥 Real-Time Tracking
  useEffect(() => {
    if (!isShipped) return;

    socket.emit("joinOrderRoom", orderId);

    socket.on("locationUpdated", ({ lat, lng }) => {
      smoothMove([lat, lng]);
    });

    return () => {
      socket.off("locationUpdated");
    };
  }, [isShipped, orderId]);

  // 🧠 Smooth Animation Function
  const smoothMove = (newPos) => {
    const [startLat, startLng] = positionRef.current;
    const [endLat, endLng] = newPos;

    let steps = 20;
    let i = 0;

    const interval = setInterval(() => {
      i++;
      const lat = startLat + ((endLat - startLat) * i) / steps;
      const lng = startLng + ((endLng - startLng) * i) / steps;

      const updated = [lat, lng];
      setPosition(updated);
      positionRef.current = updated;

      if (i >= steps) clearInterval(interval);
    }, 50);
  };

  if (!isShipped) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking tracking availability...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={position} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={deliveryIcon} />
      </MapContainer>
    </div>
  );
};

export default TrackOrder;