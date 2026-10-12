'use client';
import { useState } from 'react';

export default function UploadBox() {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setResult(null); // Reset previous results if new image is chosen
  };

  const clearImage = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("API Error:", error);
      setResult({ status: "error", message: "Failed to connect to AI server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div 
          className={`w-full p-10 text-center border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleChange} 
          />
          <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="text-gray-700 font-semibold text-lg">Drag and drop your headshot here</p>
          <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG (Max 5MB)</p>
          <button className="mt-6 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Browse Files
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-2xl bg-gray-50">
          <p className="text-green-600 font-semibold mb-4">✓ Image ready for processing</p>
          <img 
            src={preview} 
            alt="Upload preview" 
            className="w-48 h-48 object-cover rounded-full shadow-lg border-4 border-white mb-6" 
          />
          
          {result && result.status === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 text-center w-full max-w-md">
              <p className="font-bold">{result.message}</p>
              <p>File: {result.filename} ({result.size_kb} KB)</p>
            </div>
          )}

          {result && result.status === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 text-center w-full max-w-md">
              <p className="font-bold">{result.message}</p>
              <p>Make sure your FastAPI server is running.</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button 
              onClick={clearImage} 
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clear Image
            </button>
            <button 
              onClick={analyzeImage}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center min-w-[160px] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Analyze Face Shape"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 