"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encryptWithPassword, encryptWithRandomKey, generateKeyFilename } from "@/lib/crypto";

interface FileUploaderProps {
  onFileSelected: (file: File, encryptedData: ArrayBuffer, iv: Uint8Array | null, key: string, usePassword: boolean) => void;
  allowPasswordEncryption?: boolean;
}

export function FileUploader({ onFileSelected, allowPasswordEncryption = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    
    if (usePassword && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (usePassword && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsEncrypting(true);
    setProgress(10);

    try {
      setProgress(30);

      let encryptedData: ArrayBuffer;
      let exportedKey: string;
      let iv: Uint8Array | null = null;

      if (usePassword && password) {
        // Password-based encryption
        console.log("Using password-based encryption");
        const result = await encryptWithPassword(file, password);
        encryptedData = result.encryptedData;
        exportedKey = password; // User already knows this
        iv = result.iv;
      } else {
        // Random key encryption (legacy mode)
        console.log("Using random key encryption");
        const result = await encryptWithRandomKey(file);
        encryptedData = result.encryptedData;
        exportedKey = result.exportedKey;
        iv = result.iv;
      }

      setProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setProgress(100);
      setSelectedFile(file);
      onFileSelected(file, encryptedData, iv, exportedKey, usePassword);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`Encryption failed: ${errorMsg}`);
      console.error("Encryption error:", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const MAX_UPLOAD_SIZE = 22.5 * 1024 * 1024; // 22.5MB for Vercel Pro tier (5x free tier)
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_UPLOAD_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Vercel free tier limit is 4.5MB. Try compressing your file or upgrade to Pro.`);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && !isEncrypting) {
      const file = files[0];
      if (file.size > MAX_UPLOAD_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Vercel free tier limit is 4.5MB. Try compressing your file or upgrade to Pro.`);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, [isEncrypting]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Password option toggle */}
      {allowPasswordEncryption && (
        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <div className="flex-1">
              <Label className="font-semibold text-indigo-900">Encryption Method</Label>
              <p className="text-sm text-indigo-700">
                {usePassword 
                  ? "Password-based: anyone with the password can decrypt" 
                  : "Random key: you must save the generated key file"}
              </p>
            </div>
            <Button
              variant={usePassword ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePassword(!usePassword)}
              type="button"
            >
              {usePassword ? "Use Random Key" : "Use Password"}
            </Button>
          </div>
          
          {usePassword && (
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="password">Encryption Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password (or use PRIOR_GENESIS_SEED)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">
            Drop your file here, or click to browse
          </p>
          <p className="text-sm text-slate-500 mb-1">
            Any file type. Encrypted in browser.
          </p>
          <p className="text-xs text-amber-600 font-medium">
            ⚠️ Vercel free tier: Max 4.5MB. Pro tier: Up to 100MB.
          </p>
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            type="button"
          >
            Select File
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <File className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  {usePassword && " • Password-protected"}
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {isEncrypting ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock className="w-4 h-4" />
                <span>Encrypting...</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <Button
              onClick={() => processFile(selectedFile)}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Encrypt & Continue
            </Button>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
