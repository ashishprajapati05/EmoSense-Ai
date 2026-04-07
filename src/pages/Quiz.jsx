import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';
import { moodEmojis, moodColors } from '../utils/helpers';

// Quiz questions
const questions = [
 {
  id: 1,
  text: 'How is your energy level right now?',
  options: [
   { emoji: '⚡', text: 'Buzzing with energy', score: 3 },
   { emoji: '😌', text: 'Normal, steady', score: 1 },
   { emoji: '😴', text: 'Completely drained', score: -2 },
   { emoji: '🔋', text: 'Running on empty', score: -3 }
  ]
 },
 {
  id: 2,
  text: 'When you think about your tasks today...',
  options: [
   { emoji: '🚀', text: 'Pumped to tackle everything', score: 3 },
   { emoji: '😐', text: "It's just another day", score: 0 }, 
      { emoji: '😰', text: 'Feeling overwhelmed', score: -2 },
   { emoji: '🥴', text: "Can't even start", score: -3 }
    ]
 },
 {
  id: 3,
  text: 'How did you sleep last night?',
  options: [
   { emoji: '😴', text: 'Amazing, fully rested', score: 2 },
   { emoji: '🌙', text: 'Okay, could be better', score: 0 },
   { emoji: '😵', text: 'Barely slept at all', score: -2 },
   { emoji: '☕', text: 'Sleep is a myth for me', score: -3 }
  ]
 },
 {
  id: 4,
  text: 'Right now your mind feels...',
  options: [
   { emoji: '🎯', text: 'Laser sharp and focused', score: 3 },
   { emoji: '💭', text: 'A bit scattered', score: 0 },
   { emoji: '🌪️', text: 'Complete chaos', score: -2 },
   { emoji: '😶', text: 'Totally blank/numb', score: -2 }
  ]
 },
 {
  id: 5,
  text: 'If your mood was weather...',
  options: [
   { emoji: '☀️', text: 'Bright sunny clear skies', score: 3 },
   { emoji: '🌤️', text: 'Mostly clear, few clouds', score: 1 },
   { emoji: '🌧️', text: 'Grey and rainy', score: -2 },
   { emoji: '⛈️', text: 'Full thunderstorm', score: -3 }
  ]
 }
];

