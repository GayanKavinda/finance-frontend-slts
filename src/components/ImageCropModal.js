"use client";

// src/components/ImageCropModal.js
// Avatar crop dialog — zen design-system styling (Card tokens, Button, muted
// labels) so it matches Settings → Account.

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, Loader2, Image as ImageIcon, Info, Type, Hash, FileType } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SWATCHES = [
  "#ffffff",
  "#f1f5f9",
  "#dbeafe",
  "#d1fae5",
  "#fce7f3",
  "#fef3c7",
  "#f3e8ff",
  "#000000",
];

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
      await new Promise((r) => setTimeout(r, 250));
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, bgColor);
      await new Promise((r) => setTimeout(r, 150));
      onComplete(croppedImage);
    } catch (e) {
      console.error("Crop error:", e);
      onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && !isProcessing && onCancel()}
      >
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <ImageIcon className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Adjust Profile Picture</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Drag to reposition and use the zoom slider to frame your avatar
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              aria-label="Close"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
            {/* Cropper */}
            <div className="relative h-64 md:h-80 md:min-h-[320px] bg-muted/40 border-b md:border-b-0 md:border-r border-border">
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

            {/* Controls */}
            <div className="p-4 space-y-4">
              {/* Zoom */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="crop-zoom" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Zoom
                  </label>
                  <span className="text-[10px] font-mono font-medium text-foreground">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  id="crop-zoom"
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-[hsl(var(--primary))]"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground/70 mt-1">
                  <span>1x</span>
                  <span>3x</span>
                </div>
              </div>

              {/* Background */}
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Background
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBgColor(color)}
                      aria-label={`Background ${color}`}
                      className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                        bgColor === color ? "border-primary ring-2 ring-primary/25" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* File details */}
              {imageData && (
                <div className="rounded-lg border border-border divide-y divide-border">
                  <p className="px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    File Details
                  </p>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Type className="w-3 h-3" /> Name
                    </span>
                    <span className="text-[10px] font-medium text-foreground truncate max-w-[130px]" title={imageData.name}>
                      {imageData.name || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Hash className="w-3 h-3" /> Size
                    </span>
                    <span className="text-[10px] font-medium text-foreground">
                      {typeof imageData.size === "number" ? `${(imageData.size / 1024).toFixed(1)} KB` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <FileType className="w-3 h-3" /> Type
                    </span>
                    <span className="text-[10px] font-medium text-foreground uppercase">
                      {typeof imageData.type === "string"
                        ? imageData.type.split("/")[1] || imageData.type
                        : "—"}
                    </span>
                  </div>
                </div>
              )}

              {/* Hint */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Avatars are saved at 500×500 for consistency across the navbar and profile.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={createCroppedImage} disabled={isProcessing || !croppedAreaPixels}>
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Picture
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc, pixelCrop, bgColor = "#ffffff") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

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
    }, "image/jpeg", 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
