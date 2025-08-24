import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  X,
  Edit,
  Save,
  Settings,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const Report = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [studyData, setStudyData] = useState<any>(null);
  const [currentSlice, setCurrentSlice] = useState(1);
  const [initialSliceSet, setInitialSliceSet] = useState(false);
  const [totalSlices, setTotalSlices] = useState(7);
  const [showMetadata, setShowMetadata] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editMetadataForm, setEditMetadataForm] = useState({
    description: "",
    remarks: "",
    status: "Pending",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [showStatusWarning, setShowStatusWarning] = useState(false);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  useEffect(() => {
    // Check for specific slice selection from sessionStorage or URL
    const selectedSlice = sessionStorage.getItem("selectedSlice");
    const urlParams = new URLSearchParams(window.location.search);
    const sliceFromUrl = urlParams.get("slice");

    // Set initial slice based on selection or default to 1
    if (!initialSliceSet) {
      if (sliceFromUrl && !isNaN(parseInt(sliceFromUrl))) {
        setCurrentSlice(parseInt(sliceFromUrl));
      } else if (selectedSlice && !isNaN(parseInt(selectedSlice))) {
        setCurrentSlice(parseInt(selectedSlice));
        // Clear the selected slice after using it
        sessionStorage.removeItem("selectedSlice");
      } else {
        setCurrentSlice(1);
      }
      setInitialSliceSet(true);
    }

    // Get uploaded study data from sessionStorage
    const uploadedStudy = sessionStorage.getItem("uploadedStudy");
    if (uploadedStudy) {
      const study = JSON.parse(uploadedStudy);
      setStudyData(study);

      // Determine slice count from study data
      if (study.files && study.files.length > 0) {
        // For DICOM files, estimate slices based on file count or size
        const dicomFiles = study.files.filter(
          (f: any) =>
            f.name.toLowerCase().includes(".dcm") ||
            f.name.toLowerCase().includes("dicom") ||
            f.name.toLowerCase().includes("mri"),
        );

        if (dicomFiles.length > 0) {
          // Simulate realistic slice counts (5-25 slices typical for knee MRI)
          const totalSize = study.files.reduce(
            (sum: number, f: any) => sum + f.size,
            0,
          );
          const estimatedSlices = Math.max(
            5,
            Math.min(25, Math.round(totalSize / (1024 * 1024 * 2))),
          );
          setTotalSlices(estimatedSlices);
        }
      }
    }

    // Get current patient context
    const patientContext = sessionStorage.getItem("currentPatient");
    if (patientContext) {
      const patient = JSON.parse(patientContext);
      setCurrentPatient(patient);

      // Load metadata for this patient
      const metadataKey = `metadata_${patient.id || studyId}`;
      const savedMetadata = localStorage.getItem(metadataKey);
      if (savedMetadata) {
        const meta = JSON.parse(savedMetadata);
        setMetadata(meta);

        // Check if metadata has slice information
        if (meta.technicalParams && meta.technicalParams.numberOfSlices) {
          setTotalSlices(parseInt(meta.technicalParams.numberOfSlices));
        }
      }
    }

    // Listen for metadata updates
    const handleMetadataUpdate = (event: any) => {
      if (event.detail?.updatedRecords) {
        const currentPatientId = currentPatient?.id || studyId;
        const wasUpdated = event.detail.updatedRecords.some(
          (record: any) => record.id === currentPatientId,
        );

        if (wasUpdated) {
          // Reload metadata for current patient
          const metadataKey = `metadata_${currentPatientId}`;
          const savedMetadata = localStorage.getItem(metadataKey);
          if (savedMetadata) {
            setMetadata(JSON.parse(savedMetadata));
          }

          // Also update current patient data
          const savedRecords = localStorage.getItem("patientRecords");
          if (savedRecords) {
            const records = JSON.parse(savedRecords);
            const updatedPatient = records.find(
              (record: any) => record.id === currentPatientId,
            );
            if (updatedPatient) {
              setCurrentPatient(updatedPatient);
            }
          }
        }
      }
    };

    window.addEventListener("metadataUpdated", handleMetadataUpdate);

    // Add beforeunload handler to warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditingMetadata) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    // Automatic status warnings removed - only back button will trigger warnings
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("metadataUpdated", handleMetadataUpdate);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [studyId, currentPatient?.id, initialSliceSet]);

  // Sync scroll position when slice changes
  useEffect(() => {
    if (scrollContainer) {
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const sliceProgress = (currentSlice - 1) / (totalSlices - 1);
      const scrollPosition = sliceProgress * maxScroll;
      scrollContainer.scrollTop = scrollPosition;
    }
  }, [currentSlice, totalSlices, scrollContainer]);

  // Sync scroll position when container is ready and slice is set
  useEffect(() => {
    if (scrollContainer && initialSliceSet) {
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const sliceProgress = (currentSlice - 1) / (totalSlices - 1);
      const scrollPosition = sliceProgress * maxScroll;
      scrollContainer.scrollTop = scrollPosition;
    }
  }, [scrollContainer, initialSliceSet]);

  // Status warnings only triggered by back button - no automatic checking

  const handlePreviousSlice = () => {
    setCurrentSlice((prev) => Math.max(1, prev - 1));
  };

  const handleNextSlice = () => {
    setCurrentSlice((prev) => Math.min(totalSlices, prev + 1));
  };

  const handleSliceSelect = (slice: number) => {
    setCurrentSlice(slice);
  };

  const handleReset = () => {
    setCurrentSlice(1);
    setZoomLevel(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    // Reset scroll position to top
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25)); // Min zoom 0.25x
  };

  const handleRotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleEditMetadata = () => {
    setEditMetadataForm({
      description: metadata?.description || studyData?.studyDescription || "",
      remarks: metadata?.remarks || currentPatient?.remarks || "",
      status: metadata?.status || currentPatient?.status || "Pending",
    });
    setIsEditingMetadata(true);
    setHasUnsavedChanges(false);
  };

  const handleSaveMetadata = () => {
    const currentPatientId = currentPatient?.id || studyId;
    const metadataKey = `metadata_${currentPatientId}`;

    const updatedMetadata = {
      ...metadata,
      description: editMetadataForm.description,
      remarks: editMetadataForm.remarks,
      status: editMetadataForm.status,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(metadataKey, JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);
    setIsEditingMetadata(false);
    setHasUnsavedChanges(false);

    // Also update patient records if needed
    const savedRecords = localStorage.getItem("patientRecords");
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const updatedRecords = records.map((record: any) => {
        if (record.id === currentPatientId) {
          return {
            ...record,
            remarks: editMetadataForm.remarks,
            status: editMetadataForm.status,
          };
        }
        return record;
      });
      localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));
    }

    // Dispatch events to sync across all pages
    window.dispatchEvent(new CustomEvent("patientRecordsUpdated"));
    window.dispatchEvent(
      new CustomEvent("metadataUpdated", {
        detail: {
          updatedRecords: [
            { id: currentPatientId, status: editMetadataForm.status },
          ],
        },
      }),
    );
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?",
      );
      if (!confirmCancel) {
        return;
      }
    }
    setIsEditingMetadata(false);
    setEditMetadataForm({ description: "", remarks: "", status: "Pending" });
    setHasUnsavedChanges(false);
  };

  const handleStatusEdit = () => {
    setTempStatus(metadata?.status || currentPatient?.status || "Pending");
    setIsEditingStatus(true);
    setShowStatusWarning(false);
  };

  const handleStatusSave = () => {
    const currentPatientId = currentPatient?.id || studyId;
    const metadataKey = `metadata_${currentPatientId}`;

    const updatedMetadata = {
      ...metadata,
      status: tempStatus,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(metadataKey, JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);
    setIsEditingStatus(false);

    // Also update patient records
    const savedRecords = localStorage.getItem("patientRecords");
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const updatedRecords = records.map((record: any) => {
        if (record.id === currentPatientId) {
          return { ...record, status: tempStatus };
        }
        return record;
      });
      localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));
    }

    // Dispatch events to sync across all pages
    window.dispatchEvent(new CustomEvent("patientRecordsUpdated"));
    window.dispatchEvent(
      new CustomEvent("metadataUpdated", {
        detail: {
          updatedRecords: [{ id: currentPatientId, status: tempStatus }],
        },
      }),
    );
  };

  const handleStatusCancel = () => {
    setIsEditingStatus(false);
    setTempStatus("");
  };

  const handleRemindLater = () => {
    // Set status to 'Pending' when remind later is clicked
    const currentPatientId = currentPatient?.id || studyId;
    const metadataKey = `metadata_${currentPatientId}`;

    const updatedMetadata = {
      ...metadata,
      status: "Pending",
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(metadataKey, JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);

    // Also update patient records
    const savedRecords = localStorage.getItem("patientRecords");
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const updatedRecords = records.map((record: any) => {
        if (record.id === currentPatientId) {
          return { ...record, status: "Pending" };
        }
        return record;
      });
      localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));
    }

    // Dispatch events to sync across all pages
    window.dispatchEvent(new CustomEvent("patientRecordsUpdated"));
    window.dispatchEvent(
      new CustomEvent("metadataUpdated", {
        detail: {
          updatedRecords: [{ id: currentPatientId, status: "Pending" }],
        },
      }),
    );

    setShowStatusWarning(false);
  };

  const handleNavigateAnyway = () => {
    // First, mark status as Pending before leaving
    const currentPatientId = currentPatient?.id || studyId;
    const metadataKey = `metadata_${currentPatientId}`;

    const updatedMetadata = {
      ...metadata,
      status: "Pending",
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(metadataKey, JSON.stringify(updatedMetadata));
    setMetadata(updatedMetadata);

    // Also update patient records
    const savedRecords = localStorage.getItem("patientRecords");
    if (savedRecords) {
      const records = JSON.parse(savedRecords);
      const updatedRecords = records.map((record: any) => {
        if (record.id === currentPatientId) {
          return { ...record, status: "Pending" };
        }
        return record;
      });
      localStorage.setItem("patientRecords", JSON.stringify(updatedRecords));
    }

    // Dispatch events to sync across all pages
    window.dispatchEvent(new CustomEvent("patientRecordsUpdated"));
    window.dispatchEvent(
      new CustomEvent("metadataUpdated", {
        detail: {
          updatedRecords: [{ id: currentPatientId, status: "Pending" }],
        },
      }),
    );

    setShowNavigationWarning(false);

    // Proceed with navigation
    try {
      const patientContext = sessionStorage.getItem("currentPatient");
      if (patientContext) {
        const patient = JSON.parse(patientContext);
        navigate(`/file-folder/${patient.id}/images`, { replace: false });
      } else {
        navigate("/patient-record", { replace: false });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      navigate("/patient-record", { replace: false });
    }
  };

  const handleUpdateStatus = () => {
    setShowNavigationWarning(false);

    // Scroll to the Study Information section where status can be edited
    const studyInfoElement = document.querySelector(
      ".study-information-section",
    );
    if (studyInfoElement) {
      studyInfoElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Fallback: scroll to bottom of page where Study Information usually is
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }

    // Start editing the status in the Study Information section
    handleStatusEdit();
  };

  return (
    <div className="bg-background flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              console.log("Back button clicked!");
              console.log("Metadata:", metadata);
              console.log("CurrentPatient:", currentPatient);

              // Check if status is Pending or In Progress before leaving
              const currentStatus = metadata?.status || currentPatient?.status;
              console.log("Current status:", currentStatus);

              if (
                currentStatus === "Pending" ||
                currentStatus === "In Progress"
              ) {
                console.log("Status needs attention, showing popup!");
                setShowNavigationWarning(true);
                return;
              }

              console.log("Status is okay, proceeding with navigation");

              // Status is Complete or Follow Up, proceed with navigation
              try {
                // First try to get patient context
                const patientContext = sessionStorage.getItem("currentPatient");

                if (patientContext) {
                  const patient = JSON.parse(patientContext);
                  // Navigate back to images page for this patient
                  navigate(`/file-folder/${patient.id}/images`, {
                    replace: false,
                  });
                } else {
                  // No patient context, go to patient record
                  navigate("/patient-record", { replace: false });
                }
              } catch (error) {
                console.error("Navigation error:", error);
                // Final fallback to patient record
                navigate("/patient-record", { replace: false });
              }
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            style={{ pointerEvents: "auto", zIndex: 10 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Report</h1>
        </div>
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            showMetadata
              ? "bg-medical-blue text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium">Metadata</span>
        </button>
      </div>

      {/* MRI Viewer Header */}
      <div className="p-6 bg-background">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">MRI Viewer</h3>

          {/* Controls moved to header row */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
              className="bg-muted hover:bg-muted/80 disabled:bg-muted/50 disabled:cursor-not-allowed text-foreground p-2 rounded transition-colors flex items-center space-x-1"
              title={`Zoom Out (${(zoomLevel * 100).toFixed(0)}%)`}
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Zoom Out</span>
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              className="bg-muted hover:bg-muted/80 disabled:bg-muted/50 disabled:cursor-not-allowed text-foreground p-2 rounded transition-colors flex items-center space-x-1"
              title={`Zoom In (${(zoomLevel * 100).toFixed(0)}%)`}
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Zoom In</span>
            </button>
            <button
              onClick={handleReset}
              className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded transition-colors flex items-center space-x-1"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleRotateClockwise}
              className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded transition-colors flex items-center space-x-1"
              title={`Rotate (${rotation}°)`}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Rotate</span>
            </button>
            <button
              onClick={() => setShowFilterPopup(true)}
              className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded transition-colors flex items-center space-x-1"
              title="ACL/Meniscal Filter"
            >
              <Filter className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* Main Content - Column Layout */}
        <div
          className={`flex flex-col gap-6 ${showMetadata ? "pr-80" : ""} transition-all duration-300`}
        >
          {/* MRI Display Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              {/* MRI Image Display Card with Embedded Scrollbar */}
              <div
                className="bg-white border-4 border-gray-400 rounded-lg shadow-lg p-4 relative"
                style={{
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  outline: "2px solid #3b82f6",
                  outlineOffset: "2px",
                  height: "420px",
                }}
              >
                {/* DICOM Image Area - Fixed container */}
                <div className="absolute inset-3 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-80 max-h-80">
                    {/* Fixed DICOM Image */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="text-center">
                        {/* MRI Image Placeholder - Fixed Position with Zoom and Rotation */}
                        <div
                          className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center border border-border shadow-inner transition-transform duration-300"
                          style={{
                            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            transformOrigin: "center",
                          }}
                        >
                          <div className="text-center text-white">
                            <div className="text-2xl font-mono mb-2">
                              MRI Slice {currentSlice}
                            </div>
                            <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                              <div className="text-xs opacity-75">
                                DICOM Image
                              </div>
                            </div>
                            <div className="text-xs mt-4 opacity-60">
                              Slice {currentSlice} of {totalSlices}
                            </div>
                            <div className="text-xs mt-2 opacity-40">
                              Zoom: {(zoomLevel * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Scrollbar for slice navigation - always visible inside the box */}
                    <div
                      ref={setScrollContainer}
                      className="absolute inset-0 overflow-y-scroll z-10 rounded-lg dicom-visible-scrollbar"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.02)",
                        scrollbarWidth: "auto",
                        scrollbarGutter: "stable",
                        scrollbarColor: "#3b82f6 #e5e7eb",
                      }}
                      onScroll={(e) => {
                        const scrollTop = e.currentTarget.scrollTop;
                        const maxScroll =
                          e.currentTarget.scrollHeight -
                          e.currentTarget.clientHeight;
                        const sliceProgress = scrollTop / maxScroll;
                        const newSlice =
                          Math.round(sliceProgress * (totalSlices - 1)) + 1;
                        if (newSlice !== currentSlice) {
                          setCurrentSlice(newSlice);
                        }
                      }}
                    >
                      {/* Virtual content for scrolling */}
                      <div className="h-[2400px] w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Slice Number Display - Top Right */}
                <div className="absolute top-2 right-2">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                    Slice {currentSlice}/{totalSlices}
                  </div>
                </div>

                {/* Patient Info - Bottom Left */}
                <div className="absolute bottom-2 left-2">
                  <div className="text-xs text-muted-foreground bg-card/90 backdrop-blur px-2 py-1 rounded border border-border">
                    <div className="font-medium text-foreground text-xs">
                      {currentPatient?.name ||
                        studyData?.patientName ||
                        "Jane Doe"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Panel - Sliding from right */}
        {showMetadata && (
          <div className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border shadow-xl z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Study Metadata
              </h3>
              <button
                onClick={() => setShowMetadata(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
              {/* Study Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    Study Information
                  </h4>
                  <button
                    onClick={
                      isEditingMetadata
                        ? handleSaveMetadata
                        : handleEditMetadata
                    }
                    className="text-medical-blue hover:text-medical-blue-dark transition-colors"
                    title={isEditingMetadata ? "Save changes" : "Edit metadata"}
                  >
                    {isEditingMetadata ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Study ID:</span>
                    <span className="text-foreground font-mono">{studyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient:</span>
                    <span className="text-foreground">
                      {metadata?.studyInfo?.patientName ||
                        currentPatient?.name ||
                        studyData?.patientName ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Study Date:</span>
                    <span className="text-foreground">
                      {metadata?.studyInfo?.studyDate ||
                        currentPatient?.date ||
                        "October 25, 2023"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modality:</span>
                    <span className="text-foreground">
                      {metadata?.studyInfo?.modality || "MRI"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Body Part:</span>
                    <span className="text-foreground">
                      {metadata?.studyInfo?.bodyPart ||
                        currentPatient?.bodyPart ||
                        "Knee"}
                    </span>
                  </div>
                  {/* AI Final Diagnosis in Study Information */}
                  <div className="border-t border-border pt-3 mt-3">
                    <span className="text-muted-foreground text-xs">
                      AI Final Diagnosis:
                    </span>
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                        Likely ACL Tear
                      </div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        ACL Probability: 72% | Meniscal Probability: 64%
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">
                      Status:
                    </span>
                    {isEditingMetadata ? (
                      <select
                        value={editMetadataForm.status}
                        onChange={(e) => {
                          setEditMetadataForm({
                            ...editMetadataForm,
                            status: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-2 py-1 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-medical-blue"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Follow Up">Follow Up</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (metadata?.status ||
                            currentPatient?.status ||
                            "Pending") === "Complete"
                            ? "bg-green-100 text-green-800"
                            : (metadata?.status ||
                                  currentPatient?.status ||
                                  "Pending") === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : (metadata?.status ||
                                    currentPatient?.status ||
                                    "Pending") === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : (metadata?.status ||
                                      currentPatient?.status ||
                                      "Pending") === "Follow Up"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {metadata?.status ||
                          currentPatient?.status ||
                          "Pending"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs">
                      Study Description:
                    </span>
                    {isEditingMetadata ? (
                      <textarea
                        value={editMetadataForm.description}
                        onChange={(e) => {
                          setEditMetadataForm({
                            ...editMetadataForm,
                            description: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-2 py-1 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-medical-blue resize-none"
                        rows={2}
                        placeholder="Enter study description..."
                      />
                    ) : (
                      <p className="text-foreground text-xs">
                        {metadata?.description ||
                          studyData?.studyDescription ||
                          "No description available"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  Technical Parameters
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Slice Thickness:
                    </span>
                    <span className="text-foreground">
                      {metadata?.technicalParams?.sliceThickness || "3.0 mm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TR:</span>
                    <span className="text-foreground">
                      {metadata?.technicalParams?.tr || "2500 ms"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TE:</span>
                    <span className="text-foreground">
                      {metadata?.technicalParams?.te || "85 ms"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Field Strength:
                    </span>
                    <span className="text-foreground">
                      {metadata?.technicalParams?.fieldStrength || "1.5 Tesla"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matrix:</span>
                    <span className="text-foreground">
                      {metadata?.technicalParams?.matrix || "512 x 512"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Slice Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  Current Slice ({currentSlice})
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="text-foreground">
                      {currentSlice} of {totalSlices}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">
                      {-15 + currentSlice * 3} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Window Level:</span>
                    <span className="text-foreground">350</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Window Width:</span>
                    <span className="text-foreground">1500</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">AI Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 font-medium">ACL Tear</span>
                      <span className="text-red-600 font-bold">72%</span>
                    </div>
                    <p className="text-red-600 text-xs mt-1">
                      High probability detected
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-medium">
                        Meniscus Tear
                      </span>
                      <span className="text-orange-600 font-bold">64%</span>
                    </div>
                    <p className="text-orange-600 text-xs mt-1">
                      Moderate probability
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipment Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Equipment</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="text-foreground">
                      {metadata?.equipment?.manufacturer || "Siemens"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="text-foreground">
                      {metadata?.equipment?.model || "MAGNETOM Aera"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Software:</span>
                    <span className="text-foreground">
                      {metadata?.equipment?.software || "syngo MR E11"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Remarks</h4>
                {isEditingMetadata ? (
                  <textarea
                    value={editMetadataForm.remarks}
                    onChange={(e) => {
                      setEditMetadataForm({
                        ...editMetadataForm,
                        remarks: e.target.value,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue resize-none"
                    rows={3}
                    placeholder="Enter remarks or notes..."
                  />
                ) : (
                  <div className="p-3 bg-muted/50 border border-border rounded-lg">
                    <p className="text-sm text-foreground">
                      {metadata?.remarks ||
                        currentPatient?.remarks ||
                        "No remarks available"}
                    </p>
                  </div>
                )}
                {metadata?.lastModified && (
                  <p className="text-xs text-muted-foreground">
                    Last updated:{" "}
                    {new Date(metadata.lastModified).toLocaleString()}
                  </p>
                )}
                {isEditingMetadata && (
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs border border-border rounded text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMetadata}
                      className="px-3 py-1 text-xs bg-medical-blue text-white rounded hover:bg-medical-blue-dark transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay when metadata is open */}
        {showMetadata && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMetadata(false)}
          />
        )}

        {/* Study Information */}
        {(studyData || metadata || currentPatient) && (
          <div className="mt-6 medical-card p-4 study-information-section">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Study Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Study ID:</span>
                <span className="ml-2 text-foreground font-medium">
                  {studyId}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Study Time:</span>
                <span className="ml-2 text-foreground font-medium">
                  {currentPatient?.time || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-muted-foreground">Status:</span>
                  {isEditingStatus ? (
                    <div className="ml-2 flex items-center space-x-2">
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        className="px-2 py-1 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-medical-blue"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="Follow Up">Follow Up</option>
                      </select>
                      <button
                        onClick={handleStatusSave}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleStatusCancel}
                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={handleStatusEdit}
                      className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-medical-blue transition-all ${
                        (metadata?.status ||
                          currentPatient?.status ||
                          "Pending") === "Complete"
                          ? "bg-green-100 text-green-800"
                          : (metadata?.status ||
                                currentPatient?.status ||
                                "Pending") === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : (metadata?.status ||
                                  currentPatient?.status ||
                                  "Pending") === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : (metadata?.status ||
                                    currentPatient?.status ||
                                    "Pending") === "Follow Up"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                      }`}
                      title="Click to edit status"
                    >
                      {metadata?.status || currentPatient?.status || "Pending"}
                      <Edit className="w-3 h-3 ml-1 opacity-60" />
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Files:</span>
                <div className="ml-2 mt-1 space-y-1">
                  {studyData?.files?.map((file: any, index: number) => (
                    <div key={index} className="text-foreground text-xs">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Final Diagnosis */}
              <div className="col-span-2 mt-4 pt-4 border-t border-border">
                <span className="text-muted-foreground">
                  AI Final Diagnosis:
                </span>
                <div className="ml-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      Likely ACL Tear
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                    <div>• ACL Tear Probability: 72%</div>
                    <div>• Meniscal Tear Probability: 64%</div>
                    <div className="text-xs opacity-75 mt-2">
                      Generated by AI analysis • Review recommended
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Warning Popup */}
        {showStatusWarning && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Status Update Required
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                This study's status needs attention. Please update the status to
                reflect the current progress of this case.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleRemindLater}
                  className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  Remind Later
                </button>
                <button
                  onClick={() => {
                    setShowStatusWarning(false);
                    handleStatusEdit();
                  }}
                  className="px-4 py-2 text-sm bg-medical-blue text-white rounded-lg hover:bg-medical-blue-dark transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Warning Popup */}
        {showNavigationWarning && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Status Needs Attention
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                This study's status needs to be updated. Do you want to update
                the status before leaving, or continue without updating?
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleNavigateAnyway}
                  className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  Leave Anyway
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 text-sm bg-medical-blue text-white rounded-lg hover:bg-medical-blue-dark transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACL/Meniscal Filter Popup */}
        {showFilterPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Tear Filters
                </h3>
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable enhancement filters to highlight specific tear types in
                  the MRI images.
                </p>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-medical-blue bg-background border-border rounded focus:ring-medical-blue focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        ACL Enhancement
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Highlight ACL tear patterns
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-medical-blue bg-background border-border rounded focus:ring-medical-blue focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Meniscal Enhancement
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Highlight meniscal tear patterns
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFilterPopup(false)}
                  className="px-4 py-2 bg-medical-blue hover:bg-medical-blue-dark text-white rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