// Media suggestions based on mood
const mediaSuggestions = {
 frustrated: {
  songs: [
   { title: 'Lose Yourself - Eminem', videoId: '_Yhyp-_hX2s' },
   { title: 'Break Stuff - Limp Bizkit', videoId: 'ZpUYjpKg9KY' },
   { title: 'Numb - Linkin Park', videoId: 'kXYiU_JCYtU' }
  ],
  movies: [
   { title: 'Whiplash (2014)', videoId: '7d_jQycdQGo', tag: 'Channel frustration into greatness' },
   { title: 'Rocky (1976)', videoId: '2aZak9cMWmg', tag: 'Fight back when world pushes you' }
  ]
 },
 anxious: {
  songs: [
   { title: 'Breathe Me - Sia', videoId: 'SbBenuxFbns' },
   { title: 'The Night Will Always Win - MCR', videoId: 'RRKJiM9Njr8' },
   { title: 'Anxiety - Julia Michaels', videoId: 'nSDanX1BQIY' }
  ],
  movies: [
   { title: 'Inside Out (2015)', videoId: 'seMwpP0yeu4', tag: 'Understanding your emotions' },
   { title: 'The Secret Life of Walter Mitty', videoId: 'QD6cy4PBQPI', tag: 'Overcome fear, live fully' }
  ]
 },
 'burnt-out': {
  songs: [
   { title: 'Tired - Alan Walker', videoId: 'nEq45TjnMsM' },
   { title: 'Let Her Go - Passenger', videoId: 'RBumgq5yVrA' },
   { title: 'Unwell - Matchbox Twenty', videoId: 'W5wjyZkPMEU' }
  ],
  movies: [
   { title: 'The Secret (2006)', videoId: 'l3pWFRKMNBs', tag: 'Rediscover your inner power' },
   { title: 'Eat Pray Love', videoId: 'b4RZXS_JLig', tag: 'It is okay to rest and reset' }
  ]
 },
 neutral: {
  songs: [
   { title: 'Weightless - Marconi Union', videoId: 'UfcAVejslrU' },
   { title: 'Clair de Lune - Debussy', videoId: 'CvFH_6DNRCY' },
   { title: 'Lo-fi Hip Hop Radio', videoId: 'jfKfPfyJRdk' }
  ],
  movies: [
   { title: 'Peaceful Warrior (2006)', videoId: '3FeAeKQ9CJQ', tag: 'Find meaning in ordinary moments' },
   { title: 'The Pursuit of Happyness', videoId: 'DMOBlEcRuw8', tag: 'Small steps, big journey' }
  ]
 },
 focused: {
  songs: [
   { title: 'Interstellar Theme - Hans Zimmer', videoId: 'UDVtMYqUAyw' },
   { title: 'Time - Hans Zimmer', videoId: 'RxabLA7UQ9k' },
   { title: 'Deep Focus - Study Music', videoId: '5qap5aO4i9A' }
  ],
  movies: [
   { title: 'The Social Network (2010)', videoId: 'lB95KLmpLR8', tag: 'Build something remarkable' },
   { title: 'Steve Jobs (2015)', videoId: 'aEr6K1bwIVs', tag: 'Obsess over what matters' }
  ]
 },
 excited: {
  songs: [
   {
    title: "Can't Stop the Feeling - Timberlake", videoId: 'ru0K8uYEZWw' },
      { title: 'Happy - Pharrell Williams', videoId: 'ZbZSe6N_BXs' },
   { title: 'Uptown Funk - Bruno Mars', videoId: 'OPf0YbXqDm0' }
  ],
  movies: [
   { title: 'The Greatest Showman', videoId: 'AHD0p508W34', tag: 'Dream bigger than imagination' },
   { title: 'La La Land (2016)', videoId: '0pdqf4P9MB8', tag: 'Chase what sets your soul on fire' }
  ]
 },
 happy: {
  songs: [
   { title: 'Good as Hell - Lizzo', videoId: 'SmbmeOgWsqE' },
   { title: 'Walking on Sunshine - Katrina', videoId: 'iPUmE-tne5U' },
   { title: 'Best Day of My Life - American Authors', videoId: 'Y66j_BUCBMY' }
  ],
  movies: [
   { title: 'Soul (2020)', videoId: 'xOsLIiBStEs', tag: 'Celebrate being alive' },
   { title: 'Yes Man (2008)', videoId: 'yblLMMg3UOk', tag: 'Say yes to everything good' }
  ]
 },
 inspired: {
  songs: [
   { title: 'Eye of the Tiger - Survivor', videoId: 'btPJPFnesV4' },
   { title: 'Hall of Fame - The Script', videoId: 'mk48xRzuNvA' },
   { title: 'Believer - Imagine Dragons', videoId: '7wtfhZwyrcc' }
  ],
  movies: [
   { title: 'Dead Poets Society', videoId: 'veT7LgCCrFk', tag: 'Carpe Diem - seize the day' },
   { title: 'Good Will Hunting', videoId: 'PtOoaFHMd6c', tag: 'You are more than you think' }
  ]
 }
};

