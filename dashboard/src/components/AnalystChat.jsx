import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { fetchAdvisor, sendChatMessage } from '../lib/api';

export default function AnalystChat({ selectedIp, onBlockIp }) {
  const [advisor, setAdvisor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedIp) {
      setAdvisor(null);
      setMessages([]);
      return;
    }
    setLoading(true);
    fetchAdvisor(selectedIp).then((data) => {
      setAdvisor(data);
      setMessages([
        {
          role: 'assistant',
          text: data
            ? `**Immediate action:** ${data.immediate_action}\n\n**Firewall rule:**\n\`${data.firewall_rule}\`\n\n**Intent:** ${data.intent_analysis}\n\n**Hardening:** ${data.hardening_tip}`
            : 'No advisor data available for this IP.',
        },
      ]);
      setLoading(false);
    });
  }, [selectedIp]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedIp) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    const res = await sendChatMessage(selectedIp, userMsg);
    setMessages((m) => [...m, { role: 'assistant', text: res?.response || 'No response.' }]);
    setLoading(false);
  };

  return (
    <div className="panel flex flex-col h-full min-h-[400px]">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <MessageSquare size={14} className="text-slate-500" />
          AI Analyst
        </h2>
        {selectedIp && (
          <span className="font-mono text-xs text-blue-400">{selectedIp}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {!selectedIp && (
          <p className="text-slate-500 text-center py-12">
            Click an attacker IP in the feed to start a defensive analysis session.
          </p>
        )}
        {selectedIp && loading && messages.length === 0 && (
          <p className="text-slate-500 animate-pulse">Loading threat context…</p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-blue-950/30 text-slate-200 ml-8'
                : 'bg-slate-900/60 text-slate-300 mr-4'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {selectedIp && (
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-600"
              placeholder="Ask about mitigation, intent, or firewall rules…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button className="btn-primary flex items-center gap-1" onClick={handleSend} disabled={loading}>
              <Send size={12} /> Send
            </button>
          </div>
          {advisor && (
            <button className="btn-primary w-full" onClick={() => onBlockIp(selectedIp)}>
              Block {selectedIp}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
