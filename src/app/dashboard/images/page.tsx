'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  Upload, Image as ImageIcon, Trash2, Loader2, Check, AlertCircle, X,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import {
  getProviderByUserId,
  uploadProviderImage,
  deleteProviderImage,
  updateProvider,
} from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProviderRecord = Record<string, any>;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

interface DropZoneProps {
  label: string;
  hint: string;
  currentUrl: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
  accept?: string;
  multiple?: false;
}

function DropZone({ label, hint, currentUrl, uploading, onUpload, onDelete, accept = 'image/*' }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-1">{label}</h3>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>

      {currentUrl ? (
        <div className="relative group">
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-48 object-cover rounded-xl border border-gray-100"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Click or drag to upload</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

export default function ImagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<ProviderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryDragging, setGalleryDragging] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProvider = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await getProviderByUserId(user.id);
    setProvider(p);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchProvider();
  }, [authLoading, fetchProvider]);

  const handleUpload = async (
    file: File,
    type: 'logo' | 'cover' | 'gallery',
  ) => {
    if (!provider?.id) return;

    const setUploading = type === 'logo' ? setUploadingLogo : type === 'cover' ? setUploadingCover : setUploadingGallery;
    setUploading(true);

    const timestamp = Date.now();
    const path = `${provider.id}/${type}-${timestamp}-${file.name}`;
    const { url, error } = await uploadProviderImage(file, path);

    if (error || !url) {
      showToast('error', `Upload failed: ${error || 'Unknown error'}`);
      setUploading(false);
      return;
    }

    let updateData: Record<string, unknown> = {};
    if (type === 'logo') {
      updateData = { logo_url: url };
    } else if (type === 'cover') {
      updateData = { cover_image_url: url };
    } else {
      const currentGallery: string[] = provider.gallery_urls || [];
      if (currentGallery.length >= 6) {
        showToast('error', 'Maximum 6 gallery images allowed.');
        setUploading(false);
        return;
      }
      updateData = { gallery_urls: [...currentGallery, url] };
    }

    const result = await updateProvider(provider.id, updateData);
    setUploading(false);

    if (result.success) {
      if (result.data) setProvider(result.data);
      else await fetchProvider();
      showToast('success', 'Image uploaded successfully!');
    } else {
      showToast('error', 'Failed to update profile.');
    }
  };

  const handleDelete = async (type: 'logo' | 'cover', url: string) => {
    if (!provider?.id) return;

    // Extract path from URL
    const parts = url.split('/provider-images/');
    const path = parts.length > 1 ? parts[1] : '';

    if (path) {
      await deleteProviderImage(path);
    }

    const updateData = type === 'logo' ? { logo_url: null } : { cover_image_url: null };
    const result = await updateProvider(provider.id, updateData);

    if (result.success) {
      if (result.data) setProvider(result.data);
      else await fetchProvider();
      showToast('success', 'Image removed.');
    }
  };

  const handleDeleteGalleryImage = async (url: string, index: number) => {
    if (!provider?.id) return;

    const parts = url.split('/provider-images/');
    const path = parts.length > 1 ? parts[1] : '';
    if (path) await deleteProviderImage(path);

    const currentGallery: string[] = [...(provider.gallery_urls || [])];
    currentGallery.splice(index, 1);

    const result = await updateProvider(provider.id, { gallery_urls: currentGallery });
    if (result.success) {
      if (result.data) setProvider(result.data);
      else await fetchProvider();
      showToast('success', 'Gallery image removed.');
    }
  };

  const handleGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      await handleUpload(files[i], 'gallery');
    }
    e.target.value = '';
  };

  const handleGalleryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragging(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        await handleUpload(files[i], 'gallery');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <motion.div {...fadeUp(0)} className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Provider Profile Found</h2>
        <p className="text-sm text-gray-500 mb-4">Set up your profile first to manage images.</p>
        <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:underline">Set Up Profile</Link>
      </motion.div>
    );
  }

  const galleryUrls: string[] = provider.gallery_urls || [];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Oswald'" }}>
            Images
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your logo, cover photo, and gallery images.</p>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Logo and Cover */}
      <div className="grid sm:grid-cols-2 gap-6">
        <motion.div {...fadeUp(0.05)}>
          <DropZone
            label="Logo"
            hint="Square image recommended. Displayed at 80x80px."
            currentUrl={provider.logo_url}
            uploading={uploadingLogo}
            onUpload={(file) => handleUpload(file, 'logo')}
            onDelete={() => handleDelete('logo', provider.logo_url)}
          />
        </motion.div>
        <motion.div {...fadeUp(0.1)}>
          <DropZone
            label="Cover Photo"
            hint="Landscape image recommended (1200x400px)."
            currentUrl={provider.cover_image_url}
            uploading={uploadingCover}
            onUpload={(file) => handleUpload(file, 'cover')}
            onDelete={() => handleDelete('cover', provider.cover_image_url)}
          />
        </motion.div>
      </div>

      {/* Gallery */}
      <motion.section {...fadeUp(0.15)} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Gallery Images</h2>
            <p className="text-xs text-gray-500 mt-0.5">{galleryUrls.length}/6 images uploaded</p>
          </div>
          {galleryUrls.length < 6 && (
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryUrls.map((url, i) => (
            <motion.div
              key={url + i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-100"
            >
              <NextImage src={url} alt={`Gallery ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeleteGalleryImage(url, i)}
                  className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Upload zone if space available */}
          {galleryUrls.length < 6 && (
            <div
              onClick={() => galleryInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setGalleryDragging(true); }}
              onDragLeave={() => setGalleryDragging(false)}
              onDrop={handleGalleryDrop}
              className={`aspect-[4/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                galleryDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {uploadingGallery ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 font-medium">Add image</p>
                </>
              )}
            </div>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryMultiUpload}
          className="hidden"
        />
      </motion.section>
    </div>
  );
}
