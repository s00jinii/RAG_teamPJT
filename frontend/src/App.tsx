import React, { useState, useEffect } from 'react';
import './App.css';

type Step = 'home' | 'input' | 'result';
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
const EXHIBITION_API = '/recommend/exhibition';
const FESTIVAL_API = '/recommend/festival';
const TOUR_API = '/search/tour';

function App() {
  const [step, setStep] = useState<Step>('home');
  const [recommendType, setRecommendType] = useState<RecommendType>('exhibition');

  // exhibition
  const [question, setQuestion] = useState('');
  const [clarifying, setClarifying] = useState<ClarifyingAnswers>({ transport: '', duration: '', budget: '' });
  // festival
  const [festival, setFestival] = useState<FestivalAnswers>({ region: '', season: '', isFree: false });
  // tour
  const [tour, setTour] = useState<TourAnswers>({ query: '', top_k: 3 });

  // 결과
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 홈 → 입력폼
  const handleStart = () => {
    setStep('input');
    setResult(null);
    setError(null);
  };

  // 입력폼 → 결과
  const handleInputNext = () => {
    setStep('result');
  };

  // 결과 → 다시 질문
  const handleRestart = () => {
    setStep('home');
    setQuestion('');
    setClarifying({ transport: '', duration: '', budget: '' });
    setFestival({ region: '', season: '', isFree: false });
    setTour({ query: '', top_k: 3 });
    setResult(null);
    setError(null);
    setLoading(false);
  };

  // 입력폼 → 홈
  const handleBackToHome = () => {
    setStep('home');
    setResult(null);
    setError(null);
    setLoading(false);
  };

  // 결과 → 입력폼
  // API 연동: result 단계 진입 시 호출
  useEffect(() => {
    if (step !== 'result') return;
    setLoading(true);
    setError(null);
    let url = '';
    let body: any = {};
    if (recommendType === 'exhibition') {
      url = EXHIBITION_API;
      body = { question, clarifying };
    } else if (recommendType === 'festival') {
      url = FESTIVAL_API;
      body = festival;
    } else if (recommendType === 'tour') {
      url = TOUR_API;
      body = tour;
    }
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('추천 결과를 불러오지 못했습니다.');
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="chatbot-container">
      {step === 'home' && (
        <HomeScreen
          recommendType={recommendType}
          setRecommendType={setRecommendType}
          onStart={handleStart}
        />
      )}
      {step === 'input' && (
        <InputScreen
          recommendType={recommendType}
          question={question}
          setQuestion={setQuestion}
          clarifying={clarifying}
          setClarifying={setClarifying}
          festival={festival}
          setFestival={setFestival}
          tour={tour}
          setTour={setTour}
          onNext={handleInputNext}
        />
      )}
      {step === 'result' && (
        <ResultScreen
          recommendType={recommendType}
          result={result}
          loading={loading}
          error={error}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

// 홈 화면: 추천 유형 선택
function HomeScreen({ recommendType, setRecommendType, onStart }: {
  recommendType: RecommendType;
  setRecommendType: (t: RecommendType) => void;
  onStart: () => void;
}) {
  return (
    <div className="home-screen" style={{position:'relative', minHeight:'420px'}}>
      <header className="chatbot-header">
        <span className="chatbot-logo" role="img" aria-label="chatbot">🐻‍❄️</span>
        <div>
          <h1>CultureMate</h1>
          <p className="chatbot-desc">나만의 문화·관광 추천 비서</p>
        </div>
      </header>
      <main className="home-main">
        <div className="home-type-group">
          <button className={`home-type-card${recommendType==='exhibition' ? ' home-type-card--active' : ''}`} onClick={()=>setRecommendType('exhibition')}>
            <span className="type-icon" role="img" aria-label="exhibition">🖼️</span>
            전시회
          </button>
          <button className={`home-type-card${recommendType==='festival' ? ' home-type-card--active' : ''}`} onClick={()=>setRecommendType('festival')}>
            <span className="type-icon" role="img" aria-label="festival">🎉</span>
            축제
          </button>
          <button className={`home-type-card${recommendType==='tour' ? ' home-type-card--active' : ''}`} onClick={()=>setRecommendType('tour')}>
            <span className="type-icon" role="img" aria-label="tour">🗺️</span>
            관광지
          </button>
        </div>
      </main>
      <button className="chatbot-send-btn home-btn" onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}

// 입력 폼 화면: 유형별로 다르게
function InputScreen({ recommendType, question, setQuestion, clarifying, setClarifying, festival, setFestival, tour, setTour, onNext }: {
  recommendType: RecommendType;
  question: string;
  setQuestion: (q: string) => void;
  clarifying: ClarifyingAnswers;
  setClarifying: (a: ClarifyingAnswers) => void;
  festival: FestivalAnswers;
  setFestival: (a: FestivalAnswers) => void;
  tour: TourAnswers;
  setTour: (a: TourAnswers) => void;
  onNext: () => void;
}) {
  return (
    <div className="input-screen">
      <header className="chatbot-header">
        <span className="chatbot-logo" role="img" aria-label="chatbot">🐻‍❄️</span>
        <div>
          <h1>추천 조건을 입력해 주세요</h1>
        </div>
      </header>
      <main className="clarifying-main">
        {recommendType === 'exhibition' && (
          <>
            <input
              className="chatbot-input home-input"
              type="text"
              placeholder={EXAMPLE_PLACEHOLDER}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              style={{marginBottom:16}}
            />
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 이동 수단은 어떻게 하시나요?</div>
              <div className="clarifying-options">
                <label><input type="radio" name="transport" checked={clarifying.transport==='대중교통'} onChange={()=>setClarifying({...clarifying, transport:'대중교통'})}/> 대중교통</label>
                <label><input type="radio" name="transport" checked={clarifying.transport==='자가용'} onChange={()=>setClarifying({...clarifying, transport:'자가용'})}/> 자가용</label>
              </div>
            </div>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 하루 일정인가요, 숙박 포함인가요?</div>
              <div className="clarifying-options">
                <label><input type="radio" name="duration" checked={clarifying.duration==='당일'} onChange={()=>setClarifying({...clarifying, duration:'당일'})}/> 당일</label>
                <label><input type="radio" name="duration" checked={clarifying.duration==='1박 이상'} onChange={()=>setClarifying({...clarifying, duration:'1박 이상'})}/> 1박 이상</label>
              </div>
            </div>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 예산은 얼마 정도 생각하시나요?</div>
              <input
                className="clarifying-budget"
                type="number"
                min={0}
                placeholder="30000"
                value={clarifying.budget}
                onChange={e => setClarifying({ ...clarifying, budget: e.target.value })}
              /> 원
            </div>
            <button className="chatbot-send-btn clarifying-btn" onClick={onNext} disabled={!(question && clarifying.transport && clarifying.duration && clarifying.budget)}>
              추천 받기
            </button>
          </>
        )}
        {recommendType === 'festival' && (
          <>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 지역을 선택해 주세요</div>
              <select className="chatbot-input home-input" value={festival.region} onChange={e=>setFestival({...festival, region:e.target.value})}>
                <option value="">선택</option>
                <option value="서울">서울</option>
                <option value="경기도">경기도</option>
                <option value="강원도">강원도</option>
                <option value="충청도">충청도</option>
                <option value="전라도">전라도</option>
                <option value="경상도">경상도</option>
                <option value="제주도">제주도</option>
              </select>
            </div>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 계절을 선택해 주세요</div>
              <select className="chatbot-input home-input" value={festival.season} onChange={e=>setFestival({...festival, season:e.target.value})}>
                <option value="">선택</option>
                <option value="봄">봄</option>
                <option value="여름">여름</option>
                <option value="가을">가을</option>
                <option value="겨울">겨울</option>
              </select>
            </div>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 무료 축제만 볼까요?</div>
              <label style={{fontWeight:600, color:'#2563eb'}}>
                <input type="checkbox" checked={festival.isFree} onChange={e=>setFestival({...festival, isFree:e.target.checked})} /> 무료만 보기
              </label>
            </div>
            <button className="chatbot-send-btn clarifying-btn" onClick={onNext} disabled={!(festival.region && festival.season)}>
              추천 받기
            </button>
          </>
        )}
        {recommendType === 'tour' && (
          <>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 어떤 관광지를 찾으시나요?</div>
              <input
                className="chatbot-input home-input"
                type="text"
                placeholder="예) 서울 근교에서 자연을 느낄 수 있는 당일치기 장소"
                value={tour.query}
                onChange={e => setTour({ ...tour, query: e.target.value })}
              />
            </div>
            <div className="clarifying-q">
              <div className="clarifying-label">✅ 최대 추천 개수</div>
              <input
                className="clarifying-budget"
                type="number"
                min={1}
                max={10}
                value={tour.top_k}
                onChange={e => setTour({ ...tour, top_k: Number(e.target.value) })}
              /> 개
            </div>
            <button className="chatbot-send-btn clarifying-btn" onClick={onNext} disabled={!(tour.query && tour.top_k)}>
              추천 받기
            </button>
          </>
        )}
      </main>
    </div>
  );
}

// 결과 화면: 유형별로 다르게
function ResultScreen({ recommendType, result, loading, error, onRestart }: {
  recommendType: RecommendType;
  result: any;
  loading: boolean;
  error: string | null;
  onRestart: () => void;
}) {
  return (
    <div className="result-screen">
      <header className="chatbot-header result-header">
        <span className="chatbot-logo" role="img" aria-label="result">🐻‍❄️</span>
        <div>
          <h1>추천 결과</h1>
        </div>
      </header>
      <main className="result-main">
        {loading && <div style={{textAlign:'center', color:'#2563eb', fontWeight:600, fontSize:'1.1rem'}}>추천 결과를 불러오는 중...</div>}
        {error && <div style={{color:'#d32f2f', marginBottom:12, textAlign:'center'}}>{error}</div>}
        {!loading && !error && recommendType === 'exhibition' && result && result.places && result.places.map((p: Place, i: number) => (
          <div className="result-card" key={i}>
            <div className="result-icon">{p.icon}</div>
            <div className="result-title">{p.name}</div>
            <div className="result-desc">{p.desc}</div>
            <div className="result-location">{p.location}</div>
            <div className="result-price">{p.price}</div>
          </div>
        ))}
        {!loading && !error && recommendType === 'festival' && Array.isArray(result) && result.map((f: Festival, i: number) => (
          <div className="result-card" key={i}>
            <div className="result-title">{f.festivalName}</div>
            <div className="result-desc">{f.description}</div>
            <div className="result-location">{f.location}</div>
            <div className="result-price">{f.date}</div>
          </div>
        ))}
        {!loading && !error && recommendType === 'tour' && Array.isArray(result) && result.map((t: Tour, i: number) => (
          <div className="result-card" key={i}>
            <div className="result-title">{t.title}</div>
            <div className="result-desc">{t.description}</div>
            <div className="result-location">{t.address}</div>
          </div>
        ))}
        <button className="chatbot-recommend-btn result-btn" onClick={onRestart}>
          다시 추천받기
        </button>
      </main>
    </div>
  );
}

export default App;
