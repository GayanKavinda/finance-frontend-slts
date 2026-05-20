'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageCropModal({ image, imageData, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      // Add small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, bgColor);
      
      // Add another small delay before closing
      await new Promise(resolve => setTimeout(resolve, 200));
      onComplete(croppedImage);
    } catch (e) {
      console.error('Crop error:', e);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        
        {/* Left Side: Cropper */}
        <div className="relative h-64 md:h-[480px] w-full md:w-3/5 bg-slate-100 dark:bg-slate-950 flex-shrink-0">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round"
            showGrid={false}
            objectFit="contain"
            style={{ containerStyle: { backgroundColor: bgColor } }}
          />
        </div>

        {/* Right Side: Controls */}
        <div className="flex flex-col w-full md:w-2/5 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          
          {/* Header */}
          <div className="flex flex-col gap-1 p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-8">
              Adjust Profile Picture
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Customize your avatar appearance
            </p>
          </div>

          {/* Scrollable Settings Area */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            
            {/* Zoom Slider */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-3">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>1x</span>
                <span>3x</span>
              </div>
            </div>

            {/* Image Details */}
            {imageData && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">File Details</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">Name</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-bold truncate max-w-[150px]" title={imageData.name}>
                      {imageData.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">Size</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                      {(imageData.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">Type</span>
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-bold uppercase">
                      {imageData.type.split('/')[1]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Background Color Picker */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-3">
                Background Color (For Transparent Images)
              </label>
              
              <div className="space-y-4">
                {/* Theme Colors */}
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider">Theme Colors</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {['#f1f5f9', '#dbeafe', '#d1fae5', '#fce7f3', '#fef3c7', '#f3e8ff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          bgColor === color ? 'border-primary scale-110 shadow-md' : 'border-slate-200 dark:border-slate-700'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Theme color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Basic Colors */}
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider">Basic & Custom</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {['#ffffff', '#000000'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          bgColor === color ? 'border-primary scale-110 shadow-md' : 'border-slate-200 dark:border-slate-700'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Basic color ${color}`}
                      />
                    ))}
                    
                    {/* Custom Color Picker */}
                    <div className="relative ml-1 flex h-8 w-8 overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-700 transition-transform hover:scale-110" title="Custom color">
                      <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500 pointer-events-none" />
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="absolute -inset-2 h-14 w-14 cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Drag the image to reposition it within the circle, and use the slider to zoom in or out.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 mt-auto">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={createCroppedImage}
              disabled={isProcessing}
              className="group relative flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Picture
                  </>
                )}
              </span>
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc, pixelCrop, bgColor = "#ffffff") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = 500; // Max width/height for avatar
  const scale = Math.min(maxSize / pixelCrop.width, maxSize / pixelCrop.height);
  
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
