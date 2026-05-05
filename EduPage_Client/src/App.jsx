import React, { useState, useEffect } from "react";
import DiplomkaModal from './components/BlackWindow.jsx';
import './App.css'; 

// Databáze pro výzkum
const WORKER_URL = "https://diplomova_prace_databaze.spaniklukas.workers.dev"; 


export default function EduPagePortalLogin() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState('');

  // Identifikace školy pro statistiky v diplomce
  const currentPath = window.location.pathname.replace('/', '');
  const school_Id = currentPath !== '' ? currentPath : 'nezadano';


  // 1. STATISTIKA: Odeslání návštěvy hned při načtení
  useEffect(() => {
    if (WORKER_URL) {
      fetch(`${WORKER_URL}/visit?school=${school_Id}`)
        .then(res => console.log("Návštěva odeslána pro:", school_Id))
        .catch(err => console.error("Chyba při odesílání návštěvy:", err));
    }
  }, [school_Id]);

  // Přepnutí na zadání hesla (KROK 1 -> KROK 2)
  const handleNext = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      setStep(2);
    }
  };

  // Návrat zpět (KROK 2 -> KROK 1)
  const handleBack = () => {
    setStep(1);
    setPassword("");
  };

  // Finální kliknutí na "Přihlásit se" 
  const handleSubmit = (e) => {
    e.preventDefault();
    

    setError(''); // 

    // 2. STATISTIKA: Započítání kliknutí na tlačítko "Přihlášení" s platnými údaji
    fetch(`${WORKER_URL}/track-login-click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ school: school_Id })
          }).catch(console.error);

    // 3. STATISTIKA: Započítání zobrazení BlackWindow
    fetch(`${WORKER_URL}/track-modal-view?school=${school_Id}`).catch(console.error);

    setShowModal(true);
  };

  return (
    <div className="edu-page-body">
      
      {showModal && (
        <DiplomkaModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}

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