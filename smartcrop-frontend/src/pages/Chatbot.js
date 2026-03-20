import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../translations';

const GEMINI_API_KEY = 'AIzaSyCU097M5u1f7KrWELm4pYY9Gop_MXvKwqo'; // paste your key

function Chatbot() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';
  const t = translations[lang] || translations['English'];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Language codes for speech
  const speechLang = {
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Malayalam': 'ml-IN',
    'Kannada': 'kn-IN',
    'Hindi': 'hi-IN',
    'English': 'en-IN',
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Welcome message
    setMessages([{
      role: 'bot',
      text: lang === 'Tamil'
        ? `வணக்கம் ${user.name}! நான் SmartCrop உதவியாளர். உங்கள் பயிர் பற்றி என்னிடம் கேளுங்கள்.`
        : `Hello ${user.name}! I am SmartCrop Assistant. Ask me anything about your crops!`,
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      role: 'user',
      text: text,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build context about farmer
      const farmerContext = `
        You are SmartCrop AI Assistant helping Indian farmers.
        Farmer name: ${user.name}
        District: ${user.district}
        Language to respond in: ${lang}
        
        You help with:
        - Crop failure risk questions
        - Weather and irrigation advice
        - Soil health guidance
        - Insurance claim information
        - Crop recommendations
        
        Keep responses short, simple and farmer-friendly.
        If language is Tamil, respond in Tamil script.
        If language is Hindi, respond in Hindi script.
        Always be encouraging and helpful.
        
        Farmer's question: ${text}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: farmerContext }]
            }]
          })
        }
      );

      const data = await response.json();
      console.log('Gemini response:', data);
        const botReply = data.candidates?.[0]?.content
        ?.parts?.[0]?.text ||
        data.error?.message ||
        'Sorry, I could not understand. Please try again.';

      const botMsg = {
        role: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);

      // Speak the response
      speakText(botReply);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Connection error. Please check internet.',
        time: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang[lang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice not supported in this browser. Use Chrome!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      alert('Voice error. Please try again.');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // Quick question buttons
  const quickQuestions = {
    'Tamil': [
      'என் பயிர் நிலை என்ன?',
      'காப்பீடு எப்படி பெறுவது?',
      'இன்று நீர்ப்பாசனம் தேவையா?',
      'என்ன பயிர் செய்யலாம்?',
    ],
    'English': [
      'What is my crop risk today?',
      'How to get insurance?',
      'Should I irrigate today?',
      'What crop should I grow?',
    ],
    'Hindi': [
      'मेरी फसल की स्थिति क्या है?',
      'बीमा कैसे मिलेगा?',
      'आज सिंचाई करनी चाहिए?',
      'कौन सी फसल उगाएं?',
    ],
    'Telugu': [
      'నా పంట స్థితి ఏమిటి?',
      'భీమా ఎలా పొందాలి?',
      'నేడు నీటిపారుదల అవసరమా?',
      'ఏ పంట వేయాలి?',
    ],
    'Malayalam': [
      'എന്റെ വിള നില എന്ത്?',
      'ഇൻഷുറൻസ് എങ്ങനെ?',
      'ഇന്ന് നനക്കണോ?',
      'ഏത് വിള നടാം?',
    ],
    'Kannada': [
      'ನನ್ನ ಬೆಳೆ ಸ್ಥಿತಿ ಏನು?',
      'ವಿಮೆ ಹೇಗೆ ಪಡೆಯುವುದು?',
      'ಇಂದು ನೀರು ಹಾಕಬೇಕೇ?',
      'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಲಿ?',
    ],
  };

  const questions = quickQuestions[lang] ||
                    quickQuestions['English'];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Arial',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Navbar */}
      <div style={{
        backgroundColor: '#1B2A4A',
        padding: '12px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <div style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              SmartCrop Assistant
            </div>
            <div style={{
              color: '#9EC8B9', fontSize: '11px'
            }}>
              AI Powered • Voice Enabled • {lang}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #9EC8B9',
            color: '#9EC8B9', padding: '6px 14px',
            borderRadius: '6px', cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ← Dashboard
        </button>
      </div>

      {/* Quick Questions */}
      <div style={{
        backgroundColor: 'white',
        padding: '12px 20px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', gap: '8px',
        flexWrap: 'wrap'
      }}>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#065F46',
              fontWeight: 'bold'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user'
              ? 'flex-end' : 'flex-start',
            marginBottom: '15px'
          }}>
            {msg.role === 'bot' && (
              <div style={{
                width: '35px', height: '35px',
                backgroundColor: '#1B2A4A',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                fontSize: '16px',
                flexShrink: 0
              }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              backgroundColor: msg.role === 'user'
                ? '#1B2A4A' : 'white',
              color: msg.role === 'user'
                ? 'white' : '#1B2A4A',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {msg.text}
              <div style={{
                fontSize: '10px',
                color: msg.role === 'user'
                  ? '#9EC8B9' : '#9CA3AF',
                marginTop: '5px',
                textAlign: 'right'
              }}>
                {msg.time}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: '35px', height: '35px',
                backgroundColor: '#2C7A3F',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '10px',
                fontSize: '16px',
                flexShrink: 0
              }}>
                👨‍🌾
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '35px', height: '35px',
              backgroundColor: '#1B2A4A',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🤖
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                display: 'flex', gap: '4px'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px',
                    backgroundColor: '#1B2A4A',
                    borderRadius: '50%',
                    animation: `bounce 1s ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        padding: '15px 20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Voice Button */}
          <button
            onClick={listening ? stopListening : startListening}
            style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              backgroundColor: listening ? '#DC2626' : '#2C7A3F',
              border: 'none', cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: listening
                ? 'pulse 1s infinite' : 'none'
            }}
          >
            {listening ? '⏹️' : '🎤'}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') sendMessage(input);
            }}
            placeholder={
              lang === 'Tamil'
                ? 'உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள்...'
                : lang === 'Hindi'
                ? 'अपना सवाल टाइप करें...'
                : 'Type your question...'
            }
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              outline: 'none'
            }}
          />

          {/* Send Button */}
          <button
            onClick={() => sendMessage(input)}
            style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              backgroundColor: '#1B2A4A',
              border: 'none', cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            ➤
          </button>
        </div>

        {/* Voice indicator */}
        {listening && (
          <p style={{
            textAlign: 'center',
            color: '#DC2626',
            fontSize: '13px',
            marginTop: '8px',
            fontWeight: 'bold'
          }}>
            🎤 Listening in {lang}... Speak now!
          </p>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default Chatbot;