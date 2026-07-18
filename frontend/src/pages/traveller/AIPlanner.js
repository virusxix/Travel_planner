import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MapPin, Sparkles, Home } from 'lucide-react';
import axios from 'axios';
import ItineraryMap from '@/components/ItineraryMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CITY_CENTERS = {
  'Chiang Mai': [18.7883, 98.9853],
  'Da Nang': [16.0544, 108.2022],
  'Bangkok': [13.7563, 100.5018],
  'Hanoi': [21.0285, 105.8542],
};

function detectCity(text) {
  const t = (text || '').toLowerCase();
  const found = Object.keys(CITY_CENTERS).find(c => t.includes(c.toLowerCase()));
  return found || 'Chiang Mai';
}

export default function AIPlanner({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI travel planner. Tell me about your trip plans, like "Plan a 3-day trip to Chiang Mai" and I\'ll create a personalized itinerary with recommended HiddenStay properties along the route.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [detectedCity, setDetectedCity] = useState('Chiang Mai');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    axios.get(`${API}/properties`).then(r => setAllProperties(r.data)).catch(() => {});
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setDetectedCity(detectCity(userMessage));
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, user_id: user.id })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
              if (data.done) {
                setShowItinerary(true);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cityProperties = allProperties
    .filter(p => p.city === detectedCity && p.status === 'approved')
    .slice(0, 6);
  const mapCenter = CITY_CENTERS[detectedCity] || CITY_CENTERS['Chiang Mai'];

  return (
    <div className="min-h-screen bg-background">
      <nav className="backdrop-blur-xl bg-white/60 border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-medium text-primary cursor-pointer" onClick={() => navigate('/traveller')}>HiddenStay</h1>
          <Button data-testid="back-home-from-planner" onClick={() => navigate('/traveller')} variant="ghost">Back to Home</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-display font-medium tracking-tight text-foreground">
              AI Trip Planner
            </h1>
          </div>
          <p className="text-muted-foreground">
            Get personalized itineraries with HiddenStay recommendations along your route
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-6 h-[calc(100vh-16rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4" data-testid="chat-messages-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-foreground'
                      }`}
                      data-testid={`chat-message-${index}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <Input
                  data-testid="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Plan a 3-day trip to Chiang Mai..."
                  disabled={loading}
                  className="rounded-full"
                />
                <Button
                  data-testid="chat-send-button"
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-saturate-150 rounded-3xl p-6 h-[calc(100vh-16rem)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Itinerary Map
                </h2>
                {showItinerary && (
                  <span className="text-xs text-muted-foreground" data-testid="map-city-label">
                    {detectedCity} · {cityProperties.length} stays
                  </span>
                )}
              </div>

              {!showItinerary ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">Start planning your trip to see the map</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  <div className="flex-1 min-h-[260px]" data-testid="map-container">
                    <ItineraryMap
                      properties={cityProperties}
                      center={mapCenter}
                      onBookProperty={(p) => navigate(`/property/${p.id}`)}
                    />
                  </div>

                  <div className="overflow-y-auto max-h-[40%] pr-1">
                    <h3 className="font-semibold text-foreground text-sm mb-3">Recommended HiddenStay properties</h3>
                    <div className="space-y-3">
                      {cityProperties.map((property, index) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all duration-300"
                          data-testid={`recommended-property-${property.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm truncate">{property.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{property.city} · SGD {property.price_per_night}/night</p>
                            </div>
                            <Button
                              data-testid={`book-from-planner-${property.id}`}
                              onClick={() => navigate(`/property/${property.id}`)}
                              size="sm"
                              className="rounded-full h-8 px-3 text-xs bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground"
                            >
                              <Home className="w-3 h-3 mr-1" />
                              Book
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {cityProperties.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No HiddenStay properties in {detectedCity} yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
