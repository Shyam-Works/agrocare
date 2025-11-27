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

  const handleCreatePost = async () => {
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

  const handleAddComment = async () => {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setComments(comments.map(c => c._id === commentId ? data.comment : c));
      } else {
        alert("Failed to like comment: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      alert("Failed to like comment. Please try again.");
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
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
        style={{ backgroundColor: "#283618" }}>
        {getUserInitials(author)}
      </div>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"
            style={{ borderTopColor: "#283618" }}></div>
          <p className="mt-4" style={{ color: "#283618" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b sticky top-0 z-10 bg-white" style={{ borderColor: "#283618" }}>
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
              style={{ color: "#283618" }}
            >
              <ArrowLeft size={20} />
              Back to Community
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border overflow-hidden mb-6" style={{ borderColor: "#283618" }}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserAvatar author={selectedPost.author} size="md" />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "#283618" }}>{selectedPost.author}</p>
                  <p className="text-sm text-gray-500">{formatDate(selectedPost.createdAt)}</p>
                </div>
                <span className="text-sm font-medium px-4 py-1.5 rounded-full border text-white"
                  style={{ backgroundColor: "#283618", borderColor: "#283618" }}>
                  {selectedPost.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4" style={{ color: "#283618" }}>{selectedPost.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedPost.content}
              </p>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-sm px-3 py-1 rounded-full border"
                      style={{ color: "#283618", borderColor: "#283618" }}>
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6 pt-6 border-t" style={{ borderColor: "#283618" }}>
                <button
                  onClick={() => handleLikePost(selectedPost._id)}
                  className={`flex items-center gap-2 transition-all hover:scale-105 ${
                    selectedPost.likedBy?.includes(session?.user?.email) ? "text-red-500" : "hover:text-red-500"
                  }`}
                  style={{ color: selectedPost.likedBy?.includes(session?.user?.email) ? undefined : "#283618" }}
                >
                  <Heart size={22} fill={selectedPost.likedBy?.includes(session?.user?.email) ? "currentColor" : "none"} />
                  <span className="font-semibold">{selectedPost.likes || 0}</span>
                </button>
                <div className="flex items-center gap-2" style={{ color: "#283618" }}>
                  <MessageSquare size={22} />
                  <span className="font-semibold">{selectedPost.commentCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {session?.user ? (
            <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: "#283618" }}>
              <div className="flex gap-3">
                <UserAvatar author={`${session.user.first_name} ${session.user.last_name}`} size="sm" />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: "#283618", color: "#283618" }}
                    rows="3"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="mt-3 text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#283618" }}
                  >
                    <Send size={18} />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-6 mb-6 text-center"
              style={{ borderColor: "#283618", backgroundColor: "rgba(40, 54, 24, 0.05)" }}>
              <p style={{ color: "#283618" }}>Please sign in to add comments</p>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#283618" }}>
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h2>
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-xl border p-6" style={{ borderColor: "#283618" }}>
                <div className="flex items-start gap-3">
                  <UserAvatar author={comment.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-sm" style={{ color: "#283618" }}>{comment.author}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
                    <button 
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1.5 text-sm transition-all hover:scale-105 ${
                        comment.likedBy?.includes(session?.user?.email) ? "text-red-500" : "hover:text-red-500"
                      }`}
                      style={{ color: comment.likedBy?.includes(session?.user?.email) ? undefined : "#283618" }}
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner with Background Image */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "#283618" }}>
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=400&fit=crop" 
            alt="Farm background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: "#283618" }}>
                🌾
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: "#283618" }}>Agrocare Community</h1>
                <p className="text-gray-600 text-lg">Share knowledge, ask questions, and connect with farmers</p>
                {session?.user && (
                  <p className="text-sm text-gray-500 mt-2">
                    Welcome, {session.user.first_name} {session.user.last_name}! 👋
                  </p>
                )}
              </div>
            </div>
            {session?.user && (
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: "#283618" }}
              >
                {showCreatePost ? <><X size={20} />Cancel</> : <><Plus size={20} />New Post</>}
              </button>
            )}
          </div>
          
          {/* Community Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border shadow-sm"
              style={{ borderColor: "#283618" }}>
              <MessageSquare size={20} style={{ color: "#283618" }} />
              <div>
                <p className="text-xs text-gray-500">Total Posts</p>
                <p className="font-bold" style={{ color: "#283618" }}>{posts.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border shadow-sm"
              style={{ borderColor: "#283618" }}>
              <User size={20} style={{ color: "#283618" }} />
              <div>
                <p className="text-xs text-gray-500">Active Members</p>
                <p className="font-bold" style={{ color: "#283618" }}>
                  {new Set(posts.map(p => p.authorEmail)).size}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border shadow-sm"
              style={{ borderColor: "#283618" }}>
              <TrendingUp size={20} style={{ color: "#283618" }} />
              <div>
                <p className="text-xs text-gray-500">This Week</p>
                <p className="font-bold" style={{ color: "#283618" }}>
                  {posts.filter(p => {
                    const postDate = new Date(p.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return postDate > weekAgo;
                  }).length} new
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">

          {showCreatePost && session?.user && (
            <div className="bg-white rounded-xl border p-6 mb-6 shadow-lg" style={{ borderColor: "#283618" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: "#283618" }}>
                  ✍️
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "#283618" }}>Create a Post</h3>
              </div>
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 placeholder-gray-400 focus:outline-none focus:ring-2"
                style={{ borderColor: "#283618", color: "#283618" }}
              />
              <textarea
                placeholder="Share your experience, ask a question, or start a discussion..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: "#283618", color: "#283618" }}
                rows="5"
              />
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 appearance-none"
                    style={{ borderColor: "#283618", color: "#283618" }}
                  >
                    {categories.filter(c => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    style={{ color: "#283618" }}>
                    📁
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full border rounded-lg p-3 pl-10 placeholder-gray-400 focus:outline-none focus:ring-2"
                    style={{ borderColor: "#283618", color: "#283618" }}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    🏷️
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreatePost}
                className="text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                style={{ backgroundColor: "#283618" }}
              >
                Publish Post 📤
              </button>
            </div>
          )}

          {!session?.user && (
            <div className="border rounded-xl p-8 mb-6 text-center shadow-md relative overflow-hidden"
              style={{ borderColor: "#283618", backgroundColor: "rgba(40, 54, 24, 0.03)" }}>
              <div className="absolute top-0 right-0 text-6xl opacity-10">🌱</div>
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4"
                  style={{ backgroundColor: "#283618" }}>
                  🔐
                </div>
                <p className="text-lg font-semibold mb-2" style={{ color: "#283618" }}>Join the Conversation</p>
                <p className="text-gray-600">Sign in to create posts and engage with the community</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border p-4 shadow-md" style={{ borderColor: "#283618" }}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" 
                style={{ color: "#283618", backgroundColor: "rgba(40, 54, 24, 0.05)" }}>
                <Filter size={18} />
                <span className="font-medium text-sm">Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${filter === cat ? "text-white shadow-md" : "border"}`}
                    style={filter === cat ? { backgroundColor: "#283618" } : { borderColor: "#283618", color: "#283618" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${sortBy === "recent" ? "text-white shadow-md" : "border"}`}
                  style={sortBy === "recent" ? { backgroundColor: "#283618" } : { borderColor: "#283618", color: "#283618" }}
                >
                  <Clock size={16} />
                  Recent
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${sortBy === "popular" ? "text-white shadow-md" : "border"}`}
                  style={sortBy === "popular" ? { backgroundColor: "#283618" } : { borderColor: "#283618", color: "#283618" }}
                >
                  <TrendingUp size={16} />
                  Popular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"
              style={{ borderTopColor: "#283618" }}></div>
            <p className="mt-4" style={{ color: "#283618" }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border shadow-lg relative overflow-hidden" style={{ borderColor: "#283618" }}>
            <div className="absolute inset-0 opacity-5">
              <img 
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=800&fit=crop" 
                alt="Farm background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg"
                style={{ backgroundColor: "#283618" }}>
                📝
              </div>
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium">No posts yet. Be the first to share!</p>
              <p className="text-gray-500 text-sm mt-2">Start a conversation and help the community grow 🌱</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group"
                style={{ borderColor: "#283618" }}
                onClick={() => handleViewPost(post)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8">
                  <div className="text-8xl" style={{ color: "#283618" }}>🌾</div>
                </div>
                <div className="flex items-start gap-4 relative z-10">
                  <UserAvatar author={post.author} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold" style={{ color: "#283618" }}>{post.author}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">⏰ {formatDate(post.createdAt)}</span>
                      <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full text-white shadow-sm"
                        style={{ backgroundColor: "#283618" }}>
                        📁 {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:underline" style={{ color: "#283618" }}>{post.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-full border shadow-sm"
                            style={{ color: "#283618", borderColor: "#283618" }}>
                            🏷️ {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs px-2.5 py-1 rounded-full text-gray-500">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikePost(post._id);
                        }}
                        className={`flex items-center gap-2 transition-all hover:scale-110 ${
                          post.likedBy?.includes(session?.user?.email) ? "text-red-500" : "hover:text-red-500"
                        }`}
                        style={{ color: post.likedBy?.includes(session?.user?.email) ? undefined : "#283618" }}
                      >
                        <Heart size={20} fill={post.likedBy?.includes(session?.user?.email) ? "currentColor" : "none"} />
                        <span className="font-semibold text-sm">{post.likes || 0}</span>
                      </button>
                      <div className="flex items-center gap-2" style={{ color: "#283618" }}>
                        <MessageSquare size={20} />
                        <span className="font-semibold text-sm">{post.commentCount || 0} comments</span>
                      </div>
                      <div className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to read more →
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