import React, { useState } from "react";
import {
  FileText,
  Save,
  Menu,
  Settings as SettingsIcon,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const DICOMViewer = () => {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [patientNotes, setPatientNotes] = useState("");

  // DICOM view types
  const viewTypes = [
    { id: "axial", label: "AXIAL" },
    { id: "sagittal", label: "SAGITTAL" },
    { id: "coronal", label: "CORONAL" },
    { id: "3d", label: "3D RECONSTRUCTION" },
  ];

  return (
    <div className="flex h-full bg-background min-h-full">
      {/* Main DICOM Viewer Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                // Go back in history or fallback to patient record
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/patient-record");
                }
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">
              DICOM Viewer
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => console.log("File menu clicked")}
              className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>File</span>
            </button>
            <button
              onClick={() => console.log("Tools menu clicked")}
              className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>Tools</span>
            </button>
          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="bg-muted/50 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Jane Smith
              </h2>
              <p className="text-sm text-muted-foreground">
                Study Date: October 25, 2023
              </p>
            </div>
          </div>
        </div>

        {/* DICOM Views Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {viewTypes.map((view) => (
              <div key={view.id} className="medical-card p-4 flex flex-col">
                <div className="text-center mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {view.label}
                  </h3>
                </div>
                <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
                  {/* DICOM Image Placeholder */}
                  <div className="text-6xl font-light text-muted-foreground">
                    600 × 600
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Patient Notes */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Patient Notes
          </h3>
          <p className="text-sm text-muted-foreground">
            Observations and notes for Jane Smith.
          </p>
        </div>

        <div className="flex-1 p-4">
          <textarea
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="Enter clinical observations, findings, and notes here..."
            className="w-full h-full bg-background border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent resize-none"
          />
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => console.log("Saving notes:", patientNotes)}
            className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DICOMViewer;
