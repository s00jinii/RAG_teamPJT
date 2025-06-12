import React, { useState, useEffect, useRef } from 'react';
import './App.css';

type Message = {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

type RecommendType = 'exhibition' | 'festival' | 'tour';

// 전시회 clarifying
type ClarifyingAnswers = {
  transport: '대중교통' | '자가용' | '';
  duration: '당일' | '1박 이상' | '';
  budget: string;
};
// 축제 clarifying
type FestivalAnswers = {
  region: string;
  season: string;
  isFree: boolean;
};
// 관광지 clarifying
type TourAnswers = {
  query: string;
  top_k: number;
};

type Place = {
  icon: string;
  name: string;
  desc: string;
  location: string;
  price: string;
};
type Festival = {
  festivalName: string;
  date: string;
  location: string;
  description: string;
};
type Tour = {
  title: string;
  address: string;
  description: string;
};

const EXAMPLE_PLACEHOLDER = '서울 근교 축제 추천해줘';
const API_ENDPOINT = 'http://localhost:8000/agent/query';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: '안녕하세요! 저는 문화·관광 추천 비서 팬더봇이에요. 어디로 여행가고 싶으신가요? 어떤 곳을 추천해드릴까요?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendType, setRecommendType] = useState<RecommendType>('exhibition');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({ message: input }),
        signal: AbortSignal.timeout(30000),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `서버 오류 (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      // 백엔드 응답 형식에 맞게 처리
      let botResponse = '';
      if (typeof data.result === 'string') {
        botResponse = data.result;
      } else if (data.result && typeof data.result === 'object') {
        if (data.result.output) {
          botResponse = data.result.output;
        } else if (data.result.error) {
          throw new Error(data.result.error);
        } else {
          botResponse = JSON.stringify(data.result);
        }
      }

      const botMessage: Message = {
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('API Error:', err);
      const errorMessage: Message = {
        type: 'bot',
        content: err.name === 'AbortError' 
          ? '요청 시간이 초과되었습니다. 다시 시도해주세요.'
          : err.name === 'TypeError' && err.message === 'Failed to fetch'
          ? '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
          : err.message || '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <span className="chat-logo" role="img" aria-label="chatbot">🐼</span>
        <div>
          <h1>팬더봇</h1>
          <p className="chat-desc">나만의 문화·관광 추천 비서</p>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type === 'user' ? 'message-user' : 'message-bot'}`}
          >
            <div className="message-content">
              {message.type === 'bot' && (
                <span className="message-avatar" role="img" aria-label="bot">🐼</span>
              )}
              <div className="message-bubble">
                {message.content}
              </div>
              {message.type === 'user' && (
                <span className="message-avatar" role="img" aria-label="user">👤</span>
              )}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-bot">
            <div className="message-content">
              <span className="message-avatar" role="img" aria-label="bot">🐼</span>
              <div className="message-bubble loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <button
          className="chat-send-button"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          전송
        </button>
      </div>
    </div>
  );
}

export default App;
