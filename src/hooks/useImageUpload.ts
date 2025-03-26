import { useState, useRef } from "react";

export function useImageUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedImage(null);
    setCurrentFile(null);

    if (file.size > 1 * 1024 * 1024 * 1024) {
      setError("File is too large. Maximum size is 1GB.");
      return;
    }

    try {
      // Display the image using FileReader without API call
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string);
          setCurrentFile(file);
        }
      };
      reader.onerror = () => {
        setError("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error processing image. Please try again."
      );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    uploadedImage,
    error,
    fileInputRef,
    handleImageUpload,
    triggerFileInput,
    currentFile,
  };
}
