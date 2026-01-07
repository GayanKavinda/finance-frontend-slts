'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageCropModal({ image, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      // Add small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !isProcessing && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Crop Your Avatar
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-96 bg-slate-100 dark:bg-slate-950">
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
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Zoom Slider */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
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
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>1x</span>
              <span>3x</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Drag to reposition, use slider to zoom
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={createCroppedImage}
              disabled={isProcessing}
              className="group relative flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg font-bold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 overflow-hidden"
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
                    <Check size={16} />
                    Crop & Save
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
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = 500; // Max width/height for avatar
  const scale = Math.min(maxSize / pixelCrop.width, maxSize / pixelCrop.height);
  
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

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
