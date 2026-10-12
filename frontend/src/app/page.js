'use client';
import { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'; // Make sure to run: npm install lucide-react

export default function StylingStudio() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  const processFile = (uploadedFile) => {
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
  };

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    
    // Simulate backend delay for now until we reconnect the API
    setTimeout(() => {
      setResults({
        status: "success",
        face_shape: "Strong Jawline / Square",
        landmarks_detected: 468,
        recommendation: "Angular frames and textured top hairstyles recommended."
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 border-b border-gray-800 pb-6 flex items-center gap-3">
          <Sparkles className="text-emerald-500 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight text-white">
            LookLogic AI <span className="text-gray-500 font-light">| Virtual Studio</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Upload Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100">Upload Portrait</h2>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-700 hover:border-emerald-500 transition-colors bg-gray-900/50 rounded-xl p-12 text-center cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-64 object-cover rounded-lg shadow-2xl" />
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-2">Drag and drop your headshot here</p>
                  <label className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md cursor-pointer transition text-sm">
                    Browse Files
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => processFile(e.target.files[0])} />
                  </label>
                </>
              )}
            </div>

            <button 
              onClick={runAnalysis}
              disabled={!file || loading}
              className={`w-full py-4 rounded-lg font-medium transition-all ${
                !file ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
              }`}
            >
              {loading ? 'Analyzing Facial Geometry...' : 'Run AI Analysis'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100">Styling Metrics</h2>
            
            {results ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-emerald-500 w-6 h-6" />
                  <h3 className="text-2xl font-bold text-white">Analysis Complete</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-800 pb-3">
                    <span className="text-gray-400">Face Shape</span>
                    <span className="font-medium text-white">{results.face_shape}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-3">
                    <span className="text-gray-400">Landmarks Mapped</span>
                    <span className="font-medium text-emerald-400">{results.landmarks_detected} points</span>
                  </div>
                  <div className="pt-4">
                    <span className="text-gray-400 text-sm block mb-2">AI Styling Recommendation</span>
                    <p className="text-gray-200 bg-gray-800 p-4 rounded-lg text-sm leading-relaxed">
                      {results.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center border border-gray-800 rounded-xl bg-gray-900/20">
                <div className="text-center">
                  <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">Awaiting image upload...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}90   