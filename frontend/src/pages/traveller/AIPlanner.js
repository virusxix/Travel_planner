import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import {
  MapPin,
  Sparkles,
  Home,
  Loader2,
  ArrowUp,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-react';
import axios from 'axios';
import ItineraryMap from '@/components/ItineraryMap';
import ChatMarkdown from '@/components/ChatMarkdown';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CITY_CENTERS = {
  'Chiang Mai': [18.7883, 98.9853],
  'Da Nang': [16.0544, 108.2022],
  'Bangkok': [13.7563, 100.5018],
  'Hanoi': [21.0285, 105.8542],
};

const SUGGESTIONS = [
  'Plan a 3-day food trip to Chiang Mai under SGD 150/night',
  'Relaxed beach weekend in Da Nang for 2 people',
  'Culture-heavy 4 days in Bangkok — temples + street food',
];

function detectCity(text) {
  const t = (text || '').toLowerCase();
  const found = Object.keys(CITY_CENTERS).find((c) => t.includes(c.toLowerCase()));
  return found || null;
}

export default function AIPlanner({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi — I'm your HiddenStay trip planner. Tell me the city, how many days, and what you care about (food, temples, beaches, budget). I'll build a day-by-day plan and pin real HiddenStay stays on the map.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [detectedCity, setDetectedCity] = useState('Chiang Mai');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    axios.get(`${API}/properties`).then((r) => setAllProperties(r.data)).catch(() => {});
  }, []);

  const copyMessage = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(index);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const sendMessage = async (raw) => {
    const userMessage = (raw || '').trim();
    if (!userMessage || loading) return;

    const city = detectCity(userMessage);
    if (city) setDetectedCity(city);

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => (m.content || '').trim())
      .map((m) => ({ role: m.role, content: m.content }));

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          user_id: user.id,
          history,
        }),
      });

      if (!response.ok) throw new Error(`Chat failed (${response.status})`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);
            if (data.content) {
              if (!started) {
                started = true;
                setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
              }
              assistantMessage += data.content;
              const replyCity = detectCity(assistantMessage);
              if (replyCity) setDetectedCity(replyCity);
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: assistantMessage };
                return next;
              });
            }
            if (data.done) setShowItinerary(true);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      if (!started) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'I could not generate a reply. Try again in a moment.' },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry — I hit a snag reaching the planner. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cityProperties = allProperties
    .filter((p) => p.city === detectedCity && p.status === 'approved')
    .slice(0, 6);
  const mapCenter = CITY_CENTERS[detectedCity] || CITY_CENTERS['Chiang Mai'];
  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <Navbar
        logo="HiddenStay"
        logoTo="/traveller"
        action={{ label: 'Back to Home', to: '/traveller', testId: 'back-home-from-planner' }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Chat — ChatGPT-style panel */}
          <div className="lg:col-span-5 flex flex-col h-[calc(100vh-7.5rem)] min-h-[480px] rounded-[28px] bg-[#ececee] overflow-hidden shadow-sm border border-black/[0.04]">
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Trip planner</span>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 sm:px-5 pb-3 space-y-5"
              data-testid="chat-messages-container"
            >
              {messages.map((message, index) => (
                <div key={index} data-testid={`chat-message-${index}`}>
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[88%] rounded-2xl bg-[#e8e0d4] text-neutral-800 px-4 py-2.5 text-[14px] leading-[1.5]">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[98%]">
                      {message.content ? (
                        <ChatMarkdown content={message.content} />
                      ) : (
                        <span className="text-sm text-neutral-400">…</span>
                      )}
                      {message.content && !loading && (
                        <div className="mt-2.5 flex items-center gap-0.5 text-neutral-400">
                          <button
                            type="button"
                            onClick={() => copyMessage(message.content, index)}
                            className="p-1.5 rounded-lg hover:bg-black/5 hover:text-neutral-600 transition-colors"
                            aria-label="Copy"
                          >
                            {copiedIdx === index ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-black/5 hover:text-neutral-600 transition-colors"
                            aria-label="Good response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg hover:bg-black/5 hover:text-neutral-600 transition-colors"
                            aria-label="Bad response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const lastUser = [...messages]
                                .slice(0, index)
                                .reverse()
                                .find((m) => m.role === 'user');
                              if (lastUser) sendMessage(lastUser.content);
                            }}
                            className="p-1.5 rounded-lg hover:bg-black/5 hover:text-neutral-600 transition-colors"
                            aria-label="Regenerate"
                            disabled={loading}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Planning…
                </div>
              )}

              {showSuggestions && (
                <div className="flex flex-col gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="text-left text-[13px] px-4 py-2.5 rounded-2xl bg-white/70 border border-black/[0.05] text-neutral-700 hover:bg-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer — large white pill + black send */}
            <div className="px-3 sm:px-4 pb-3 pt-1">
              <div className="flex items-end gap-2 rounded-[22px] bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-3 py-2.5">
                <textarea
                  data-testid="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask anything"
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-[14px] text-neutral-800 placeholder:text-neutral-400 outline-none max-h-28 py-1.5 px-1"
                />
                <button
                  data-testid="chat-send-button"
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="shrink-0 h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center disabled:opacity-30 hover:bg-neutral-800 transition-colors"
                  aria-label="Send"
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                AI can make mistakes. Please double-check responses.
              </p>
            </div>
          </div>

          {/* Map panel */}
          <div className="lg:col-span-7 flex flex-col h-[calc(100vh-7.5rem)] min-h-[420px] rounded-[28px] bg-white border border-black/[0.06] shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Itinerary Map
              </h2>
              {showItinerary && (
                <span className="text-xs text-neutral-500" data-testid="map-city-label">
                  {detectedCity} · {cityProperties.length} stays
                </span>
              )}
            </div>

            {!showItinerary ? (
              <div className="flex-1 flex items-center justify-center text-center px-4 rounded-2xl bg-[#f4f4f5]">
                <div>
                  <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">
                    Ask for a trip plan — the map and HiddenStay stays appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 min-h-[240px] rounded-2xl overflow-hidden" data-testid="map-container">
                  <ItineraryMap
                    properties={cityProperties}
                    center={mapCenter}
                    onBookProperty={(p) => navigate(`/property/${p.id}`)}
                  />
                </div>

                <div className="overflow-y-auto max-h-[38%] pr-1">
                  <h3 className="font-semibold text-neutral-800 text-sm mb-3">
                    Recommended HiddenStay properties
                  </h3>
                  <div className="space-y-2.5">
                    {cityProperties.map((property, index) => (
                      <div
                        key={property.id}
                        className="bg-[#f4f4f5] rounded-2xl p-3 hover:bg-[#ececee] transition-colors"
                        data-testid={`recommended-property-${property.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 text-sm truncate">
                              {property.name}
                            </h4>
                            <p className="text-xs text-neutral-500 truncate">
                              {property.city} · SGD {property.price_per_night}/night
                            </p>
                          </div>
                          <Button
                            data-testid={`book-from-planner-${property.id}`}
                            onClick={() => navigate(`/property/${property.id}`)}
                            size="sm"
                            className="rounded-full h-8 px-3 text-xs bg-neutral-900 hover:bg-neutral-800"
                          >
                            <Home className="w-3 h-3 mr-1" />
                            Book
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cityProperties.length === 0 && (
                      <p className="text-sm text-neutral-500 text-center py-4">
                        No HiddenStay properties in {detectedCity} yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
