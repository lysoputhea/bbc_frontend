// -------- src/layout/MainLayout.jsx --------
// The main structure with Sidebar and Header.
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pass toggleSidebar to Header */}
        <Header toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
