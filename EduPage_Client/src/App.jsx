import React, { useState, useEffect } from "react";
import DiplomkaModal from './components/BlackWindow.jsx';
import './App.css'; // Importujeme nový CSS vzhled

// TVOJE ADRESA WORKERU
const WORKER_URL = "https://edupage-worker.spaniklukas.workers.dev"; 


export default function App() {
  // 1. Stavy pro formulář a černé okno
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false); // Ovládání černého okna

  // 2. Analytika: Zjistíme školu a uživatele pro databázi
  // ukládání textu chyby
  const [error, setError] = useState('');

  const currentPath = window.location.pathname.replace('/', '');
  const schoolId = currentPath !== '' ? currentPath : 'nezadano';

  useEffect(() => {
    if (WORKER_URL) {
      fetch(`${WORKER_URL}/visit?school=${schoolId}`)
        .then(res => console.log("Návštěva odeslána pro:", schoolId))
        .catch(err => console.error("Chyba při odesílání návštěvy:", err));
    }
  }, [schoolId]);

  // 3. Odeslání návštěvy hned při načtení
  useEffect(() => {
    if (WORKER_URL) {
      fetch(`${WORKER_URL}/visit?school=${schoolId}`)
        .then(res => console.log("Návštěva odeslána pro:", schoolId))
        .catch(err => console.error("Chyba při odesílání návštěvy:", err));
    }
  }, [schoolId]);

  // 4. Přepnutí na zadání hesla (KROK 1 -> KROK 2)
  const handleNext = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      setStep(2);
    }
  };

  // 5. Návrat zpět (KROK 2 -> KROK 1)
  const handleBack = () => {
    setStep(1);
    setPassword("");
  };

  // 6. Finální kliknutí na "Přihlásit se" (Otevře černé okno)
  const handleSubmit = (e) => {
    e.preventDefault();
    

    setError(''); // Pro jistotu vymažeme jakoukoliv starou chybu
 
    fetch(`${WORKER_URL}/track-login-click?school=${schoolId}`).catch(console.error);
    fetch(`${WORKER_URL}/track-modal-view?school=${schoolId}`).catch(console.error);

    
    setShowModal(true);
  };

  return (
    <div className="edu-page-body">
      
      {/* Vykreslení černého okna, pokud je showModal === true */}
      {showModal && (
        <DiplomkaModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* Bílý poloprůhledný panel */}
      <div className="overlay-panel">
        <button className="close-btn-log" aria-label="Zavřít">✕</button>

        <div className="logo-wrap">
          <img src="/eduLogo.svg" alt="Logo" className="logo-icon" />
          <span className="school-name">
            Základní škola a mateřská škola Brno, Antoninská 3, p.o., Antonínská 3, Brno
          </span>
        </div>

        {/* --- KROK 1: ZADÁNÍ E-MAILU --- */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <h1 className="heading">Přihlášení</h1>

            <label className="field-label" htmlFor="username">Uživatelské jméno:</label>
            <div className="input-wrap">
              {/* Tady je napojená tvoje SVG ikona */}
              <img src="/user.svg" alt="User" className="input-icon-svg" />
              <input
                id="username"
                className="text-input"
                type="text"
                placeholder="Zadejte svůj e-mail / uživatelské jméno EduPage"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <a href="#help" className="forgot-link">Neznám přihlašovací jméno nebo heslo</a>

            <div className="row-btn">
              <button type="submit" className="submit-btn">Další</button>
            </div>
          </form>
        )}

        {/* --- KROK 2: ZADÁNÍ HESLA --- */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="back-nav">
              <button type="button" className="back-btn" onClick={handleBack}>
                ←
              </button>
              <div className="display-email">{username}</div>
            </div>

            <label className="field-label" htmlFor="password">Zadejte heslo:</label>
            <div className="input-wrap">
              {/* Tady je napojená tvoje SVG ikona pro heslo */}
              <img src="/lock.svg" alt="Password" className="input-icon-svg" />
              <input
                id="password"
                className="text-input"
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <a href="#help" className="forgot-link">Neznám přihlašovací jméno nebo heslo</a>

            <div className="row-btn">
              <button type="submit" className="submit-btn">Přihlásit se</button>
            </div>
          </form>
        )}

        <hr className="divider" />

        <div className="social-btns">
          <button type="button" className="social-btn">Přihlásit se přes Google účet</button>
          <button type="button" className="social-btn">Přihlásit se přes Microsoft účet</button>
        </div>

        <div className="footer-note" style={{marginTop: '28px'}}>
          © EduPage &nbsp;·&nbsp; <a href="#privacy">Zásady ochrany osobních údajů</a>
        </div>
      </div>

      <div className="cancel-btn-bar">
        <button className="cancel-btn">Zrušit</button>
      </div>
    </div>
  );
}