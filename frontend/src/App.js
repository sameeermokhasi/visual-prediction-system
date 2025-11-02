// In frontend/src/App.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  FiArrowRight, FiCheckCircle, FiXCircle, FiLoader, FiPlayCircle,
  FiTarget, FiZap, FiClock, FiActivity, FiCpu, FiDatabase, FiBarChart2, FiSettings,
  FiAlertTriangle, FiTrendingUp,
  FiCamera, FiCalendar, FiChevronDown, FiHelpCircle
} from 'react-icons/fi';
import { MdOutlinePrecisionManufacturing } from "react-icons/md";

// Import the new pages
import LiveMonitoringPage from './LiveMonitoringPage'; 
import HelpPage from './HelpPage'; 
import LoginPage from './LoginPage';
import SignupPage from './SignupPage'; 

// --- Configuration ---
const API_URL = 'http://localhost:8000';

// ====================================================================
// --- STYLES COMPONENT (for Animations) ---
// ====================================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
    html { scroll-behavior: smooth; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
  `}</style>
);

// ====================================================================
// --- HELPER COMPONENTS (All defined at top level) ---
// ====================================================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, value, label, change, isLarge = false }) => (
  <Card className="flex flex-col items-center text-center p-5">
    {isLarge ? (
      <>
        <div className="text-6xl font-extrabold text-blue-700 leading-none">{value}</div>
        <div className="text-xl text-gray-600 mb-2">{label}</div>
      </>
    ) : (
      <>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-full mb-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <div className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
          {value}
          {change && (
            <span className={`ml-2 text-sm font-semibold ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          )}
        </div>
        <div className="text-md text-gray-500">{label}</div>
      </>
    )}
  </Card>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card>
    <div className="p-3 bg-blue-50 rounded-full mb-4 inline-flex">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </Card>
);

const Modal = ({ show, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!show) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} relative`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <FiXCircle className="h-6 w-6" />
        </button>
        <div className="p-6 pt-12">
          {children}
        </div>
      </div>
    </div>
  );
};

const InspectionDemoAnimation = () => (
  <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-4">
    <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .disc {
          animation: moveDisc 8s ease-in-out infinite;
          stroke: #9ca3af;
          stroke-width: 1;
        }
        .defect {
          fill: #ef4444;
          animation: showDefect 8s infinite;
          opacity: 0;
        }
        .scanline {
          stroke: #3b82f6;
          stroke-width: 0.5;
          animation: scan 8s infinite;
          opacity: 0;
        }
        .status-pass {
          animation: showStatus 8s infinite;
          opacity: 0;
        }
        .status-fail {
          animation: showStatus 8s infinite;
          opacity: 0;
          animation-delay: 4s;
        }
        
        @keyframes moveDisc {
          0%, 20% { transform: translateX(-50px); opacity: 0; }
          30% { transform: translateX(75px); opacity: 1; }
          70% { transform: translateX(75px); opacity: 1; }
          80%, 100% { transform: translateX(200px); opacity: 0; }
        }
        @keyframes scan {
          0%, 30%, 70%, 100% { opacity: 0; transform: scale(0); }
          40%, 60% { opacity: 1; transform: scale(1); }
        }
        @keyframes showDefect {
          0%, 45% { opacity: 0; }
          50%, 100% { opacity: 1; }
        }
        @keyframes showStatus {
          0%, 55% { opacity: 0; }
          65% { opacity: 1; }
          75%, 100% { opacity: 0; }
        }
      `}</style>
      
      <rect x="50" y="10" width="100" height="70" rx="5" fill="#e5e7eb" />
      <rect x="45" y="80" width="110" height="5" rx="1" fill="#d1d5db" />
      
      <g className="status-pass">
        <rect x="60" y="20" width="80" height="50" rx="3" fill="#ecfdf5" />
        <FiCheckCircle x="88" y="30" width="24" height="24" stroke="#10b981" />
        <text x="100" y="65" fontSize="8" fill="#065f46" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">PASS</text>
      </g>
      
      <g className="status-fail">
        <rect x="60" y="20" width="80" height="50" rx="3" fill="#fef2f2" />
        <FiXCircle x="88" y="30" width="24" height="24" stroke="#ef4444" />
        <text x="100" y="65" fontSize="8" fill="#b91c1c" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">FAIL</text>
      </g>
      
      <rect x="75" y="10" width="50" height="70" className="scanline" />

      <g className="disc">
        <circle cx="0" cy="95" r="12" fill="#d1d5db" />
        <circle cx="0" cy="95" r="5" fill="#9ca3af" />
        <rect x="5" y="92" width="3" height="1.5" className="defect" />
      </g>
      
      <rect x="0" y="107" width="200" height="3" fill="#6b7280" />
    </svg>
  </div>
);

