import React, { useState, useRef, useEffect } from 'react';
import { Scan, ShieldAlert, Cpu, Award, RefreshCw, UploadCloud } from 'lucide-react';
import { visionAPI } from '../services/api';

// Pre-defined mock images data to ensure seamless simulation
const MOCK_PRESETS = [
  {
    id: 'flood',
    name: 'Biscayne Flash Flood (Aerial)',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    victims: [
      { x: 80, y: 120, w: 70, h: 70, label: 'Victim (Stranded)', conf: '94.2%' },
      { x: 380, y: 180, w: 90, h: 80, label: 'Rescue Raft', conf: '98.5%' },
      { x: 230, y: 290, w: 60, h: 60, label: 'Victim (Roof)', conf: '91.8%' }
    ]
  },
  {
    id: 'wildfire',
    name: 'Everglades Forest (Overhead)',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    victims: [
      { x: 280, y: 150, w: 60, h: 60, label: 'Heat Signature (Person)', conf: '88.4%' }
    ]
  },
  {
    id: 'coast',
    name: 'Ocean Rescue (Coastal)',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
    victims: [
      { x: 190, y: 200, w: 50, h: 50, label: 'Stranded Swimmer', conf: '96.1%' },
      { x: 270, y: 220, w: 50, h: 50, label: 'Stranded Swimmer', conf: '92.4%' }
    ]
  }
];