const Quiz = () => {
 const navigate = useNavigate();
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState([]);
 const [result, setResult] = useState(null);
 const [videoModal, setVideoModal] = useState(null);

 const handleAnswer = (score) => {
  const newAnswers = [...answers, score];
  setAnswers(newAnswers);

  if (currentQuestion < questions.length - 1) {
   setCurrentQuestion(currentQuestion + 1);
  } else {
   // Calculate result
   const totalScore = newAnswers.reduce((sum, s) => sum + s, 0);
   let mood;

   if (totalScore >= 10) mood = 'excited';
   else if (totalScore >= 6) mood = 'happy';
   else if (totalScore >= 3) mood = 'focused';
   else if (totalScore >= -2) mood = 'neutral';
   else if (totalScore >= -6) mood = 'anxious';
   else if (totalScore >= -10) mood = 'burnt-out';
   else mood = 'frustrated';

   setResult(mood);
  }
 };

 const handleRetake = () => {
  setCurrentQuestion(0);
  setAnswers([]);
  setResult(null);
 };

 const handleSubmitMood = () => {
  // Navigate to submit page (user can submit the discovered mood)
  navigate('/submit');
 };

 const openVideo = (videoId) => {
  setVideoModal(videoId);
 };

 const closeVideo = () => {
  setVideoModal(null);
 };

 const progress = ((currentQuestion + 1) / questions.length) * 100;

 return (
  <div className="quiz-page">
   < ThemeToggle />

   {!result ? (
    <div className="quiz-content">
     < h1 className="page-title gradient-text">🧠 DISCOVER YOUR MOOD</h1>

     {/* Progress Bar */}
     <div className="progress-bar">
      < div className="progress-fill" style={{ width: `${progress}%` }}></div>
     </div >
     <div className="progress-text">Question {currentQuestion + 1} of {questions.length}</div>

     {/* Current Question */}
     <div className="question-card">
      < h2 className="question-text">{questions[currentQuestion].text}</h2>
      < div className="options-grid">
       {
        questions[currentQuestion].options.map((option, idx) => (
         <button
          key={idx}
          className="option-card"
          onClick={() => handleAnswer(option.score)}
         >
          <div className="option-emoji">{option.emoji}</div>
          < div className="option-text">{option.text}</div>
         </button >
        ))}
      </div >
     </div >
    </div >
   ) : (
    <div className="result-page">
     < div className="result-left">
      < h1 className="page-title gradient-text">YOUR MOOD RESULT</h1>
      < div className="result-mood-card">
       < div className="result-emoji">{moodEmojis[result]}</div>
       < div className="result-mood-name" style={{ color: moodColors[result] }}>
        {result.charAt(0).toUpperCase() + result.slice(1).replace('-', ' ')}
       </div >
       <div className="result-description">
        {
         result === 'excited' && 'You are energized and ready to conquer the world!'}
        {
         result === 'happy' && 'You are in a great mood, enjoying the moment.'}
        {result === 'focused' && 'Your mind is sharp and ready for deep work.'}
        {
         result === 'neutral' && 'You are balanced and steady today.'}
        {
         result === 'anxious' && 'Feeling a bit uncertain, but youll get through it.'}
        {result === 'burnt-out' && 'You need rest and recovery. Be kind to yourself.'}
        {result === 'frustrated' && 'Channel this energy into something productive.'}
        {
         result === 'inspired' && 'You are motivated and full of creative energy!'}
       </div >
      </div >

      <h3 className="media-section-title">🎵 Your Mood Playlist & Watchlist</h3>

      < div className="result-actions">
       < button className="btn-primary" onClick={handleSubmitMood}>
        Submit this mood →
       </button >
       <button className="btn-secondary" onClick={handleRetake}>
        Retake Quiz
       </button >
      </div >
     </div >

     <div className="result-right">
      < div className="media-panel">
       {/* Songs Section */}
       <div className="media-section">
        < h3 className="media-label">SONGS FOR YOU</h3>
        < div className="media-grid">
         {
          mediaSuggestions[result].songs.map((song, idx) => (
           <div key={idx} className="media-card" onClick={() => openVideo(song.videoId)}>
            < div className="media-thumbnail">
             < img src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`} alt={song.title} />
             <div className="play-overlay">▶</div>
            </div >
            <div className="media-title">{song.title}</div>
           </div >
          ))
         }
        </div >
       </div >

       {/* Movies Section */}
       < div className="media-section">
        < h3 className="media-label">RECOMMENDED WATCHES</h3>
        < div className="media-grid">
         {
          mediaSuggestions[result].movies.map((movie, idx) => (
           <div key={idx} className="media-card" onClick={() => openVideo(movie.videoId)}>
            < div className="media-thumbnail">
             < img src={`https://img.youtube.com/vi/${movie.videoId}/mqdefault.jpg`} alt={movie.title} />
             <div className="play-overlay">▶</div>
            </div >
            <div className="media-title">{movie.title}</div>
            < div className="media-tag">{movie.tag}</div>
           </div >
          ))
         }
        </div >
       </div >
      </div >
     </div >
    </div >
   )
   }

   {/* Video Modal */}
   {
    videoModal && (
     <div className="video-modal" onClick={closeVideo}>
      < div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
       < button className="video-close" onClick={closeVideo}>✕</button>
       < iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoModal}?autoplay=1`
        }
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
       ></iframe >
      </div >
     </div >
    )
   }

   <Navigation />
  </div >
 );
};

export default Quiz;
