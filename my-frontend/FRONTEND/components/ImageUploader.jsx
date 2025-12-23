import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import './ImageUploader.css';

const ImageUploader = ({ onUploadSuccess }) => {
    const toast = useToast();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleFileChange = (file) => {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('❌ Vui lòng chọn file ảnh!');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('❌ File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('❌ Vui lòng chọn một file ảnh.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);

        try {
            console.log('🔄 Starting upload...', {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type
            });

            const response = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
                // Không set Content-Type header, browser sẽ tự động set với boundary cho FormData
            });

            console.log('📥 Upload response status:', response.status, response.statusText);

            const data = await response.json();
            console.log('📥 Upload response data:', data);

            if (!response.ok) {
                throw new Error(data.error || `Upload thất bại (${response.status})`);
            }

            if (data.url) {
                console.log('✅ Upload successful, URL:', data.url);
                if (onUploadSuccess) {
                    onUploadSuccess(data.url);
                }
                toast.success('✅ Upload ảnh thành công!');
                // Reset after successful upload
                setSelectedFile(null);
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error('Không nhận được URL ảnh từ server');
            }
        } catch (err) {
            console.error("❌ Upload failed:", err);
            console.error("Error details:", {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            toast.error(`❌ ${err.message || 'Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePreview = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="image-uploader-container">
            <div
                ref={dropZoneRef}
                className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />

                {!previewUrl ? (
                    <>
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <p className="upload-text">
                            <span className="upload-text-main">Kéo thả ảnh vào đây</span>
                            <span className="upload-text-sub">hoặc click để chọn file</span>
                        </p>
                        <p className="upload-hint">JPG, PNG hoặc GIF (tối đa 5MB)</p>
                    </>
                ) : (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                        <button
                            className="remove-preview-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePreview();
                            }}
                            title="Xóa ảnh"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {previewUrl && (
                <div className="upload-actions">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`upload-btn ${uploading ? 'uploading' : ''}`}
                    >
                        {uploading ? (
                            <>
                                <span className="upload-spinner"></span>
                                Đang tải lên...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                Tải ảnh lên
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
