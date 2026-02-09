"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploaderProps {
  onFileSelected: (file: File, encryptedData: ArrayBuffer, iv: Uint8Array, key: string) => void;
}

export function FileUploader({ onFileSelected }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setError(null);
    setIsEncrypting(true);
    setProgress(10);

    try {
      // Dynamically import crypto utils (client-side only)
      console.log("Starting encryption...");
      const { generateEncryptionKey, encryptFile } = await import("@/lib/crypto");
      console.log("Crypto module loaded");

      setProgress(30);
      console.log("Generating key...");
      const { key, exportedKey } = await generateEncryptionKey();
      console.log("Key generated successfully");

      setProgress(50);
      console.log("Encrypting file...", file.name, file.size);
      const { encryptedData, iv } = await encryptFile(file, key);
      console.log("File encrypted successfully", encryptedData.byteLength);

      setProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 500)); // UX delay

      setProgress(100);
      setSelectedFile(file);
      onFileSelected(file, encryptedData, iv, exportedKey);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`Encryption failed: ${errorMsg}`);
      console.error("Encryption error:", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [onFileSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [onFileSelected]);

  const clearFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? "border-purple-600 bg-purple-600/10"
              : "border-slate-600 bg-slate-100 hover:border-slate-500"
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-200 flex items-center justify-center">
            <Upload className="w-8 h-8 text-slate-600" />
          </div>

          <p className="text-slate-900 font-medium mb-2">
            {isDragging ? "Drop your file here" : "Drag & drop your file here"}
          </p>
          <p className="text-slate-500 text-sm mb-4">or</p>

          <label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isEncrypting}
            />
            <Button
              type="button"
              variant="outline"
              disabled={isEncrypting}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              {isEncrypting ? "Encrypting..." : "Select File"}
            </Button>
          </label>

          <p className="text-slate-500 text-xs mt-4">
            AES-256 encryption happens in your browser. We never see your data.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Encrypted
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isEncrypting && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Encrypting...</span>
            <span className="text-purple-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
