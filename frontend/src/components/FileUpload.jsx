import { useState, useRef } from 'react';

export default function FileUpload({
  onUploadSuccess,
  isUploading,
  setIsUploading,
  authFetch,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const doFetch = authFetch || fetch;

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
      const res = await doFetch('/api/upload', { method: 'POST', body: formData });
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
    <div className="p-4">
      <div
        className={`relative rounded-[12px] p-6 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-md'
            : 'border-[var(--color-border-soft)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-elevated)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">
              Uploading...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Drop CSV here or click to browse
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Up to 50MB · CSV format only</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-3 text-center font-medium">
          {error}
        </p>
      )}

      {fileName && !isUploading && !error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-success)] font-medium animate-fade-in">
          <span>✓</span>
          <span className="truncate">{fileName} ready</span>
        </div>
      )}
    </div>
  );
}
