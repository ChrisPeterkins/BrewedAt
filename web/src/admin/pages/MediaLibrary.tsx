import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@shared/api-client';
import { useToast } from '../context/ToastContext';
import './MediaLibrary.css';

interface UploadedImage {
  imageUrl: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: string;
}

export default function MediaLibrary() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Load existing images from uploads/general directory
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    // For now, we'll just show uploaded images in this session
    // In the future, you could add an API endpoint to list files
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', `${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', `${file.name} exceeds 5MB limit`);
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const response = await apiClient.uploadImage(file);
      if (response.success && response.data) {
        // Add the full domain URL for easier copying
        const fullUrl = `https://chrispeterkins.com${response.data.imageUrl}`;
        const imageData = {
          ...response.data,
          fullUrl
        };
        setImages(prev => [imageData as any, ...prev]);
        toast.success('Upload successful', `${file.name} uploaded`);
      } else {
        toast.error('Upload failed', `${file.name}: ${response.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload error', `${file.name}: ${error.message || 'Network error'}`);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = `https://chrispeterkins.com${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="media-library">
      <div className="media-library-header">
        <h1>Media Library</h1>
        <p>Upload images for use across your site</p>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div className="upload-zone-content">
          {uploading ? (
            <>
              <div className="upload-spinner"></div>
              <p>Uploading...</p>
            </>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="upload-zone-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-zone-hint">PNG, JPG, GIF up to 5MB</p>
            </>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="images-section">
          <h2>Uploaded Images ({images.length})</h2>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={index} className="image-card">
                <div className="image-preview">
                  <img
                    src={`https://chrispeterkins.com${image.imageUrl}`}
                    alt={image.originalName}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                      e.currentTarget.alt = 'Failed to load';
                    }}
                  />
                </div>
                <div className="image-info">
                  <p className="image-filename" title={image.originalName}>
                    {image.originalName}
                  </p>
                  <p className="image-details">
                    {formatFileSize(image.size)} • {new Date(image.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="image-url">
                    <input
                      type="text"
                      value={`https://chrispeterkins.com${image.imageUrl}`}
                      readOnly
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      className={`copy-button ${copiedUrl === image.imageUrl ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(image.imageUrl)}
                      title="Copy URL"
                    >
                      {copiedUrl === image.imageUrl ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="empty-state">
          <p>No images uploaded yet. Upload your first image above!</p>
        </div>
      )}
    </div>
  );
}
