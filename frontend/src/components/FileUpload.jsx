import { useState, useRef } from 'react';

export default function FileUpload({ onUploadSuccess, isUploading, setIsUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const uploadFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    setError('');
    setFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUploadSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) uploadFile(e.target.files[0]);
  };

  return (
    <div className="p-3">
      <div
        className={`relative rounded-lg p-4 text-center cursor-pointer border border-dashed transition-all duration-200 ${
          dragActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
            : 'border-[var(--color-border-hover)] bg-[var(--color-bg-primary)] hover:border-[var(--color-text-muted)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[var(--color-text-muted)]">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg">📄</span>
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              Drop CSV or click to browse
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Up to 50MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-[var(--color-danger)] mt-1.5 text-center">{error}</p>
      )}

      {fileName && !isUploading && !error && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-success)]">
          <span>✓</span>
          <span className="truncate">{fileName} uploaded</span>
        </div>
      )}
    </div>
  );
}
