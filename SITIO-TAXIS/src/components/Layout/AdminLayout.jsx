import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="sidebar-main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
