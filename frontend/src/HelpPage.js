// In frontend/src/HelpPage.js
import React, { useState } from 'react';
import { FiHelpCircle, FiSearch, FiChevronDown, FiChevronUp, FiMessageSquare, FiSend, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { MdOutlinePrecisionManufacturing } from 'react-icons/md';

// Individual FAQ Item Component
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-800">{question}</span>
        {isOpen ? <FiChevronUp className="h-5 w-5 text-blue-600" /> : <FiChevronDown className="h-5 w-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="pb-5 pr-10 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Main Help Page Component
const HelpPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formStatus, setFormStatus] = useState({ state: 'idle', message: '' });

  const faqs = [
    { q: "How does the AI model work?", a: "The system uses a YOLOv8 (You Only Look Once) object detection model. It has been trained on thousands of images of metal discs to recognize the visual patterns of defects like scratches, burrs, and cracks." },
    { q: "What is 'real-time' monitoring?", a: "The system processes the webcam feed to capture and analyze images in milliseconds. This allows for immediate feedback on the production line, identifying bad parts as they pass the camera." },
    { q: "Can I use this for other types of parts?", a: "This specific model is trained *only* for the metal discs shown. To inspect other parts (e.g., bottles, boxes), a new model would need to be trained on a new dataset of those parts." },
    { q: "What does the 'Schedule Demo' button do?", a: "It opens a form to book a meeting. When you submit, it simulates sending an email notification to our sales team (samlifts411@gmail.com) with your requested date and time." },
    { q: "Is my data secure?", a: "This demo runs entirely in your browser and on a local backend. No images are uploaded to the internet. In a real production environment, all data would be stored securely on your private servers." }
  ];

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ state: 'sending', message: 'Submitting...' });
    // Simulate API call
    setTimeout(() => {
      setFormStatus({ state: 'success', message: 'Your question has been sent! We will get back to you shortly.' });
      e.target.reset(); // Clear the form
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm w-full sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-xl font-extrabold text-gray-900">
                <MdOutlinePrecisionManufacturing className="h-7 w-7 text-blue-600" />
                <span>VisionAI Help Center</span>
            </div>
            <button onClick={onBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto py-16 px-4 text-center">
          <FiHelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">How can we help?</h1>
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text"
              placeholder="Search for answers (e.g., 'how does it work?')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: FAQs */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.filter(faq => faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || faq.a.toLowerCase().includes(searchTerm.toLowerCase()))
                 .map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* Right Column: Ask a Question */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
              <FiMessageSquare className="h-7 w-7 text-blue-600 mr-3" />
              Ask a Question
            </h2>
            {formStatus.state === 'success' ? (
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900">Submitted!</h4>
                <p className="text-gray-600 text-sm">{formStatus.message}</p>
                <button
                  onClick={() => setFormStatus({ state: 'idle', message: '' })}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-4"
                >
                  Ask Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                  <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
                  <textarea id="question" rows="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                </div>
                <button
                  type="submit"
                  disabled={formStatus.state === 'sending'}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {formStatus.state === 'sending' ? <FiLoader className="animate-spin mr-2" /> : <FiSend className="mr-2" />}
                  Submit Question
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

    </div>
  );
};

export default HelpPage;