const VideoModal = ({ show, onClose }) => (
  <Modal show={show} onClose={onClose} maxWidth="max-w-2xl">
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Demo: How It Works</h3>
    <p className="text-gray-600 mb-4 text-sm">
      This animation demonstrates the AI analyzing parts as they pass the scanner.
      A "PASS" is shown first, then a "FAIL" for a part with a defect.
    </p>
    <InspectionDemoAnimation />
  </Modal>
);

const PricingModal = ({ show, onClose }) => (
  <Modal show={show} onClose={onClose}>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Plans</h3>
    <p className="text-gray-600 mb-6 text-sm">
      Choose the plan that scales with your production needs.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-gray-200 rounded-lg p-5">
        <h4 className="text-lg font-semibold text-blue-600">Pro</h4>
        <p className="text-3xl font-extrabold text-gray-900 mt-2">$499</p>
        <p className="text-gray-500 text-sm mb-4">/mo /line</p>
        <ul className="text-sm space-y-2 text-gray-600">
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> 1 Inspection Line</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> 50,000 Inspections/mo</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> Analytics Dashboard</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> Email Support</li>
        </ul>
        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-5">
          Get Started
        </button>
      </div>
      <div className="border border-blue-600 rounded-lg p-5 relative ring-2 ring-blue-500">
        <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</span>
        <h4 className="text-lg font-semibold text-blue-600">Enterprise</h4>
        <p className="text-3xl font-extrabold text-gray-900 mt-2">Custom</p>
        <p className="text-gray-500 text-sm mb-4">/mo</p>
        <ul className="text-sm space-y-2 text-gray-600">
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> Unlimited Lines</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> Unlimited Inspections</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> ERP Integration</li>
          <li className="flex items-center"><FiCheckCircle className="h-4 w-4 text-green-500 mr-2" /> 24/7 Priority Support</li>
        </ul>
        <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition mt-5">
          Contact Sales
        </button>
      </div>
    </div>
  </Modal>
);

const ScheduleModal = ({ show, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState("10 min");
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'sending', message: 'Scheduling...' });
    try {
      const response = await axios.post(`${API_URL}/schedule-demo`, {
        date,
        timeSlot,
        email: "samlifts411@gmail.com"
      });
      setStatus({ state: 'success', message: response.data.message });
    } catch (error) {
      console.error("Schedule error:", error);
      setStatus({ state: 'error', message: "Failed to schedule demo. Please try again." });
    }
  };

  useEffect(() => {
    if (!show) {
       setDate(new Date().toISOString().split('T')[0]);
       setTimeSlot("10 min");
       setTimeout(() => setStatus({ state: 'idle', message: '' }), 300);
    }
  }, [show]);

  return (
    <Modal show={show} onClose={onClose}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule a Demo</h3>
      {status.state === 'success' ? (
        <div className="text-center p-4">
          <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900">Booked!</h4>
          <p className="text-gray-600 text-sm">{status.message}</p>
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-6"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              id="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <div className="relative">
              <select 
                id="timeSlot"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option>10 min</option>
                <option>20 min</option>
                <option>30 min</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={status.state === 'sending'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
          >
            {status.state === 'sending' ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiCalendar className="mr-2" />
            )}
            Book Demo
          </button>
          {status.state === 'error' && (
            <p className="text-xs text-red-600 text-center">{status.message}</p>
          )}
        </form>
      )}
    </Modal>
  );
};

const HelpButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-40"
    aria-label="Need Help?"
  >
    <FiHelpCircle className="h-6 w-6" />
  </button>
);

