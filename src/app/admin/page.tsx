"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

const REPO_OWNER = "mathieu0905";
const REPO_NAME = "mathieu0905.github.io";
const POSTS_PATH = "src/content/posts";
const ALLOWED_USER = "mathieu0905";

interface PostFile {
  name: string;
  path: string;
  sha: string;
}

interface PostData {
  title: string;
  date: string;
  description: string;
  content: string;
}

type View = "list" | "edit" | "new";

function parsePost(raw: string): PostData {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { title: "", date: "", description: "", content: raw };
  const frontmatter = match[1];
  const content = match[2].trimStart();
  const get = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, "m"));
    return m ? m[1] : "";
  };
  return { title: get("title"), date: get("date"), description: get("description"), content };
}

function serializePost(data: PostData): string {
  return `---
title: "${data.title.replace(/"/g, '\\"')}"
date: "${data.date}"
description: "${data.description.replace(/"/g, '\\"')}"
---

${data.content}
`;
}

async function ghApi(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${res.status}`);
  }
  return res.json();
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [user, setUser] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<"button" | "input">("button");

  const [view, setView] = useState<View>("list");
  const [posts, setPosts] = useState<PostFile[]>([]);
  const [currentFile, setCurrentFile] = useState<PostFile | null>(null);
  const [post, setPost] = useState<PostData>({ title: "", date: "", description: "", content: "" });
  const [currentSha, setCurrentSha] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const openPostBySlug = useCallback(async (slug: string, t: string) => {
    setLoading(true);
    try {
      const data = await ghApi(
        `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${slug}.md`,
        t
      );
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0))
      );
      setPost(parsePost(decoded));
      setCurrentSha(data.sha);
      setCurrentFile({ name: `${slug}.md`, path: `${POSTS_PATH}/${slug}.md`, sha: data.sha });
      setView("edit");

    } catch {
      setError(`Failed to load post: ${slug}`);
    }
    setLoading(false);
  }, []);

  const handleUrlAction = useCallback(async (t: string) => {
    const url = new URL(window.location.href);
    const action = url.searchParams.get("action");
    const slug = url.searchParams.get("slug");
    window.history.replaceState({}, "", "/admin");

    if (action === "new") {
      const today = new Date().toISOString().slice(0, 10);
      setPost({ title: "", date: today, description: "", content: "" });
      setCurrentFile(null);
      setCurrentSha("");
      setView("new");
    } else if (action === "edit" && slug) {
      await openPostBySlug(slug, t);
    }
  }, [openPostBySlug]);

  const loadPosts = useCallback(async (t: string) => {
    const data = await ghApi(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}`, t);
    const mdFiles = (data as PostFile[])
      .filter((f: PostFile) => f.name.endsWith(".md"))
      .sort((a: PostFile, b: PostFile) => b.name.localeCompare(a.name));
    setPosts(mdFiles);
  }, []);

  const verifyAndLoad = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const userData = await ghApi("/user", t);
      if (userData.login !== ALLOWED_USER) {
        localStorage.removeItem("gh_admin_token");
        setError(`Access denied. Only @${ALLOWED_USER} can access this page.`);
        setLoading(false);
        setAuthLoading(false);
        return;
      }
      setUser(userData.login);
      setAvatarUrl(userData.avatar_url);
      setToken(t);
      localStorage.setItem("gh_admin_token", t);
      await loadPosts(t);
      await handleUrlAction(t);
    } catch {
      localStorage.removeItem("gh_admin_token");
    }
    setLoading(false);
    setAuthLoading(false);
  }, [loadPosts, handleUrlAction]);

  useEffect(() => {
    const saved = localStorage.getItem("gh_admin_token");
    if (saved) {
      verifyAndLoad(saved);
    } else {
      setAuthLoading(false);
    }
  }, [verifyAndLoad]);

  const handleLogin = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const userData = await ghApi("/user", tokenInput);
      if (userData.login !== ALLOWED_USER) {
        setError(`Access denied. Only @${ALLOWED_USER} can access this page.`);
        setLoading(false);
        return;
      }
      setUser(userData.login);
      setAvatarUrl(userData.avatar_url);
      setToken(tokenInput);
      localStorage.setItem("gh_admin_token", tokenInput);
      await loadPosts(tokenInput);
      await handleUrlAction(tokenInput);
    } catch {
      setError("Invalid token. Please check and try again.");
    }
    setLoading(false);
  };

  const startLogin = () => {
    window.open(
      `https://github.com/settings/tokens/new?scopes=repo&description=Blog+Admin+(${new Date().toLocaleDateString()})`,
      "_blank"
    );
    setStep("input");
  };

  const openPost = async (file: PostFile) => {
    setLoading(true);
    setError("");
    try {
      const data = await ghApi(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}`, token);
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(data.content), (c) => c.charCodeAt(0))
      );
      setPost(parsePost(decoded));
      setCurrentSha(data.sha);
      setCurrentFile(file);
      setView("edit");

    } catch (e: unknown) {
      setError(`Failed to load post: ${e instanceof Error ? e.message : String(e)}`);
    }
    setLoading(false);
  };

  const newPost = () => {
    const today = new Date().toISOString().slice(0, 10);
    setPost({ title: "", date: today, description: "", content: "" });
    setCurrentFile(null);
    setCurrentSha("");
    setView("new");
  };

  const savePost = async () => {
    if (!post.title.trim()) { setError("Title is required"); return; }

    const slug = view === "new"
      ? post.title
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
          .replace(/^-|-$/g, "") || `post-${Date.now()}`
      : currentFile!.name.replace(/\.md$/, "");

    const filename = `${slug}.md`;
    const content = serializePost(post);
    const encoded = btoa(
      Array.from(new TextEncoder().encode(content))
        .map((b) => String.fromCharCode(b))
        .join("")
    );

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, string> = {
        message: view === "new" ? `Add post: ${post.title}` : `Update post: ${post.title}`,
        content: encoded,
      };
      if (currentSha) body.sha = currentSha;

      await ghApi(
        `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_PATH}/${filename}`,
        token,
        { method: "PUT", body: JSON.stringify(body) }
      );
      setMessage("Saved! Deploy will start automatically.");
      await loadPosts(token);
      setTimeout(() => {
        setView("list");
        setMessage("");
      }, 2000);
    } catch (e: unknown) {
      setError(`Save failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    setSaving(false);
  };

  const deletePost = async () => {
    if (!currentFile) return;
    if (!confirm(`Delete "${currentFile.name}"?`)) return;

    setSaving(true);
    setError("");
    try {
      await ghApi(
        `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${currentFile.path}`,
        token,
        {
          method: "DELETE",
          body: JSON.stringify({
            message: `Delete post: ${currentFile.name}`,
            sha: currentSha,
          }),
        }
      );
      await loadPosts(token);
      setView("list");
    } catch (e: unknown) {
      setError(`Delete failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    setSaving(false);
  };

  const logout = () => {
    localStorage.removeItem("gh_admin_token");
    setToken("");
    setUser("");
    setAvatarUrl("");
    setView("list");
    setPosts([]);
    setStep("button");
    setTokenInput("");
  };

  // --- Loading ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Authenticating...
        </div>
      </div>
    );
  }

  // --- Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <GitHubIcon className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blog Admin</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Sign in with GitHub to manage your posts.
          </p>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}

          {step === "button" ? (
            <button
              onClick={startLogin}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition flex items-center justify-center gap-3"
            >
              <GitHubIcon className="w-5 h-5" />
              Sign in with GitHub
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                A new tab has opened on GitHub. Create the token there, then paste it below.
              </p>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="ghp_xxxx or github_pat_xxxx"
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleLogin}
                disabled={loading || !tokenInput.trim()}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
              <button
                onClick={() => setStep("button")}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Editor Screen ---
  if (view === "edit" || view === "new") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => { setView("list"); setError(""); setMessage(""); }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to posts
            </button>
            <div className="flex gap-2">
              {view === "edit" && (
                <button
                  onClick={deletePost}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  Delete
                </button>
              )}
              <button
                onClick={savePost}
                disabled={saving}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {saving ? "Saving..." : "Save & Deploy"}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">{message}</div>}

          {/* Meta fields */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={post.date}
                  onChange={(e) => setPost({ ...post, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  value={post.description}
                  onChange={(e) => setPost({ ...post, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Split editor + live preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: "calc(100vh - 240px)" }}>
            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Markdown
              </div>
              <textarea
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                className="flex-1 w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none"
                placeholder="Write your blog post in Markdown..."
              />
            </div>

            {/* Live Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Preview
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {post.title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h1>
                )}
                {post.description && (
                  <p className="text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">{post.description}</p>
                )}
                <div className="prose prose-blue dark:prose-invert max-w-none prose-sm">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Post List Screen ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <img src={avatarUrl} alt={user} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Admin</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={newPost}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + New Post
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading posts...</div>
        ) : (
          <div className="space-y-2">
            {posts.map((file) => (
              <button
                key={file.name}
                onClick={() => openPost(file)}
                className="w-full text-left px-5 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-between group"
              >
                <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {file.name.replace(/\.md$/, "")}
                </span>
                <span className="text-gray-400 text-sm">→</span>
              </button>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">No posts yet. Create your first one!</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
