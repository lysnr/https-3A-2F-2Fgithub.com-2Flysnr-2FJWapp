import React, { useState } from "react";
import { Upload, Cloud, FileText, Check, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadStudy = () => {
  const [patientName, setPatientName] = useState("John Doe");
  const [studyDescription, setStudyDescription] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [status, setStatus] = useState("Pending");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.name.toLowerCase().endsWith(".dcm") ||
        file.name.toLowerCase().endsWith(".dicom") ||
        [
          "application/zip",
          "application/x-rar-compressed",
          "application/x-7z-compressed",
        ].includes(file.type),
    );
    setUploadedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (!patientName || !bodyPart || uploadedFiles.length === 0) {
      alert(
        "Please enter patient name, select body part, and choose files to upload",
      );
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create file data for the study
    const fileData = {
      patientName,
      studyDescription,
      bodyPart,
      status,
      files: uploadedFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
    };

    // Store file data in sessionStorage for the report page
    sessionStorage.setItem("uploadedStudy", JSON.stringify(fileData));

    // Also store for adding to patient records
    sessionStorage.setItem("newPatientRecord", JSON.stringify(fileData));

    // Generate a new patient ID for the uploaded study
    const patientId = `${Date.now()}`;

    // Store the study metadata for DICOM viewer
    const metadata = {
      studyInfo: {
        studyId: patientId,
        patientName: patientName,
        studyDate: "Today",
        modality: "MRI",
        bodyPart: bodyPart,
      },
      technicalParams: {
        sliceThickness: "3.0 mm",
        tr: "2500 ms",
        te: "85 ms",
        fieldStrength: "1.5 Tesla",
        matrix: "512 x 512",
      },
      equipment: {
        manufacturer: "Siemens",
        model: "MAGNETOM Aera",
        software: "syngo MR E11",
      },
      remarks: studyDescription || "Newly uploaded study",
      created: new Date().toISOString(),
    };

    localStorage.setItem(`metadata_${patientId}`, JSON.stringify(metadata));

    // Navigate to report page after upload
    navigate(`/report/${patientId}`);
  };

  return (
    <div className="p-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
          <h1 className="text-2xl font-semibold text-foreground">
            Upload New Study
          </h1>
        </div>
      </div>

      {/* Upload Form */}
      <div className="max-w-2xl mx-auto">
        <div className="medical-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Upload DICOM Study
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Select a DICOM file (max 25 or 3 compressed archive (.zip, .rar,
            .7z) to upload. You can also
          </p>

          {/* Patient Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
              placeholder="Enter patient name"
              required
            />
          </div>

          {/* Body Part Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Body Part <span className="text-red-500">*</span>
            </label>
            <select
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
              required
            >
              <option value="">Select knee</option>
              <option value="Left Knee">Left Knee</option>
              <option value="Right Knee">Right Knee</option>
              <option value="Bilateral Knees">Bilateral Knees</option>
            </select>
          </div>

          {/* Status Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </div>

          {/* Study Description Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Study Description (Optional)
            </label>
            <textarea
              value={studyDescription}
              onChange={(e) => setStudyDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent resize-none"
              placeholder="Additional notes about the study (optional)..."
            />
          </div>

          {/* DICOM File Upload Area */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              DICOM File or Archive
            </label>
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${
                  isDragOver
                    ? "border-medical-blue bg-medical-blue/5"
                    : "border-border hover:border-medical-blue/50"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-medical-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Cloud className="w-8 h-8 text-medical-blue" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Click to upload or drag and drop
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Images (.jpg, .png, .jpeg), DICOM files (.dcm, .dicom) or
                  archives (.zip, .rar, .7z)
                </p>
                <button
                  type="button"
                  className="bg-medical-blue hover:bg-medical-blue-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Choose Files
                </button>
              </div>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.dcm,.dicom,.zip,.rar,.7z,image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Show uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Selected Files:
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-foreground">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || uploadedFiles.length === 0}
            className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? "Uploading..." : "Upload Study"}</span>
          </button>
        </div>

        {/* Upload Guidelines */}
        <div className="mt-6 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Upload Guidelines
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-medical-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>Maximum file size: 2GB per file</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-medical-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Supported formats: DICOM (.dcm, .dicom), Archives (.zip, .rar,
                .7z)
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-medical-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>All uploads are encrypted and HIPAA compliant</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-medical-blue rounded-full mt-2 flex-shrink-0"></div>
              <span>
                Processing time varies based on study size and complexity
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadStudy;
