import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', youtubeUrl: '', concept: '' });
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts', err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/posts`, form);
      setForm({ title: '', youtubeUrl: '', concept: '' });
      fetchPosts();
    } catch (err) {
      alert('Error creating post. Ensure server is running and URL is valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-5xl font-bold text-sky-400 mb-2">Kandey Uttey</h1>
        <p className="text-slate-400">Visualizing the soul of lyrics.</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-12">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input 
              className="bg-slate-950 border border-slate-700 p-3 rounded focus:outline-none focus:border-sky-500 text-white"
              placeholder="Post Title" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
            <input 
              className="bg-slate-950 border border-slate-700 p-3 rounded focus:outline-none focus:border-sky-500 text-white"
              placeholder="YouTube URL" 
              value={form.youtubeUrl} 
              onChange={e => setForm({...form, youtubeUrl: e.target.value})}
              required
            />
            <input 
              className="bg-slate-950 border border-slate-700 p-3 rounded focus:outline-none focus:border-sky-500 text-white"
              placeholder="Image Concept (e.g. 'lonely mountains')" 
              value={form.concept} 
              onChange={e => setForm({...form, concept: e.target.value})}
              required
            />
            <button 
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded transition"
              disabled={loading}
            >
              {loading ? 'Generating Art...' : 'Create Post'}
            </button>
          </form>
        </section>

        <div className="space-y-16">
          {posts.map(post => (
            <article key={post.id} className="group bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <img src={post.imageUrl} alt={post.title} className="w-full h-96 object-cover rounded-xl mb-6 shadow-2xl" />
              <h2 className="text-3xl font-bold mb-4 text-sky-300">{post.title}</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-lg text-slate-300 italic mb-6">
                {post.lyrics}
              </p>
              <div className="flex gap-4 text-2xl border-t border-slate-800 pt-4">
                {['🔥', '❤️', '😮', '👏'].map(emoji => (
                  <button key={emoji} className="hover:scale-125 transition">{emoji}</button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;