import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PatientRecord from "./pages/PatientRecord";
import FileFolder from "./pages/FileFolder";
import Images from "./pages/Images";
import UploadStudy from "./pages/UploadStudy";
import DICOMViewer from "./pages/DICOMViewer";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/patient-record" element={
              <ProtectedRoute>
                <Layout><PatientRecord /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/file-folder/:patientId" element={
              <ProtectedRoute>
                <Layout><FileFolder /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/file-folder/:folderId/images" element={
              <ProtectedRoute>
                <Layout><Images /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/report/:studyId" element={
              <ProtectedRoute>
                <Layout><Report /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/upload-study" element={
              <ProtectedRoute>
                <Layout><UploadStudy /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/dicom-viewer" element={
              <ProtectedRoute>
                <Layout><DICOMViewer /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={
              <ProtectedRoute>
                <Layout><NotFound /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
