import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: '', ytUrl: '', imageConcept: '' });
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:5000/api/posts');
    setPosts(res.data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/posts', formData);
      setFormData({ title: '', ytUrl: '', imageConcept: '' });
      fetchPosts();
    } catch (err) { alert('Generation failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 italic">LyricFlow</h1>
          <p className="text-gray-500 tracking-[0.3em] text-xs mt-2">AUTONOMOUS LYRIC-IMAGE ARCHITECT</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 mb-12">
          <input className="bg-transparent border-b border-white/20 p-2 focus:outline-none focus:border-pink-500" placeholder="Post Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <input className="bg-transparent border-b border-white/20 p-2 focus:outline-none focus:border-pink-500" placeholder="YouTube URL" value={formData.ytUrl} onChange={e => setFormData({...formData, ytUrl: e.target.value})} required />
          <input className="bg-transparent border-b border-white/20 p-2 focus:outline-none focus:border-pink-500" placeholder="Image Concept (e.g. Cyberpunk)" value={formData.imageConcept} onChange={e => setFormData({...formData, imageConcept: e.target.value})} required />
          <button className="bg-white text-black font-bold rounded-lg hover:bg-pink-500 hover:text-white transition-all">{loading ? 'GENERATING...' : 'GENERATE BLOG'}</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all">
              <img src={post.imageUrl} className="w-full h-64 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <button onClick={() => {navigator.clipboard.writeText(post.lyrics); alert('Lyrics Copied!')}} className="text-xs text-pink-500 font-bold uppercase tracking-widest">Copy Lyrics</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;