export default function VictimDetection() {
  const [selectedPreset, setSelectedPreset] = useState(MOCK_PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  
  const [detectedVictims, setDetectedVictims] = useState([]);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [modelName, setModelName] = useState('YOLOv8-Rescue');
  const [imgWidth, setImgWidth] = useState(500);
  const [imgHeight, setImgHeight] = useState(350);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Run the AI scanning simulation
  const startScanning = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setError('');
    setStatusMessage('');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Call backend API in parallel to the scan line animation!
    let backendResult = null;
    try {
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      backendResult = await visionAPI.detect(base64);
    } catch (err) {
      console.error('Vision API error:', err);
      setError(err.response?.data?.message || 'Connection to backend YOLOv8 model failed.');
    }

    let scanLineY = 0;
    const duration = 2000; // 2 seconds scan
    const start = performance.now();

    const animate = (time) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      // 1. Redraw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Draw holographic green grid scanning line
      scanLineY = progress * canvas.height;
      ctx.strokeStyle = '#00D8F6';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00D8F6';
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(canvas.width, scanLineY);
      ctx.stroke();

      // Add a gradient overlay behind the scan line
      const grad = ctx.createLinearGradient(0, scanLineY - 30, 0, scanLineY);
      grad.addColorStop(0, 'rgba(0, 216, 246, 0)');
      grad.addColorStop(1, 'rgba(0, 216, 246, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanLineY - 30, canvas.width, 30);

      // Reset shadows
      ctx.shadowBlur = 0;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Scanning finished! Render bounding boxes
        setIsScanning(false);
        setScanComplete(true);
        
        if (backendResult) {
          setDetectedVictims(backendResult.victims);
          setInferenceTime(backendResult.inferenceTimeMs || 42);
          setModelName(backendResult.model || 'YOLOv8n');
          setImgWidth(backendResult.width || 500);
          setImgHeight(backendResult.height || 350);
          setStatusMessage(backendResult.message || '');
          drawBoundingBoxes(backendResult.victims, backendResult.width || 500, backendResult.height || 350);
        } else {
          setDetectedVictims([]);
          setInferenceTime(0);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const drawBoundingBoxes = (victimsList, widthVal, heightVal) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Redraw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const victims = victimsList || detectedVictims;
    const wVal = widthVal || imgWidth;
    const hVal = heightVal || imgHeight;

    const scaleX = canvas.width / wVal;
    const scaleY = canvas.height / hVal;

    victims.forEach((vic) => {
      const x = vic.x * scaleX;
      const y = vic.y * scaleY;
      const w = vic.w * scaleX;
      const h = vic.h * scaleY;

      // Draw Glowing Rectangle
      ctx.strokeStyle = '#00E676'; // green
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00E676';
      ctx.shadowBlur = 10;
      ctx.strokeRect(x, y, w, h);

      // Draw Corner Brackets for high-tech look
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;

      // Draw Label Badge
      ctx.fillStyle = 'rgba(0, 230, 118, 0.9)';
      ctx.fillRect(x, y - 22, w, 22);

      ctx.fillStyle = '#0B0F19';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${vic.label} [${vic.conf}]`, x + 4, y - 8);
    });
  };

  // Redraw when preset changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedPreset.url;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 500;
        canvas.height = 350;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setScanComplete(false);
      }
    };
    imgRef.current = img;
  }, [selectedPreset]);

  // Handle custom drag-drop upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create custom preset
        const customPreset = {
          id: 'custom',
          name: file.name,
          url: event.target.result,
          victims: [
            { x: 150, y: 100, w: 80, h: 80, label: 'Detected Person', conf: '92.1%' },
            { x: 300, y: 160, w: 70, h: 70, label: 'Unidentified Hazard', conf: '84.6%' }
          ]
        };
        setSelectedPreset(customPreset);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Left - Control & Image Selection (1/3) */}
      <div className="glass-panel p-5 space-y-6">
        <div className="pb-3 border-b border-brand-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Feed Selection</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Select a real-time camera payload feed</p>
        </div>

        {/* Presets List */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active UAV Camera Streams</label>
          <div className="space-y-2">
            {MOCK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-all duration-200
                  ${selectedPreset.id === preset.id 
                    ? 'bg-brand-glow/10 border-brand-glow text-brand-glow shadow-glow' 
                    : 'bg-brand-dark border-brand-border text-slate-300 hover:border-slate-700'}
                `}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] font-mono text-slate-500 bg-brand-dark px-1.5 py-0.5 rounded border border-brand-border">
                  Preset
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Drag Drop Custom Image Upload */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Custom Aerial Feed</label>
          <label className="border border-dashed border-brand-border hover:border-brand-glow/40 bg-brand-dark hover:bg-slate-900 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center">
            <UploadCloud size={24} className="text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300">Drag & drop or browse</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Supports JPG, PNG (Max 5MB)</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Scan Trigger Button */}
        <button
          onClick={startScanning}
          disabled={isScanning}
          className="w-full py-3 bg-brand-glow hover:bg-brand-glow/90 disabled:bg-slate-800 text-brand-dark font-extrabold rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-glow"
        >
          <Scan size={14} />
          {isScanning ? 'Running AI Engine...' : 'Run Vision Inference'}
        </button>
      </div>

      {/* 2. Middle & Right - AI Vision Monitor Canvas (2/3) */}
      <div className="lg:col-span-2 glass-panel p-5 flex flex-col items-center justify-between h-full min-h-[480px]">
        <div className="w-full pb-3 border-b border-brand-border mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu size={14} className="text-brand-glow" />
              HUD Computer Vision Analyzer
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Inference models detecting survivors and rescue equipment</p>
          </div>
          <span className="text-[9px] font-mono text-brand-success bg-brand-success/10 border border-brand-success/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Model: {modelName}
          </span>
        </div>

        {error && (
          <div className="w-full mb-3 p-3 bg-brand-danger/10 border border-brand-danger/30 rounded-lg text-brand-danger text-[10px] flex items-center gap-2">
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="w-full mb-3 p-3 bg-brand-glow/10 border border-brand-glow/30 rounded-lg text-brand-glow text-[10px] flex items-center gap-2">
            <Scan size={14} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="relative border border-brand-border bg-black rounded-lg overflow-hidden flex items-center justify-center max-w-full">
          <canvas 
            ref={canvasRef} 
            className="w-full max-w-[500px] aspect-[500/350]" 
          />

          {/* Holographic HUD Overlays when Scanning */}
          {isScanning && (
            <div className="absolute inset-0 bg-brand-glow/5 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full border border-brand-glow/30 flex items-center justify-center animate-spin mb-4">
                <RefreshCw size={24} className="text-brand-glow" />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-brand-glow animate-pulse">
                Analyzing Telemetry Matrix...
              </span>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Targets Detected</span>
              <span className="text-2xl font-bold font-mono text-slate-200">
                {scanComplete ? detectedVictims.length : '--'}
              </span>
            </div>
            <Award size={22} className="text-brand-glow" />
          </div>

          <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mean Confidence</span>
              <span className="text-2xl font-bold font-mono text-slate-200">
                {scanComplete && detectedVictims.length > 0
                  ? `${(detectedVictims.reduce((acc, v) => acc + parseFloat(v.conf), 0) / detectedVictims.length).toFixed(1)}%` 
                  : '--'}
              </span>
            </div>
            <Cpu size={22} className="text-brand-success" />
          </div>

          <div className="p-4 bg-brand-dark border border-brand-border rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Inference Speed</span>
              <span className="text-2xl font-bold font-mono text-slate-200">
                {scanComplete ? `${inferenceTime} ms` : '--'}
              </span>
            </div>
            <Scan size={22} className="text-brand-warning" />
          </div>
        </div>

      </div>

    </div>
  );
}
