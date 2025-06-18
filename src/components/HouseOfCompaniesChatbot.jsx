import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HouseOfCompaniesChatbot.css';

const HouseOfCompaniesChatbot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    company: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId] = useState(() => 'HOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));
  const [showFreeTextInput, setShowFreeTextInput] = useState(false);
  const [freeTextInput, setFreeTextInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isInitializedRef = useRef(false);

  const totalSteps = 12;

  // Countries list
  const countries = [
    'United States', 'United Kingdom', 'Germany', 'Netherlands', 'Ireland', 'Luxembourg',
    'Switzerland', 'France', 'Spain', 'Italy', 'Portugal', 'Belgium', 'Austria',
    'Denmark', 'Sweden', 'Norway', 'Finland', 'Poland', 'Czech Republic', 'Hungary',
    'Estonia', 'Latvia', 'Lithuania', 'Slovenia', 'Croatia', 'Romania', 'Bulgaria',
    'Cyprus', 'Malta', 'Canada', 'Australia', 'New Zealand', 'Singapore', 'Hong Kong',
    'UAE', 'Qatar', 'Saudi Arabia', 'India', 'Japan', 'South Korea', 'Malaysia',
    'Thailand', 'Philippines', 'Indonesia', 'Vietnam', 'South Africa', 'Mexico',
    'Brazil', 'Argentina', 'Chile', 'Colombia', 'Other'
  ];

  // Chat flow steps with services and pricing
  const chatFlow = {
    0: {
      message: "👋 Welcome to House of Companies! I'm here to help you establish and grow your business across Europe and beyond. What brings you here today?",
      options: [
        { id: 'setup', title: '🏢 Set up a new business', description: 'Start your company in Europe or expand globally' },
        { id: 'expand', title: '🌍 Expand existing business', description: 'Grow your business to new markets' },
        { id: 'consultation', title: '💬 Get expert consultation', description: 'Speak with our business formation specialists' },
        { id: 'services', title: '📋 Explore our services', description: 'Learn about our comprehensive business solutions' }
      ]
    },
    1: {
      message: "Great choice! Let me understand your business stage better. Where are you in your entrepreneurial journey?",
      options: [
        { id: 'idea', title: '💡 I have a business idea', description: 'Just starting out with a concept' },
        { id: 'planning', title: '📋 Planning phase', description: 'Working on business plan and strategy' },
        { id: 'ready', title: '🚀 Ready to launch', description: 'Prepared to establish the company' },
        { id: 'existing', title: '🏪 Existing business', description: 'Already running a business elsewhere' }
      ]
    },
    2: {
      message: "Perfect! Which regions are you most interested in for your business operations?",
      options: [
        { id: 'eu', title: '🇪🇺 European Union', description: 'Access to 27 EU countries and 450M+ consumers' },
        { id: 'uk', title: '🇬🇧 United Kingdom', description: 'English-speaking market with global reach' },
        { id: 'us', title: '🇺🇸 United States', description: 'World\'s largest economy and consumer market' },
        { id: 'global', title: '🌍 Multiple regions', description: 'International expansion across regions' }
      ]
    },
    3: {
      message: "Excellent! Now let's look at our core business formation services. Please select what you need:",
      options: [
        { id: 'virtual_office', title: '📍 Virtual Office Address', description: 'Professional business address', price: 495 },
        { id: 'entity_setup', title: '🏢 Entity Setup (LLC/Ltd)', description: 'Complete company formation', price: 1995 },
        { id: 'vat_id', title: '🆔 VAT ID Registration', description: 'EU VAT identification number', price: 325 },
        { id: 'bank_account', title: '🏦 Business Bank Account', description: 'Multi-currency business banking', price: 750 },
        { id: 'skip_services', title: '⏭️ Skip for now', description: 'Continue without selecting services', price: 0 }
      ]
    },
    4: {
      message: "Great! Let's look at our tax and compliance services:",
      options: [
        { id: 'tax_advisory', title: '📊 Tax Advisory Services', description: 'Expert tax planning and compliance', price: 850 },
        { id: 'bookkeeping', title: '📚 Bookkeeping Services', description: 'Monthly financial record management', price: 450 },
        { id: 'annual_filing', title: '📋 Annual Filing', description: 'Company annual returns and filings', price: 275 },
        { id: 'payroll', title: '💰 Payroll Services', description: 'Employee payroll management', price: 650 },
        { id: 'skip_tax', title: '⏭️ Skip tax services', description: 'Continue without tax services', price: 0 }
      ]
    },
    5: {
      message: "Perfect! Now let's explore our additional services and add-ons:",
      options: [
        { id: 'trademark', title: '™️ Trademark Registration', description: 'Protect your brand internationally', price: 1250 },
        { id: 'website', title: '🌐 Professional Website', description: 'Business website development', price: 2500 },
        { id: 'marketing', title: '📈 Digital Marketing Setup', description: 'SEO and online presence', price: 1750 },
        { id: 'legal_docs', title: '📄 Legal Document Templates', description: 'Contracts and legal templates', price: 350 },
        { id: 'skip_addons', title: '⏭️ Skip add-ons', description: 'Continue without additional services', price: 0 }
      ]
    },
    6: {
      message: "Excellent selections! When would you like to get started with your business setup?",
      options: [
        { id: 'asap', title: '🚀 As soon as possible', description: 'Start immediately' },
        { id: 'month', title: '📅 Within a month', description: 'Planning to start within 4 weeks' },
        { id: 'quarter', title: '📆 Within 3 months', description: 'Planning for next quarter' },
        { id: 'planning', title: '🤔 Still planning', description: 'Gathering information for now' }
      ]
    },
    7: {
      message: "Great! Let me get some details about your business profile:",
      type: 'profile_form'
    },
    8: {
      message: "Based on your selections, here's what we recommend for your business setup:",
      type: 'recommendation'
    },
    9: {
      message: "Perfect! Let me collect your contact information to create your personalized report:",
      type: 'contact_form'
    },
    10: {
      message: "Excellent! Here's a summary of everything you've selected:",
      type: 'summary'
    },
    11: {
      message: "🎉 Thank you! Your business setup consultation has been scheduled. What would you like to do next?",
      options: [
        { id: 'calendar', title: '📅 Book Calendar Appointment', description: 'Schedule a detailed consultation' },
        { id: 'contact', title: '📞 Get Contact Information', description: 'Speak with our specialists directly' },
        { id: 'restart', title: '🔄 Start Over', description: 'Begin a new consultation' }
      ]
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLinkedIn = (url) => {
    if (!url) return true;
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  };

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Auto-scroll to bottom with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Memoize addMessage to prevent re-creation
  const addMessage = useCallback((sender, text, timestamp = new Date().toLocaleTimeString(), options = null) => {
    setMessages(prev => [...prev, { sender, text, timestamp, options }]);
  }, []);

  // Initialize chat only once - using ref to handle StrictMode
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      addMessage('bot', chatFlow[0].message, new Date().toLocaleTimeString(), chatFlow[0].options);
      setShowOptions(true);
    }
  }, [addMessage]);

  const handleOptionSelect = (optionId) => {
    const currentOptions = chatFlow[currentStep]?.options || [];
    const selectedOption = currentOptions.find(opt => opt.id === optionId);

    if (selectedOption) {
      // Hide current options
      setShowOptions(false);
      
      // Add user message
      addMessage('user', selectedOption.title);

      setSelectedOptions(prev => ({
        ...prev,
        [currentStep]: selectedOption
      }));

      if (selectedOption.price) {
        setTotalPrice(prev => prev + selectedOption.price);
      }

      setTimeout(() => {
        const nextStep = currentStep + 1;
        if (chatFlow[nextStep]) {
          setCurrentStep(nextStep);
          if (chatFlow[nextStep].message) {
            // Add bot message with options or form type if available
            addMessage('bot', chatFlow[nextStep].message, new Date().toLocaleTimeString(), chatFlow[nextStep].options);
            if (chatFlow[nextStep].options || chatFlow[nextStep].type) {
              setShowOptions(true);
            }
          }
        }
      }, 500);
    }
  };

  const handleFreeTextInput = async (text) => {
    addMessage('user', text);
    setTimeout(() => {
      const responses = [
        "Thank you for your question! Based on our expertise, we specialize in global business setups.",
        "That's a great question! Our team has extensive experience in international business formation.",
        "I understand your concern. We offer comprehensive support for business setup and tax compliance."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage('bot', randomResponse);
    }, 1000);
    setFreeTextInput('');
    setShowFreeTextInput(false);
  };

  const handleProfileSubmit = (profileData) => {
    setShowOptions(false);
    setUserProfile(prev => ({ ...prev, ...profileData }));
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (chatFlow[nextStep]?.message) {
      setTimeout(() => {
        addMessage('bot', chatFlow[nextStep].message);
        if (chatFlow[nextStep].options || chatFlow[nextStep].type) {
          setShowOptions(true);
        }
      }, 300);
    }
  };

  const handleContactSubmit = (contactData) => {
    const newErrors = {};

    if (!validateEmail(contactData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (contactData.linkedin && !validateLinkedIn(contactData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL (https://linkedin.com/in/username)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setShowOptions(false);
    setUserProfile(prev => ({ ...prev, ...contactData }));

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    if (chatFlow[nextStep]?.message) {
      setTimeout(() => {
        addMessage('bot', chatFlow[nextStep].message, new Date().toLocaleTimeString(), chatFlow[nextStep].options);
        if (chatFlow[nextStep].options || chatFlow[nextStep].type) {
          setShowOptions(true);
        }
      }, 300);
    }
  };

  const generateReport = () => {
    const report = {
      sessionId,
      timestamp: new Date().toISOString(),
      userProfile,
      selectedServices: Object.values(selectedOptions),
      totalPrice,
      summary: Object.values(selectedOptions).map(opt =>
        `${opt.title}${opt.price ? ` - €${opt.price}` : ''}`
      ).join('\n')
    };
    return report;
  };

  const sendEmailReport = async (report) => {
    console.log('Sending report to manojnamalla12@gmail.com:', report);
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowOptions(false);

    try {
      const report = generateReport();
      await sendEmailReport(report);
      addMessage('bot', '✅ Perfect! Your report has been sent to our team. You should receive a confirmation email shortly.');
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (chatFlow[nextStep]?.message) {
        setTimeout(() => {
          addMessage('bot', chatFlow[nextStep].message, new Date().toLocaleTimeString(), chatFlow[nextStep].options);
          if (chatFlow[nextStep].options) {
            setShowOptions(true);
          }
        }, 1000);
      }
    } catch (error) {
      addMessage('bot', '❌ Sorry, there was an issue sending your report. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookConsultation = () => {
    const calendlyUrl = `https://calendly.com/dennis-houseofcompanies/new-meeting?month=2025-06&name=${encodeURIComponent(userProfile.name)}&email=${encodeURIComponent(userProfile.email)}`;
    window.open(calendlyUrl, '_blank');
    addMessage('bot', '📅 Great! The calendar booking page has opened in a new window. Please select your preferred time slot.');
  };

  const goBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setShowOptions(false);
      // Remove last bot and user messages
      setMessages(prev => prev.slice(0, -2));
      setTimeout(() => {
        if (chatFlow[prevStep].options || chatFlow[prevStep].type) {
          setShowOptions(true);
        }
      }, 100);
    }
  };

  const startOver = () => {
    setCurrentStep(0);
    setMessages([]);
    setSelectedOptions({});
    setTotalPrice(0);
    setUserProfile({
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      company: '',
      country: ''
    });
    setErrors({});
    setShowOptions(false);
    isInitializedRef.current = false;
    setTimeout(() => {
      isInitializedRef.current = true;
      addMessage('bot', chatFlow[0].message, new Date().toLocaleTimeString(), chatFlow[0].options);
      setShowOptions(true);
    }, 100);
  };

  // Custom UI rendering
  const renderCurrentStep = () => {
    const step = chatFlow[currentStep];

    if (!step || !showOptions) return null;

    if (step.type === 'profile_form') {
      return (
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={userProfile.company}
              onChange={(e) => setUserProfile(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Enter your company name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Country</label>
            <select
              className="form-select"
              value={userProfile.country}
              onChange={(e) => setUserProfile(prev => ({ ...prev, country: e.target.value }))}
            >
              <option value="">Select a country</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <button onClick={() => handleProfileSubmit(userProfile)} className="btn btn-primary btn-full">
            Continue
          </button>
        </div>
      );
    }

    if (step.type === 'contact_form') {
      return (
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
              required
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">LinkedIn Profile</label>
            <input
              type="url"
              className={`form-input ${errors.linkedin ? 'error' : ''}`}
              value={userProfile.linkedin}
              onChange={(e) => setUserProfile(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedin && <p className="form-error">{errors.linkedin}</p>}
          </div>
          <button onClick={() => handleContactSubmit(userProfile)} className="btn btn-primary btn-full">
            Continue
          </button>
        </div>
      );
    }

    if (step.type === 'recommendation') {
      return (
        <div className="space-y-4">
          <div className="recommendation-box">
            <h3 className="recommendation-title">🎯 Recommended for You</h3>
            <div className="space-y-2">
              {Object.values(selectedOptions).map((option, index) => (
                option.price > 0 && (
                  <div key={index} className="recommendation-item">
                    <span>{option.title}</span>
                    <span style={{fontWeight: 'bold'}}>€{option.price}</span>
                  </div>
                )
              ))}
            </div>
            <div style={{borderTop: '1px solid #d1fae5', marginTop: '12px', paddingTop: '12px'}}>
              <div className="recommendation-item">
                <span style={{fontWeight: 'bold'}}>Total Investment:</span>
                <span style={{fontSize: '1.25rem', fontWeight: 'bold'}}>€{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowOptions(false);
              const nextStep = currentStep + 1;
              setCurrentStep(nextStep);
              if (chatFlow[nextStep]?.message) {
                setTimeout(() => {
                  addMessage('bot', chatFlow[nextStep].message);
                  if (chatFlow[nextStep].options || chatFlow[nextStep].type) {
                    setShowOptions(true);
                  }
                }, 300);
              }
            }}
            className="btn btn-primary btn-full"
          >
            Looks Good! Continue
          </button>
        </div>
      );
    }

    if (step.type === 'summary') {
      return (
        <div className="space-y-4">
          <div className="summary-box">
            <h3 className="summary-title">📋 Your Business Setup Summary</h3>
            <div className="space-y-2">
              <div className="summary-item">
                <strong>Name:</strong> <span>{userProfile.name}</span>
              </div>
              <div className="summary-item">
                <strong>Email:</strong> <span>{userProfile.email}</span>
              </div>
              <div className="summary-item">
                <strong>Company:</strong> <span>{userProfile.company}</span>
              </div>
              <div className="summary-item">
                <strong>Country:</strong> <span>{userProfile.country}</span>
              </div>
              <div style={{paddingTop: '8px', borderTop: '1px solid #e5e7eb'}}>
                <strong>Selected Services:</strong>
                <div style={{marginTop: '8px'}}>
                  {Object.values(selectedOptions).map((option, index) => (
                    option.price > 0 && (
                      <div key={index} className="summary-item">
                        <span>{option.title}</span>
                        <span>€{option.price}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
              <div style={{paddingTop: '8px', borderTop: '1px solid #e5e7eb', fontWeight: 'bold'}}>
                <div className="summary-item">
                  <span>Total:</span>
                  <span>€{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !userProfile.email || !userProfile.name}
            className="btn btn-primary btn-full"
            style={{padding: '12px 24px', fontSize: '1rem'}}
          >
            {isSubmitting ? 'Processing...' : 'Complete & Send Report'}
          </button>
          <button
            onClick={handleBookConsultation}
            className="btn btn-primary btn-full"
            style={{padding: '12px 24px', fontSize: '1rem'}}
          >
            📅 Book Free Consultation
          </button>
        </div>
      );
    }

    // Horizontal buttons for options if available
    if (step.options) {
      return (
        <div>
          <div className="option-grid">
            {step.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.id)}
                className="option-button-horizontal"
              >
                <div className="option-icon">{option.title.split(' ')[0]}</div>
                <div>
                  <div className="option-title">{option.title.replace(/^\S+\s/, '')}</div>
                  <div className="option-desc">{option.description}</div>
                  {option.price && option.price > 0 && (
                    <div className="option-price">€{option.price}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>House of Companies</h1>
            <p>Business Formation Assistant</p>
          </div>
          <div style={{textAlign: 'right', fontSize: '0.75rem'}}>
            <div>Session: {sessionId.split('-')[1]}</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="chatbot-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min((currentStep / totalSteps) * 100, 100)}%` }}
          ></div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '4px'}}>
          <span>Progress</span>
          <span>{Math.min(Math.round((currentStep / totalSteps) * 100), 100)}%</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatMessagesRef} className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">
              <div>{message.text}</div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Current Step Content */}
      <div className="current-step-content">
        {renderCurrentStep()}
      </div>

      {/* Free Text Input */}
      {showFreeTextInput && (
        <div className="free-text-container">
          <div className="free-text-input-container">
            <input
              type="text"
              value={freeTextInput}
              onChange={(e) => setFreeTextInput(e.target.value)}
              placeholder="Type your question..."
              className="form-input free-text-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && freeTextInput.trim()) {
                  handleFreeTextInput(freeTextInput.trim());
                }
              }}
            />
            <button onClick={() => freeTextInput.trim() && handleFreeTextInput(freeTextInput.trim())} className="send-button">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Navigation & Action Buttons */}
      <div className="chatbot-footer">
        <div className="nav-buttons">
          {currentStep > 0 && (
            <button onClick={goBack} className="btn btn-secondary">
              ← Back
            </button>
          )}
          <button onClick={startOver} className="btn btn-primary">
            Start Over
          </button>
        </div>

        {totalPrice > 0 && (
          <div className="total-display">
            <span className="label">Current Total:</span>
            <span className="amount">€{totalPrice.toLocaleString()}</span>
          </div>
        )}

        <div className="question-btn">
          <button onClick={() => setShowFreeTextInput(!showFreeTextInput)} className="btn btn-outline btn-full">
            💬 Ask a Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default HouseOfCompaniesChatbot;
