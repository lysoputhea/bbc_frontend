// // -------- src/App.jsx --------
// // The root component that defines all the routes.
// import { Routes, Route, Navigate } from "react-router-dom";
// import MainLayout from "./layout/MainLayout";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Students from "./pages/Students";
// import Branches from "./pages/Branches";
// import Enrollments from "./pages/Enrollments";
// import Classes from "./pages/Classes";
// import Payments from "./pages/Payments";
// import Reports from "./pages/Reports";
// import UserManagement from "./pages/UserManagement";
// import ChangePassword from "./pages/ChangePassword";
// import Profile from "./pages/Profile";

// import { useAuth } from "./context/AuthContext";
// import AlertComponent from "./components/AlertComponent";

// // A wrapper for routes that require authentication.
// function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" />;
// }

// function App() {
//   const { isAuthenticated, isLoading } = useAuth();

//   // Show a loading indicator while checking for authentication token
//   if (isLoading) {
//     return (
//       <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100">
//         <div className="tw-text-xl tw-font-semibold tw-text-gray-700 tw-text-center">
//           Loading...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <isAuthenticated>
//       <AlertComponent />
//       <Routes>
//         <Route
//           path="/login"
//           element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
//         />
//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute>
//               <MainLayout>
//                 <Routes>
//                   <Route path="*" element={<Navigate to="/dashboard" />} />
//                   <Route path="/" element={<Navigate to="/dashboard" />} />
//                   <Route path="/dashboard" element={<Dashboard />} />
//                   <Route path="/enrollments" element={<Enrollments />} />
//                   <Route path="/payments" element={<Payments />} />
//                   <Route path="/students" element={<Students />} />
//                   <Route path="/branches" element={<Branches />} />
//                   <Route path="/classes" element={<Classes />} />
//                   <Route path="/reports" element={<Reports />} />
//                   <Route path="/users" element={<UserManagement />} />
//                   <Route path="/change-password" element={<ChangePassword />} />
//                   <Route path="/profile" element={<Profile />} />
//                 </Routes>
//               </MainLayout>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </isAuthenticated>
//   );
// }

// export default App;

// -------- src/App.jsx --------
// The root component that defines all the routes.
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Branches from "./pages/Branches";
import Enrollments from "./pages/Enrollments";
import Classes from "./pages/Classes";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";

import { useAuth } from "./context/AuthContext";
import AlertComponent from "./components/AlertComponent";

// A wrapper for routes that require authentication.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a loading indicator while checking for authentication token
  if (isLoading) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100">
        <div className="tw-text-xl tw-font-semibold tw-text-gray-700 tw-text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertComponent />
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/enrollments" element={<Enrollments />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
