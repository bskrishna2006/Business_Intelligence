import { useState, useRef } from 'react';
import { UploadSimple, CheckCircle, Warning } from '@phosphor-icons/react';

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
        className={`relative rounded-xl p-5 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-sm'
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
          <div className="flex flex-col items-center gap-2.5 py-2">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
            <p className="text-[11px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
              Uploading...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors">
              <UploadSimple size={20} />
            </div>
            <p className="text-[11px] font-bold text-[var(--color-text-primary)] leading-tight">
              Drop CSV or browse files
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] font-semibold">Max 50MB · CSV only</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-1.5 justify-center text-[10px] text-[var(--color-danger)] font-semibold leading-normal">
          <Warning size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {fileName && !isUploading && !error && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-success)] font-semibold animate-fade-in">
          <CheckCircle size={12} weight="fill" />
          <span className="truncate max-w-[150px]">{fileName} loaded</span>
        </div>
      )}
    </div>
  );
}
