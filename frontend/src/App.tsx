import React, { useState } from 'react';
import './App.css';

// 단계 구분
type Step = 'home' | 'clarifying' | 'result';

// Clarifying 입력값 타입
type ClarifyingAnswers = {
  transport: '대중교통' | '자가용' | '';
  duration: '당일' | '1박 이상' | '';
  budget: string;
};

// 추천 결과 예시 타입
type Place = {
  icon: string;
  name: string;
  desc: string;
  location: string;
  price: string;
};

const EXAMPLE_PLACEHOLDER = '서울 근교 축제 추천해줘';

const EXAMPLE_RESULT: Place[] = [
  {
    icon: '🗺️',
    name: '서울숲 전시관',
    desc: '현재 전시: "도시의 기억들"',
    location: '성동구, 2호선 뚝섬역 도보 5분',
    price: '무료',
  },
  {
    icon: '🏞️',
    name: '하남 유니온타워',
    desc: '서울 근교 전망대, 야경 인기',
    location: '5호선 하남풍산역 근처',
    price: '입장료: 2,000원',
  },
];

function App() {
  const [step, setStep] = useState<Step>('home');
  const [question, setQuestion] = useState('');
  const [clarifying, setClarifying] = useState<ClarifyingAnswers>({
    transport: '',
    duration: '',
    budget: '',
  });
  const [result, setResult] = useState<Place[]>([]);

  // 홈 → Clarifying
  const handleStart = () => {
    if (!question.trim()) return;
    setStep('clarifying');
  };

  // Clarifying → 결과
  const handleClarifyingNext = () => {
    if (!clarifying.transport || !clarifying.duration || !clarifying.budget) return;
    // (실제 구현 시 백엔드/RAG 호출)
    setResult(EXAMPLE_RESULT);
    setStep('result');
  };

  // 결과 → 다시 질문
  const handleRestart = () => {
    setStep('home');
    setQuestion('');
    setClarifying({ transport: '', duration: '', budget: '' });
    setResult([]);
  };

  return (
    <div className="chatbot-container">
      {step === 'home' && (
        <HomeScreen
          question={question}
          setQuestion={setQuestion}
          onStart={handleStart}
        />
      )}
      {step === 'clarifying' && (
        <ClarifyingScreen
          answers={clarifying}
          setAnswers={setClarifying}
          onNext={handleClarifyingNext}
        />
      )}
      {step === 'result' && (
        <ResultScreen
          places={result}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

// 홈 화면
function HomeScreen({ question, setQuestion, onStart }: {
  question: string;
  setQuestion: (q: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="home-screen">
      <header className="chatbot-header">
        <span className="chatbot-logo" role="img" aria-label="chatbot">🐻‍❄️</span>
        <div>
          <h1>CultureMate</h1>
          <p className="chatbot-desc">나만의 문화·관광 추천 비서</p>
        </div>
      </header>
      <main className="home-main">
        <input
          className="chatbot-input home-input"
          type="text"
          placeholder={EXAMPLE_PLACEHOLDER}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onStart()}
        />
        <button className="chatbot-send-btn home-btn" onClick={onStart} disabled={!question.trim()}>
          추천 받기 ▶
        </button>
      </main>
    </div>
  );
}

// Clarifying 화면
function ClarifyingScreen({ answers, setAnswers, onNext }: {
  answers: ClarifyingAnswers;
  setAnswers: (a: ClarifyingAnswers) => void;
  onNext: () => void;
}) {
  return (
    <div className="clarifying-screen">
      <header className="chatbot-header clarifying-header">
        <span className="chatbot-logo" role="img" aria-label="clarify">🐻‍❄️</span>
        <div>
          <h1>추천 전 몇 가지만 확인할게요!</h1>
        </div>
      </header>
      <main className="clarifying-main">
        <div className="clarifying-q">
          <div className="clarifying-label">✅ 이동 수단은 어떻게 하시나요?</div>
          <div className="clarifying-options">
            <label><input type="radio" name="transport" checked={answers.transport==='대중교통'} onChange={()=>setAnswers({...answers, transport:'대중교통'})}/> 대중교통</label>
            <label><input type="radio" name="transport" checked={answers.transport==='자가용'} onChange={()=>setAnswers({...answers, transport:'자가용'})}/> 자가용</label>
          </div>
        </div>
        <div className="clarifying-q">
          <div className="clarifying-label">✅ 하루 일정인가요, 숙박 포함인가요?</div>
          <div className="clarifying-options">
            <label><input type="radio" name="duration" checked={answers.duration==='당일'} onChange={()=>setAnswers({...answers, duration:'당일'})}/> 당일</label>
            <label><input type="radio" name="duration" checked={answers.duration==='1박 이상'} onChange={()=>setAnswers({...answers, duration:'1박 이상'})}/> 1박 이상</label>
          </div>
        </div>
        <div className="clarifying-q">
          <div className="clarifying-label">✅ 예산은 얼마 정도 생각하시나요?</div>
          <input
            className="clarifying-budget"
            type="number"
            min={0}
            placeholder="30000"
            value={answers.budget}
            onChange={e => setAnswers({ ...answers, budget: e.target.value })}
          /> 원
        </div>
        <button className="chatbot-send-btn clarifying-btn" onClick={onNext} disabled={!(answers.transport && answers.duration && answers.budget)}>
          다음 ▶
        </button>
      </main>
    </div>
  );
}

// 추천 결과 화면
function ResultScreen({ places, onRestart }: {
  places: Place[];
  onRestart: () => void;
}) {
  return (
    <div className="result-screen">
      <header className="chatbot-header result-header">
        <span className="chatbot-logo" role="img" aria-label="result">🐻‍❄️</span>
        <div>
          <h1>추천드릴만한 장소들이에요!</h1>
        </div>
      </header>
      <main className="result-main">
        {places.map((p, i) => (
          <div className="result-card" key={i}>
            <div className="result-icon">{p.icon}</div>
            <div className="result-title">{p.name}</div>
            <div className="result-desc">{p.desc}</div>
            <div className="result-location">{p.location}</div>
            <div className="result-price">{p.price}</div>
          </div>
        ))}
        <button className="chatbot-recommend-btn result-btn" onClick={onRestart}>
          다른 추천도 보고 싶어요
        </button>
      </main>
    </div>
  );
}

export default App;
