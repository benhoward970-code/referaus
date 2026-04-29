"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Trash2, X, Check } from "lucide-react";

interface ImageUploadProps {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  aspectHint?: string;
  className?: string;
}

export function ImageUpload({
  label,
  currentUrl,
  onUpload,
  onRemove,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  aspectHint,
  className = "",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      const acceptTypes = accept.split(",").map((t) => t.trim());
      if (!acceptTypes.includes(file.type)) {
        const friendly = acceptTypes.map((t) => t.split("/")[1]?.toUpperCase()).join(", ");
        return `Invalid file type. Accepted: ${friendly}`;
      }
      if (file.size > maxBytes) {
        return `File is too large. Maximum size is ${maxSizeMB} MB.`;
      }
      return null;
    },
    [accept, maxBytes, maxSizeMB],
  );

  const handleFile = useCallback(
    (file: File) => {
      setError("");
      setUploaded(false);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    try {
      await onUpload(selectedFile);
      setUploaded(true);
      // Keep preview visible; parent will update currentUrl
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setRemoving(true);
    setError("");
    try {
      await onRemove();
      clearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove image.");
    } finally {
      setRemoving(false);
    }
  };

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setError("");
    setUploaded(false);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <AnimatePresence mode="wait">
        {displayUrl ? (
          /* ---------- Image preview ---------- */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={label}
                className="w-full h-56 object-cover rounded-xl"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                {/* Remove / delete button */}
                {(currentUrl || preview) && onRemove && !selectedFile && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing}
                    className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors disabled:opacity-60"
                    aria-label="Remove image"
                  >
                    {removing ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                )}

                {/* Replace: open file picker */}
                {!selectedFile && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-gray-700 shadow-lg transition-colors"
                    aria-label="Replace image"
                  >
                    <Upload size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Pending upload controls */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3"
              >
                <span className="text-sm text-gray-600 truncate flex-1">
                  {selectedFile.name}{" "}
                  <span className="text-gray-400">
                    ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={uploading}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cancel selection"
                >
                  <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Upload success flash */}
            <AnimatePresence>
              {uploaded && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 mt-2 text-sm text-green-600 font-medium"
                >
                  <Check size={14} />
                  Uploaded successfully
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ---------- Drop zone ---------- */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                flex flex-col items-center justify-center gap-3 px-6 py-10
                border-2 border-dashed rounded-2xl cursor-pointer
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                }
              `}
            >
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${dragActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}
                `}
              >
                {dragActive ? <ImageIcon size={24} /> : <Upload size={24} />}
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {dragActive ? "Drop image here" : "Drag & drop an image, or click to browse"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {accept
                    .split(",")
                    .map((t) => t.trim().split("/")[1]?.toUpperCase())
                    .join(", ")}{" "}
                  &middot; Max {maxSizeMB} MB
                </p>
                {aspectHint && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Recommended aspect ratio: {aspectHint}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label={label}
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2"
          >
            <X size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
