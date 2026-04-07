import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AdminLayout = () => {

  const { logout } = useAuthStore();

  return (

    <div style={{display:"flex", minHeight:"100vh"}}
     className="flex-1 p-8 bg-gray-100 min-h-screen"
    >

      {/* ✅ Sidebar */}
      <div style={{
        width:"250px",
        background:"#111827",
        color:"white",
        padding:"20px"
      }}>

        <h2>Admin Panel</h2>

        <div style={{marginTop:"30px", display:"flex", flexDirection:"column", gap:"15px"}}>

       <Link to="/admin/dashboard">Dashboard</Link>
<Link to="/admin/users">Users</Link>
<Link to="/admin/farmers">Farmers</Link>
<Link to="/admin/orders">Orders</Link>
<Link to="/admin/price-factors">Price shocks</Link>


          <button onClick={logout} style={{marginTop:"20px"}}>
            Logout
          </button>

        </div>
      </div>


      {/* ✅ Page Content */}
      <div style={{flex:1, padding:"30px"}}>
        <Outlet/>
      </div>

    </div>
  );
};

export default AdminLayout;
