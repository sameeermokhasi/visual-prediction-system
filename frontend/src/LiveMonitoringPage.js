// In frontend/src/LiveMonitoringPage.js
import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  FiCheckCircle, FiXCircle, FiLoader, FiCamera,
  FiActivity, FiBox, FiAlertTriangle
} from 'react-icons/fi';
import { MdOutlinePrecisionManufacturing } from "react-icons/md"; 


// --- Configuration ---
const API_URL = 'http://localhost:8000';
const GOOD_CLASSES = ['polished_casting', 'unpolished_casting']; 

// --- Helper Components ---

// Basic Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

// Custom Hook for Inspection Logic
const useInspection = (webcamRef, addInspectionToHistory) => {
  const [result, setResult] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanTime, setScanTime] = useState(null);
  const inspectionIdCounter = useRef(Math.floor(Math.random() * 1000) + 1800); 

  const captureAndInspect = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResult(null);
    setSnapshot(null);
    setScanTime(null);
    
    if (!webcamRef.current) {
        console.error("Webcam ref not available.");
        setIsLoading(false);
        return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.error("Failed to get screenshot.");
      setIsLoading(false);
      return;
    }
    setSnapshot(imageSrc);

    const startTime = performance.now(); 
    const currentId = `D-${inspectionIdCounter.current++}`;

    const fetchRes = await fetch(imageSrc);
    const blob = await fetchRes.blob();
    const formData = new FormData();
    formData.append('file', blob, 'inspection_capture.jpg');
    
    // Get token from localStorage to send with request
    const token = localStorage.getItem("vision_ai_token");

    let apiResult = null;
    try {
      const response = await axios.post(`${API_URL}/inspect`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // <-- ADDED AUTH TOKEN
        } 
      });
      apiResult = response.data;
      setResult(apiResult);
    } catch (error) {
      console.error("Error during API call:", error);
      if (error.response && error.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("vision_ai_token");
        window.location.reload(); // Force app to reload to login screen
      }
      apiResult = { status: 'rejected', detections: [{ prediction: 'API Error', confidence: 0, box: [0,0,0,0] }] };
      setResult(apiResult);
    } finally {
      const endTime = performance.now(); 
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
      setScanTime(timeTaken);
      setIsLoading(false);
      
      if (addInspectionToHistory) {
        const detections = apiResult?.detections || [];
        const defectCount = detections.filter(d => !GOOD_CLASSES.includes(d.prediction)).length;
        addInspectionToHistory({
          id: currentId,
          status: apiResult?.status || 'error', 
          time: timeTaken,
          defectCount: defectCount,
        });
      }
    }
  }, [webcamRef, isLoading, addInspectionToHistory]);

  return { result, snapshot, isLoading, scanTime, captureAndInspect };
};

// Result Card Component for Live Monitoring Section
const LiveResultCard = ({ result, snapshot, isLoading, scanTime }) => {
  // Use aspect-video for a 16:9 ratio
  const aspectClass = "aspect-video"; 

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 h-full text-center min-h-[300px] ${aspectClass}`}>
        <FiLoader className="animate-spin h-10 w-10 text-blue-500 mb-4" />
        <span className="text-lg font-medium text-gray-600">Analyzing...</span>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 h-full text-center min-h-[300px] ${aspectClass} border-2 border-dashed border-gray-200 text-gray-400`}>
        <FiBox className="h-12 w-12 mb-3" />
        <p className="text-lg">Capture an image to inspect</p>
      </div>
    );
  }

  const overallStatus = result?.status || 'unknown';
  const detections = result?.detections || [];
  const defectCount = detections.filter(d => !GOOD_CLASSES.includes(d.prediction)).length;
  const confidence = detections.length > 0 && detections[0].confidence !== undefined ? (detections[0].confidence * 100).toFixed(1) : '0';

  return (
    <div className={`relative w-full ${aspectClass} bg-gray-100 rounded-lg overflow-hidden border border-gray-200`}>
      <img src={snapshot} alt="Inspection Snapshot" className="block w-full h-full object-cover" />
      
      <div className="absolute top-3 left-3 p-2 bg-black/60 text-white text-xs font-bold rounded flex items-center z-10">
        {isLoading ? (
            <> <FiLoader className="animate-spin mr-1" /> Scanning... </>
        ) : overallStatus === 'accepted' ? (
            <> <FiCheckCircle className="mr-1 text-green-400" /> Pass </>
        ) : defectCount > 0 ? (
            <> <FiXCircle className="mr-1 text-red-400" /> Fail: {defectCount} Defects </>
        ) : (
             <> <FiAlertTriangle className="mr-1 text-yellow-400" /> Unknown </>
        )}
      </div>

      {!isLoading && (
        <div className="absolute top-3 right-3 p-2 bg-black/60 text-white text-xs font-bold rounded z-10">
          Conf: {confidence}%
        </div>
      )}

      {/* Bounding Boxes */}
      {detections.map((det, index) => {
        if (!det.box || !Array.isArray(det.box) || det.box.length !== 4) {
             console.warn("Skipping detection with invalid box data:", det);
             return null; 
        }
        const [x1, y1, x2, y2] = det.box;
        if ([x1, y1, x2, y2].some(coord => typeof coord !== 'number' || isNaN(coord))) {
            console.warn("Skipping detection with invalid coordinates:", det.box);
            return null;
        }
        const isGood = GOOD_CLASSES.includes(det.prediction);
        const borderColor = isGood ? 'border-green-500' : 'border-red-500';
        return (
          <div
            key={index}
            className={`absolute border-2 ${borderColor} rounded-sm pointer-events-none z-10`}
            style={{
              left: `${x1 * 100}%`, top: `${y1 * 100}%`,
              width: `${(x2 - x1) * 100}%`, height: `${(y2 - y1) * 100}%`,
            }}
          />
        );
      })}

      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 flex justify-between text-sm font-semibold z-10">
        <span>Scan Time: {scanTime || 'N/A'}s</span>
        <span>Defects: {defectCount}</span>
        <span>Confidence: {confidence}%</span>
      </div>
    </div>
  );
};

