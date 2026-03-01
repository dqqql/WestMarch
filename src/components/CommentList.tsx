"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";
import { Comment as CommentType, CommentsResponse } from "@/services/postsApi";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

interface CommentListProps {
  postId: string;
}

interface CommentProps {
  comment: CommentType;
}

const Comment = ({ comment }: CommentProps) => {
  const authorName = comment.author.nickname || comment.author.username;
  
  return (
    <div className="flex gap-3 py-4 border-b border-zinc-800">
      <div className="flex-shrink-0">
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-zinc-200">{authorName}</span>
          <span className="text-xs text-zinc-500">
            {new Date(comment.createdAt).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-zinc-300 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export const CommentList = ({ postId }: CommentListProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadComments = async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&pageSize=5`);
      if (response.ok) {
        const data: CommentsResponse = await response.json();
        if (append) {
          setComments((prev) => [...prev, ...data.comments]);
        } else {
          setComments(data.comments);
        }
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setHasMore(data.page < data.totalPages);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1, false);
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent,
          authorId: user.id,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentContent("");
      } else {
        const error = await response.json();
        alert(error.error || "发布评论失败");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("发布评论失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      loadComments(currentPage + 1, true);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-6 text-zinc-100">评论</h2>

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="写下你的评论..."
            className="mb-3 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!commentContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发布中...
                </>
              ) : (
                "发布评论"
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        {isLoading && comments.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" />
            <p className="mt-2 text-zinc-500">加载评论中...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            暂无评论，来抢沙发吧！
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
            {hasMore && (
              <div className="p-4 text-center border-t border-zinc-800">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    "加载更多"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
