import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import AuthLayout from "./components/layout/AuthLayout";
import { Toaster } from "@/components/ui/sonner";
import SessionContextProvider from "./components/SessionContextProvider";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const App = () => (
  <BrowserRouter>
    <SessionContextProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          }
        />
        {/* Protect the /chat route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </SessionContextProvider>
  </BrowserRouter>
);

export default App;