import { useEffect } from "react";
import { useAdminStore } from "../store/adminStore";

const AdminOrders = () => {

 const { orders, fetchOrders, loading } = useAdminStore();

 useEffect(()=>{
   fetchOrders();
 },[]);

 if(loading) return <h1 className="p-6 text-xl font-bold">Loading Orders...</h1>;

 // ✅ Stats
 const totalRevenue = orders?.reduce(
   (acc,order)=> acc + (order.totalAmount || 0),0
 );

 const pendingOrders = orders?.filter(o=>o.status==="PLACED").length;
 const completedOrders = orders?.filter(o=>o.status==="DELIVERED").length;
 const cancelledOrders = orders?.filter(o=>o.status==="CANCELLED").length;

 return (

<div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">

{/* 🔥 HEADER */}
<div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
text-white p-8 rounded-3xl shadow-xl mb-8">

<h1 className="text-3xl font-bold">
 📦 Orders Management
</h1>

<p className="opacity-90">
Track platform orders and monitor revenue.
</p>

</div>


{/* 🔥 STATS */}
<div className="grid grid-cols-4 gap-6 mb-8">

<div className="bg-white p-6 rounded-2xl shadow-lg">
<p className="text-gray-500">Total Orders</p>
<h2 className="text-3xl font-bold">
{orders?.length || 0}
</h2>
</div>

<div className="bg-white p-6 rounded-2xl shadow-lg">
<p className="text-gray-500">Revenue</p>
<h2 className="text-3xl font-bold text-emerald-600">
₹ {totalRevenue}
</h2>
</div>

<div className="bg-white p-6 rounded-2xl shadow-lg">
<p className="text-gray-500">Pending</p>
<h2 className="text-3xl font-bold text-orange-500">
{pendingOrders}
</h2>
</div>

<div className="bg-white p-6 rounded-2xl shadow-lg">
<p className="text-gray-500">Completed</p>
<h2 className="text-3xl font-bold text-green-600">
{completedOrders}
</h2>
</div>

</div>


{/* 🔥 TABLE */}
<div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 overflow-x-auto">

<table className="w-full">

<thead className="border-b">
<tr className="text-gray-600">
<th className="p-4 text-left">Customer</th>
<th className="p-4 text-left">Order Details</th>
<th className="p-4 text-left">Amount</th>
<th className="p-4 text-left">Status</th>
<th className="p-4 text-left">Date</th>
</tr>
</thead>

<tbody>

{orders?.length === 0 && (
<tr>
<td colSpan="5" className="text-center p-8 text-gray-400">
No Orders Found 🚜
</td>
</tr>
)}

{orders?.map(order=>(
<tr
 key={order._id}
 className="hover:bg-indigo-50 transition duration-200"
>

{/* Customer */}
<td className="p-4">
<p className="font-semibold">
{order.buyer?.name || "Unknown"}
</p>
<p className="text-gray-500 text-sm">
{order.buyer?.email}
</p>
</td>

{/* Order Details */}
<td className="p-4 space-y-2">

{order.items?.map((item,index)=>(
<div
 key={index}
 className="bg-slate-50 px-3 py-2 rounded-lg"
>

<p className="font-semibold">
🌾 {item.crop?.name}
</p>

<p className="text-xs text-gray-500">
Qty: {item.quantity} kg
</p>

<p className="text-xs text-gray-400">
Farmer: {item.farmer?.name}
</p>

</div>
))}

</td>

{/* Amount */}
<td className="p-4 font-bold text-emerald-600">
₹ {order.totalAmount}
</td>

{/* Status */}
<td className="p-4">

{order.status === "PLACED" && (
<span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-bold">
Placed
</span>
)}

{order.status === "CONFIRMED" && (
<span className="bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-xs font-bold">
Confirmed
</span>
)}

{order.status === "SHIPPED" && (
<span className="bg-yellow-100 text-yellow-600 px-4 py-1 rounded-full text-xs font-bold">
Shipped
</span>
)}

{order.status === "OUT_FOR_DELIVERY" && (
<span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-xs font-bold">
Out for Delivery
</span>
)}

{order.status === "DELIVERED" && (
<span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-xs font-bold">
Delivered
</span>
)}

{order.status === "CANCELLED" && (
<span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold">
Cancelled
</span>
)}

</td>

{/* Date */}
<td className="p-4 text-gray-500">
{new Date(order.createdAt).toLocaleDateString()}
</td>

</tr>
))}

</tbody>
</table>

</div>

</div>
 );
};

export default AdminOrders;