// ====================================================================
// --- MAIN APPLICATION (Landing Page) ---
// ====================================================================
const MainApplication = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'monitoring', 'help'

  const handleScroll = (e, id) => {
    e.preventDefault();
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
           document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100); 
    } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentPage === 'monitoring') {
    return <LiveMonitoringPage onBack={() => setCurrentPage('home')} />;
  }
  if (currentPage === 'help') {
    return <HelpPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 font-sans">
      
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm w-full sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-xl font-extrabold text-gray-900">
                <MdOutlinePrecisionManufacturing className="h-7 w-7 text-blue-600" />
                <span>VisionAI</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-gray-600 hover:text-blue-600 font-medium">Features</a> 
              <a href="#pricing" onClick={(e) => { e.preventDefault(); setShowPricingModal(true); }} className="text-gray-600 hover:text-blue-600 font-medium">Pricing</a>
            </div>
            <div>
              <button onClick={(e) => handleScroll(e, 'cta')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Contact Us</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto z-10 relative">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mb-6">
            <FiCpu className="h-4 w-4 mr-2" /> AI-Powered Quality Control
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Automated Visual <span className="text-blue-600">Inspection</span> <span className="text-orange-500">System</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Precision defect detection for metal disc manufacturing. Real-time analysis with 99.9% accuracy.
          </p>
          <div className="flex justify-center space-x-4 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <button onClick={() => setCurrentPage('monitoring')} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center">
              Start Free Trial <FiArrowRight className="ml-2" />
            </button>
            <button onClick={() => setShowVideoModal(true)} className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition flex items-center">
              Watch Demo <FiPlayCircle className="ml-2" />
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <StatCard isLarge value="99.9%" label="Accuracy" />
          <StatCard isLarge value="200+" label="Parts/Min" />
          <StatCard isLarge value="24/7" label="Operation" />
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Performance Metrics</h2>
          <p className="text-lg text-gray-600">
            Real-world performance data from our automated inspection systems.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard icon={FiTarget} value="99.9%" label="Detection Accuracy" change="+0.2%" />
          <StatCard icon={FiZap} value="200+" label="Parts Per Minute" change="+15%" />
          <StatCard icon={FiClock} value="<0.5s" label="Average Scan Time" change="-0.3s" />
          <StatCard icon={FiTrendingUp} value="98.5%" label="Uptime Reliability" change="+1.2%" />
        </div>
      </section>

      {/* Comprehensive Quality Control Features */}
      <section id="features" className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Comprehensive Quality Control</h2>
          <p className="text-lg text-gray-600">
            Everything you need for automated visual inspection in one powerful platform.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={FiCpu} title="AI-Powered Detection" description="Advanced machine learning algorithms identify defects with unmatched precision and speed." />
          <FeatureCard icon={FiZap} title="Real-Time Processing" description="Instant analysis and feedback enable immediate quality control decisions on the production line." />
          <FeatureCard icon={FiCheckCircle} title="Zero Defect Tolerance" description="Configurable sensitivity levels ensure no defective parts reach your customers." />
          <FeatureCard icon={FiDatabase} title="Complete Traceability" description="Every inspection is logged with full metadata for compliance and quality auditing." />
          <FeatureCard icon={FiBarChart2} title="Analytics Dashboard" description="Comprehensive insights into quality trends, defect patterns, and production efficiency." />
          <FeatureCard icon={FiSettings} title="Easy Integration" description="Seamlessly integrates with existing production lines and ERP systems via standard APIs." />
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-blue-600 text-white p-12 rounded-xl text-center shadow-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Transform Your Quality Control?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10 opacity-90">
            Join leading manufacturers who trust our automated visual inspection system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center"
            >
              Schedule Demo <FiArrowRight className="ml-2" />
            </button>
          </div>
          <p className="text-sm mt-8 opacity-80">
            No credit card required • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100 bg-white">
        &copy; {new Date().getFullYear()} VisionAI. All rights reserved.
      </footer>

      {/* --- Floating Help Button --- */}
      <HelpButton onClick={() => setCurrentPage('help')} />

      {/* --- MODALS (only rendered on home page) --- */}
      <VideoModal show={showVideoModal} onClose={() => setShowVideoModal(false)} />
      <PricingModal show={showPricingModal} onClose={() => setShowPricingModal(false)} />
      <ScheduleModal show={showScheduleModal} onClose={() => setShowScheduleModal(false)} />
    </div>
  );
}

// ====================================================================
// --- ROOT APP COMPONENT (Auth Router) ---
// =WHAT IT DOES: This is the *real* App.js. It decides whether to show
// the LoginPage or the MainApplication based on if you are logged in.
// ====================================================================
function App() {
  const [token, setToken] = useState(localStorage.getItem("vision_ai_token"));
  const [showSignup, setShowSignup] = useState(false);

  // This is passed to the LoginPage
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("vision_ai_token", newToken);
    // Set the token for all future axios requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
  };

  // This is passed to the MainApplication
  const handleLogout = () => {
    localStorage.removeItem("vision_ai_token");
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
  };
  
  // This effect runs once on app load to set the auth header if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem("vision_ai_token");
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <GlobalStyles />
      {!token ? (
        showSignup ? (
          <SignupPage onSignupSuccess={handleSignupSuccess} onBackToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} onShowSignup={() => setShowSignup(true)} />
        )
      ) : (
        // If token exists, show the Main App
        <MainApplication onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;