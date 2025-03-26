import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Annotation } from "@/types/annotation";

interface ShareButtonProps {
  imageId: string | null;
  isDisabled?: boolean;
  className?: string;
  currentFile?: File | null;
  annotations?: Annotation[];
  isSharedView?: boolean;
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Try the modern clipboard API first
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback to the older execCommand method
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      textArea.remove();
      return true;
    } catch (err) {
      console.error("Failed to copy text:", err);
      textArea.remove();
      return false;
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
};

export function ShareButton({
  imageId,
  isDisabled = false,
  className = "",
  currentFile = null,
  annotations = [],
  isSharedView = false,
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShareClick = async () => {
    if (isSharedView) {
      const success = await copyToClipboard(window.location.href);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    if (!imageId && !currentFile) return;

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();

      if (currentFile) {
        formData.append("file", currentFile);
      } else if (imageId) {
        formData.append("imageId", imageId);
      }

      if (annotations.length > 0) {
        formData.append("annotations", JSON.stringify(annotations));
      }

      const response = await fetch("/api/view", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      setShareUrl(data.shareUrl);
      setIsOpen(true);
    } catch (err) {
      console.error("Share error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create share link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyClick = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleShareClick}
        disabled={
          isDisabled || isLoading || (!isSharedView && !imageId && !currentFile)
        }
        className={`bg-zinc-900 border border-zinc-800 hover:bg-zinc-950 text-white ${className}`}
        title={isSharedView ? "Copy URL" : "Share Image"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : copied && isSharedView ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900/80 backdrop-blur-md border-zinc-800">
          <DialogHeader>
            <DialogTitle>Share Link</DialogTitle>
            <DialogDescription>
              Read-only mode. Changes won&apos;t be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 bg-zinc-800/50 border-zinc-700 text-white"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyClick}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </>
  );
}
