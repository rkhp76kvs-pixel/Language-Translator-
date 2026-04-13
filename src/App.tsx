/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Languages, 
  MessageSquare, 
  Settings2, 
  Globe2, 
  Sparkles,
  Volume2,
  ChevronRight,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveAPI } from '@/lib/useLiveAPI';

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function App() {
  const [language, setLanguage] = useState('es');
  const [level, setLevel] = useState('Beginner');
  const [isStarted, setIsStarted] = useState(false);
  
  const selectedLang = LANGUAGES.find(l => l.code === language);
  
  const systemInstruction = `You are a friendly and patient language tutor for ${selectedLang?.name}. 
  The user's level is ${level}. 
  Speak primarily in ${selectedLang?.name}, but provide brief English translations or explanations if the user seems confused or if they are at a Beginner level.
  Encourage the user to speak more. Correct their mistakes gently.
  Keep the conversation natural and engaging.`;

  const { 
    isConnected, 
    messages, 
    isRecording, 
    error, 
    connect, 
    disconnect 
  } = useLiveAPI(systemInstruction);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleStart = () => {
    setIsStarted(true);
    connect();
  };

  const handleStop = () => {
    disconnect();
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Languages size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">LingoLive</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                Live Session
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings2 size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  Master a new language <br />
                  <span className="text-indigo-600">through conversation.</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-lg mx-auto">
                  Practice speaking with our real-time AI tutor. Get instant feedback and build confidence in a safe environment.
                </p>
              </div>

              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe2 className="text-indigo-600" size={18} />
                    Session Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Target Language</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-12 border-slate-200 focus:ring-indigo-500">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <span className="mr-2">{lang.flag}</span>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Proficiency Level</label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-12 border-slate-200 focus:ring-indigo-500">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-xl p-4 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                      <Sparkles size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-indigo-900">AI Tutor Ready</p>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        Your tutor will adapt to your {level.toLowerCase()} level in {selectedLang?.name}. 
                        Just start speaking when you're ready!
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleStart}
                    className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                  >
                    Start Conversation
                    <ChevronRight className="ml-2" size={20} />
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Volume2, title: "Real-time Voice", desc: "Natural audio feedback" },
                  { icon: MessageSquare, title: "Instant Corrections", desc: "Learn from mistakes" },
                  { icon: History, title: "Session History", desc: "Track your progress" },
                ].map((feature, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600">
                      <feature.icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold">{feature.title}</h3>
                    <p className="text-xs text-slate-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={handleStop} className="text-slate-500 hover:text-slate-900">
                    Exit Session
                  </Button>
                  <div className="h-4 w-[1px] bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedLang?.flag}</span>
                    <span className="font-bold">{selectedLang?.name}</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">{level}</Badge>
                  </div>
                </div>
                
                {error && (
                  <Badge variant="destructive" className="animate-bounce">
                    {error}
                  </Badge>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Chat Area */}
                <Card className="lg:col-span-2 flex flex-col border-slate-200 shadow-lg overflow-hidden">
                  <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-6">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <MessageSquare size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-500 font-medium">Waiting for conversation to start...</p>
                            <p className="text-xs text-slate-400">Say "Hello" or "Hola" to begin!</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Visualizer / Status */}
                  <div className="p-6 bg-slate-50 border-t flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <AnimatePresence>
                          {isRecording && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1.5, opacity: 0.2 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute inset-0 bg-indigo-500 rounded-full"
                            />
                          )}
                        </AnimatePresence>
                        <Button
                          size="lg"
                          className={`w-20 h-20 rounded-full shadow-xl transition-all relative z-10 ${
                            isRecording 
                              ? 'bg-indigo-600 hover:bg-indigo-700' 
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isRecording ? <Mic size={32} /> : <MicOff size={32} />}
                        </Button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">
                          {isRecording ? 'Listening...' : 'Connecting...'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isRecording ? 'Speak now' : 'Please wait'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Sidebar / Tips */}
                <div className="space-y-6">
                  <Card className="border-slate-200 shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold">Quick Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-xs space-y-2">
                        <p className="text-slate-600 font-medium">How to practice:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-500">
                          <li>Describe your day</li>
                          <li>Ask about local culture</li>
                          <li>Roleplay ordering food</li>
                          <li>Ask for word meanings</li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Current Goal</p>
                        <p className="text-xs text-slate-600 italic">"Introduce yourself and talk about your hobbies."</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-md bg-indigo-600 text-white">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Volume2 size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold">Voice Mode Active</h3>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                          The AI will respond with natural speech. Make sure your volume is up!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

