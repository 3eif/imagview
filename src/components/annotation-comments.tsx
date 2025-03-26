import { useState, useEffect } from "react";
import { Comment, Annotation } from "@/types/annotation";
import { AnnotationState } from "@/types/annotation-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface AnnotationCommentsProps {
  annotation: Annotation;
  state: AnnotationState;
  isSharedView?: boolean;
}

export function AnnotationComments({
  annotation,
  state,
  isSharedView = false,
}: AnnotationCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const [minimized, setMinimized] = useState(() => {
    const saved = localStorage.getItem("commentsMinimized");

    if (!annotation.comments || annotation.comments.length === 0) {
      return true;
    }

    return saved ? saved === "true" : false;
  });

  useEffect(() => {
    localStorage.setItem("commentsMinimized", minimized.toString());
  }, [minimized]);

  useEffect(() => {
    if (!annotation.comments || annotation.comments.length === 0) {
      setMinimized(true);
    }
  }, [annotation.comments]);

  const handleAddComment = () => {
    if (!commentText.trim() || isSharedView) return;

    const newComment: Comment = {
      id: uuidv4(),
      text: commentText.trim(),
      createdAt: new Date(),
    };

    state.recordChange();

    state.setAnnotations((prevAnnotations) =>
      prevAnnotations.map((a) =>
        a.id === annotation.id
          ? {
              ...a,
              comments: [...(a.comments || []), newComment],
            }
          : a
      )
    );

    setCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (isSharedView) return;
    state.recordChange();

    state.setAnnotations((prevAnnotations) =>
      prevAnnotations.map((a) =>
        a.id === annotation.id
          ? {
              ...a,
              comments: a.comments?.filter((c) => c.id !== commentId) || [],
            }
          : a
      )
    );
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      commentText.trim() &&
      !isSharedView
    ) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const commentCount = annotation.comments?.length || 0;

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[calc(100vh-240px)]">
      <div
        className="sticky top-0 flex items-center justify-between p-2 px-3 border-b z-10 bg-zinc-800/75 backdrop-blur-sm cursor-pointer"
        onClick={toggleMinimize}
      >
        <div className="flex items-center gap-2">
          {minimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <h3 className="text-sm font-medium">
            Comments{" "}
            <span className="text-xs text-muted-foreground">
              ({commentCount})
            </span>
          </h3>
        </div>
      </div>

      {!minimized && (
        <>
          <ScrollArea className="flex-1 overflow-y-auto" type="always">
            <div className="px-2 py-2 space-y-1">
              {annotation.comments && annotation.comments.length > 0 ? (
                annotation.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 border rounded-md bg-zinc-800/30 group relative"
                  >
                    {!isSharedView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <p className="text-sm mb-2 break-words pr-8">
                      {comment.text}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-10 text-center text-zinc-500">
                  <p className="text-sm text-zinc-200">No comments yet</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {!isSharedView && (
            <div className="p-3 border-t border-zinc-400/30">
              <div className="relative">
                <Textarea
                  placeholder="Add a comment..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-200 min-h-10 pr-10 resize-none"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 text-right">
                Press Enter to send
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
