import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import PairingDetails from './pages/PairingDetails';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import AdminPairingForm from './pages/AdminPairingForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-stone-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogArticle />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/settings" element={<Settings />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/pairing/:id" element={<PairingDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/pairing/new" element={<AdminPairingForm />} />
              <Route path="/admin/pairing/:id" element={<AdminPairingForm />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;