// --- Recent Inspections List ---
const RecentInspections = ({ inspections }) => (
  <Card className="flex flex-col h-full">
    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
      <FiActivity className="mr-2" /> Recent Inspections
    </h3>
    <div className="flex-grow space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      {inspections.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">No inspections yet. Run a scan to see results here.</p>
      ) : (
        inspections.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center min-w-0"> 
              {item.status === 'accepted' ? (
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              ) : (
                <FiXCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              )}
              <div className="overflow-hidden">
                <span className="font-semibold text-gray-800 text-sm truncate block">{item.id}</span>
                <span className="text-xs text-gray-500 block">{item.time}s</span>
              </div>
            </div>
            <span 
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex-shrink-0 ml-2`}
            >
              {item.status === 'accepted' ? 'PASS' : `FAIL (${item.defectCount})`}
            </span>
          </div>
        ))
      )}
    </div>
  </Card>
);

// --- Main LiveMonitoringPage Component ---
const LiveMonitoringPage = ({ onBack }) => {
  const [recentInspections, setRecentInspections] = useState([]);
  
  const addInspectionToHistory = useCallback((inspection) => {
    setRecentInspections(prev => [inspection, ...prev.slice(0, 14)]); 
  }, []);

  const webcamRef1 = useRef(null);
  const { result: result1, snapshot: snapshot1, isLoading: isLoading1, scanTime: scanTime1, captureAndInspect: captureAndInspect1 } = useInspection(webcamRef1, addInspectionToHistory);
  const webcamRef2 = useRef(null);
  const { result: result2, snapshot: snapshot2, isLoading: isLoading2, scanTime: scanTime2, captureAndInspect: captureAndInspect2 } = useInspection(webcamRef2, addInspectionToHistory);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-6 lg:p-10">
       <nav className="bg-white shadow-md w-full mb-8 rounded-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-xl font-extrabold text-gray-900">
                <MdOutlinePrecisionManufacturing className="h-7 w-7 text-blue-600" />
                <span>Live Monitoring Dashboard</span>
            </div>
            <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Grid Layout for Monitoring - NEW 2-COLUMN LAYOUT */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Main Column (2/3 width) for Webcams */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Webcam A */}
            <Card className="flex flex-col h-full p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>Line A
                </h3>
                {/* Webcam Container - 16:9 aspect ratio */}
                <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4"> 
                    <Webcam
                        audio={false}
                        ref={webcamRef1}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "environment", width: 1920, height: 1080 }} 
                    />
                    <button onClick={captureAndInspect1} disabled={isLoading1} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 z-20">
                        {isLoading1 ? <FiLoader className="animate-spin mr-1.5 h-4 w-4" /> : <FiCamera className="mr-1.5 h-4 w-4" />} {isLoading1 ? '...' : 'Inspect'}
                    </button>
                </div>
                {/* Result Display */}
                <div className="mt-auto">
                     <LiveResultCard result={result1} snapshot={snapshot1} isLoading={isLoading1} scanTime={scanTime1} />
                </div>
            </Card>

            {/* Webcam B */}
             <Card className="flex flex-col h-full p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>Line B
                </h3>
                 {/* Webcam Container - 16:9 aspect ratio */}
                <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                    <Webcam
                        audio={false}
                        ref={webcamRef2}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "environment", width: 1920, height: 1080 }} 
                    />
                     <button onClick={captureAndInspect2} disabled={isLoading2} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 z-20">
                        {isLoading2 ? <FiLoader className="animate-spin mr-1.5 h-4 w-4" /> : <FiCamera className="mr-1.5 h-4 w-4" />} {isLoading2 ? '...' : 'Inspect'}
                    </button>
                </div>
                 {/* Result Display */}
                 <div className="mt-auto">
                     <LiveResultCard result={result2} snapshot={snapshot2} isLoading={isLoading2} scanTime={scanTime2} />
                 </div>
            </Card>
        </div>
        
        {/* Sidebar Column (1/3 width) for Recent Inspections */}
        <div className="lg:col-span-1">
          <div className="sticky top-10"> {/* Makes the history stick on scroll */}
            <RecentInspections inspections={recentInspections} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;