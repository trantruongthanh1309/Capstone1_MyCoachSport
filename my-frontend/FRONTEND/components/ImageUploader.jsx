import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Vui lòng chọn một file ảnh.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const imageUrl = response.data.url;
                setUploadedImageUrl(imageUrl);
                if (onUploadSuccess) {
                    onUploadSuccess(imageUrl);
                }
                alert("Upload thành công!");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-md bg-white max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Upload Ảnh</h3>

            <div className="mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            {previewUrl && (
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img src={previewUrl} alt="Preview" className="max-h-48 rounded border" />
                </div>
            )}

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={`w-full py-2 px-4 rounded text-white font-bold transition-colors
                    ${uploading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
                {uploading ? 'Đang upload...' : 'Upload Ảnh'}
            </button>

            {uploadedImageUrl && (
                <div className="mt-4">
                    <p className="text-sm text-green-600 font-semibold mb-2">Ảnh đã được lưu tại server:</p>
                    <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm break-all">
                        {uploadedImageUrl}
                    </a>
                    <img src={uploadedImageUrl} alt="Uploaded" className="mt-2 max-h-48 rounded border border-green-500" />
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
