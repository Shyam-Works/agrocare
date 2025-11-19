import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Filter, 
  TrendingUp,
  Clock,
  ArrowLeft,
  Tag,
  Plus,
  X,
  User
} from "lucide-react";

export default function Community() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
    tags: ""
  });

  const [newComment, setNewComment] = useState("");

  const categories = ["All", "Disease", "Pest Control", "Soil Health", "Irrigation", "General", "Technology", "Tips"];

  useEffect(() => {
    fetchPosts();
  }, [filter, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const categoryParam = filter !== "All" ? `&category=${filter}` : "";
      const response = await fetch(`/api/posts?sortBy=${sortBy}${categoryParam}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert("Please sign in to create a post");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Title and content are required");
      return;
    }

    try {
      const postData = {
        author: `${session.user.first_name} ${session.user.last_name}`,
        authorEmail: session.user.email,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewPost({ title: "", content: "", category: "General", tags: "" });
        setShowCreatePost(false);
      } else {
        alert("Error creating post: " + data.error);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    }
  };

  const handleLikePost = async (postId) => {
    if (!session?.user) {
      alert("Please sign in to like posts");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email })
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(p => p._id === postId ? data.post : p));
        if (selectedPost?._id === postId) {
          setSelectedPost(data.post);
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleViewPost = async (post) => {
    setSelectedPost(post);
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const commentData = {
        author: `${session.user.first_name} ${session.user.last_name}`,
        authorEmail: session.user.email,
        content: newComment
      };

      const response = await fetch(`/api/posts/${selectedPost._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });

      const data = await response.json();
      
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment("");
        setPosts(posts.map(p => 
          p._id === selectedPost._id 
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        ));
        setSelectedPost({ ...selectedPost, commentCount: selectedPost.commentCount + 1 });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!session?.user) {
      alert("Please sign in to like comments");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session.user.email })
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.map(c => c._id === commentId ? data.comment : c));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const UserAvatar = ({ author, size = "md" }) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-12 h-12 text-lg",
      lg: "w-16 h-16 text-xl"
    };

    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}>
        {getUserInitials(author)}
      </div>
    );
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Post Detail View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Community
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Post Detail Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserAvatar author={selectedPost.author} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{selectedPost.author}</p>
                  <p className="text-sm text-gray-500">{formatDate(selectedPost.createdAt)}</p>
                </div>
                <span className="bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full border border-green-200">
                  {selectedPost.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedPost.content}
              </p>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleLikePost(selectedPost._id)}
                  className={`flex items-center gap-2 transition-all hover:scale-105 ${
                    selectedPost.likedBy?.includes(session?.user?.email)
                      ? "text-red-500"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart size={22} fill={selectedPost.likedBy?.includes(session?.user?.email) ? "currentColor" : "none"} />
                  <span className="font-semibold">{selectedPost.likes || 0}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare size={22} />
                  <span className="font-semibold">{selectedPost.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Comment */}
          {session?.user ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex gap-3">
                <UserAvatar author={`${session.user.first_name} ${session.user.last_name}`} size="sm" />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Send size={18} />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
              <p className="text-blue-700">Please sign in to add comments</p>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h2>
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-3">
                  <UserAvatar author={comment.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900 text-sm">{comment.author}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
                    <button 
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1.5 text-sm transition-all hover:scale-105 ${
                        comment.likedBy?.includes(session?.user?.email)
                          ? "text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart size={16} fill={comment.likedBy?.includes(session?.user?.email) ? "currentColor" : "none"} />
                      <span className="font-medium">{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Community Feed View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Agrocare Community</h1>
              <p className="text-gray-600 text-lg">Share knowledge, ask questions, and connect with farmers</p>
              {session?.user && (
                <p className="text-sm text-gray-500 mt-2">
                  Welcome, {session.user.first_name} {session.user.last_name}!
                </p>
              )}
            </div>
            {session?.user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all hover:shadow-md flex items-center gap-2"
              >
                {showCreatePost ? (
                  <>
                    <X size={20} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    New Post
                  </>
                )}
              </button>
            )}
          </div>

          {/* Create Post Form */}
          {showCreatePost && session?.user && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a Post</h3>
              <form onSubmit={handleCreatePost}>
                <input
                  type="text"
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Share your experience, ask a question, or start a discussion..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="5"
                  required
                />
                <div className="flex gap-3 mb-4">
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.filter(c => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Publish Post
                </button>
              </form>
            </div>
          )}

          {!session?.user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
              <p className="text-blue-700 mb-2">Sign in to create posts and engage with the community</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter size={18} />
                <span className="font-medium text-sm">Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filter === cat
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortBy === "recent"
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Clock size={16} />
                  Recent
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortBy === "popular"
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <TrendingUp size={16} />
                  Popular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewPost(post)}
              >
                <div className="flex items-start gap-4">
                  <UserAvatar author={post.author} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{post.author}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                      <span className="ml-auto bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post._id);
                        }}
                        className={`flex items-center gap-2 transition-all hover:scale-105 ${
                          post.likedBy?.includes(session?.user?.email)
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Heart size={20} fill={post.likedBy?.includes(session?.user?.email) ? "currentColor" : "none"} />
                        <span className="font-semibold text-sm">{post.likes || 0}</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MessageSquare size={20} />
                        <span className="font-semibold text-sm">{post.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}