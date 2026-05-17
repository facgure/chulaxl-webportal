import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TweaksApp from './components/tweaks/TweaksApp';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import LMS from './pages/LMS';
import './styles.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <TweaksApp />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/course/:slug" element={<Layout><CourseDetail /></Layout>} />
          <Route path="/lms/:slug" element={<LMS />} />
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
