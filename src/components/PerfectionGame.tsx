import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PerfectionGame.css';

interface ShapeType {
  name: string;
  sprite: string;
}

interface DraggedShape {
  element: HTMLElement;
  shapeType: string;
  originalIndex: number;
}

const PerfectionGame: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [placedShapes, setPlacedShapes] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success' | 'win' | 'lose'>('info');
  const [gameSwitch, setGameSwitch] = useState(false);
  const [draggedShape, setDraggedShape] = useState<DraggedShape | null>(null);
  const [shuffledShapes, setShuffledShapes] = useState<ShapeType[]>([]);
  const [slots, setSlots] = useState<Array<{ expectedShape: string; hasShape: boolean; index: number }>>([]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerSoundRef = useRef<HTMLAudioElement | null>(null);
  const endingSoundRef = useRef<HTMLAudioElement | null>(null);

  // Define the 25 shape types
  const shapeTypes: ShapeType[] = [
    { name: 'shape0', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile000.png` },
    { name: 'shape1', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile001.png` },
    { name: 'shape2', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile002.png` },
    { name: 'shape3', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile003.png` },
    { name: 'shape4', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile004.png` },
    { name: 'shape5', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile005.png` },
    { name: 'shape6', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile006.png` },
    { name: 'shape7', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile007.png` },
    { name: 'shape8', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile008.png` },
    { name: 'shape9', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile009.png` },
    { name: 'shape10', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile010.png` },
    { name: 'shape11', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile011.png` },
    { name: 'shape12', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile012.png` },
    { name: 'shape13', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile013.png` },
    { name: 'shape14', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile014.png` },
    { name: 'shape15', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile015.png` },
    { name: 'shape16', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile016.png` },
    { name: 'shape17', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile017.png` },
    { name: 'shape18', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile018.png` },
    { name: 'shape19', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile019.png` },
    { name: 'shape20', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile020.png` },
    { name: 'shape21', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile021.png` },
    { name: 'shape22', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile022.png` },
    { name: 'shape23', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile023.png` },
    { name: 'shape24', sprite: `https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/shapes/tile024.png` }
  ];

  // Initialize game
  useEffect(() => {
    initializeGame();
    
    // Initialize audio
    timerSoundRef.current = new Audio('https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/sounds/timer.mp3');
    endingSoundRef.current = new Audio('https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/sounds/ending%20pop.mp3');
    
    if (timerSoundRef.current) {
      timerSoundRef.current.loop = true;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const initializeGame = useCallback(() => {
    // Create slots array
    const newSlots = [];
    for (let i = 0; i < 25; i++) {
      newSlots.push({
        expectedShape: shapeTypes[i].name,
        hasShape: false,
        index: i
      });
    }
    setSlots(newSlots);

    // Shuffle shapes
    const shuffled = [...shapeTypes].sort(() => Math.random() - 0.5);
    setShuffledShapes(shuffled);
    
    setPlacedShapes(0);
    setMessage('Game reset! Click Start to begin.');
    setMessageType('info');
  }, []);

  const startGame = useCallback(() => {
    if (gameActive) return;
    
    setGameActive(true);
    setTimeLeft(60);
    
    // Start timer sound
    if (timerSoundRef.current) {
      timerSoundRef.current.currentTime = 0;
      timerSoundRef.current.play().catch(e => console.log('Timer sound failed to play:', e));
    }
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setMessage('Game started! Place all shapes correctly before time runs out!');
    setMessageType('info');
  }, [gameActive]);

  const resetGame = useCallback(() => {
    setGameActive(false);
    setGameSwitch(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Stop timer sound
    if (timerSoundRef.current) {
      timerSoundRef.current.pause();
      timerSoundRef.current.currentTime = 0;
    }
    
    initializeGame();
    setTimeLeft(60);
  }, [initializeGame]);

  const endGame = useCallback((won: boolean = false) => {
    setGameActive(false);
    setGameSwitch(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Stop timer sound
    if (timerSoundRef.current) {
      timerSoundRef.current.pause();
      timerSoundRef.current.currentTime = 0;
    }
    
    if (won) {
      setMessage(`Congratulations! You won with ${timeLeft} seconds remaining!`);
      setMessageType('win');
    } else {
      setMessage('Time\'s up! Game over!');
      setMessageType('lose');
      // Play ending sound
      if (endingSoundRef.current) {
        endingSoundRef.current.currentTime = 0;
        endingSoundRef.current.play().catch(e => console.log('Ending sound failed to play:', e));
      }
    }
  }, [timeLeft]);

  const handleSwitchChange = () => {
    const newSwitchState = !gameSwitch;
    setGameSwitch(newSwitchState);
    
    if (newSwitchState) {
      startGame();
    } else {
      resetGame();
    }
  };

  const handleDragStart = (e: React.DragEvent, shapeType: string, originalIndex: number) => {
    if (!gameActive) {
      e.preventDefault();
      return;
    }
    
    const element = e.currentTarget as HTMLElement;
    setDraggedShape({ element, shapeType, originalIndex });
    
    element.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    setTimeout(() => {
      element.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('dragging');
    element.style.opacity = '1';
    setDraggedShape(null);
    
    // Clear all drag states
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('drag-over', 'valid-drop', 'invalid-drop');
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!gameActive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, expectedShape: string) => {
    if (!gameActive || !draggedShape) return;
    
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    
    if (expectedShape === draggedShape.shapeType) {
      element.classList.add('valid-drop');
      element.classList.remove('invalid-drop');
    } else {
      element.classList.add('invalid-drop');
      element.classList.remove('valid-drop');
    }
    
    element.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    if (!element.contains(e.relatedTarget as Node)) {
      element.classList.remove('drag-over', 'valid-drop', 'invalid-drop');
    }
  };

  const handleDrop = (e: React.DragEvent, expectedShape: string, slotIndex: number) => {
    if (!gameActive || !draggedShape) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over', 'valid-drop', 'invalid-drop');
    
    if (expectedShape === draggedShape.shapeType) {
      // Place the shape
      const newSlots = [...slots];
      newSlots[slotIndex].hasShape = true;
      setSlots(newSlots);
      
      // Remove shape from tray
      setShuffledShapes(prev => prev.filter((_, index) => index !== draggedShape.originalIndex));
      
      setPlacedShapes(prev => {
        const newCount = prev + 1;
        if (newCount === 25) {
          setTimeout(() => endGame(true), 1000);
        }
        return newCount;
      });
      
      setMessage('Correct!');
      setMessageType('success');
    } else {
      setMessage('Wrong shape! Try again.');
      setMessageType('error');
    }
  };



  // Timer rotation calculation
  const timerRotation = ((60 - timeLeft) / 60) * 360;

  return (
    <div className="perfection-game">
      <div className="top-bar">
        <div className="zoom-note">
          <strong>Note:</strong> For the best experience, please <b>zoom out to 75%</b> in your browser if needed.
        </div>
      </div>
      
      <div className="game-container">
        <header className="game-header">
          <img 
            src="https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/logos/main%20logo.png" 
            alt="Perfection Game Logo" 
            className="main-logo" 
            draggable="false"
          />
        </header>
        
        <div className="game-controls">
          <div className="timer-container">
            <div className="timer">
              <div className="timer-dial-img-container">
                <img 
                  src="https://raw.githubusercontent.com/Torchwood4201/Perfection/main/Perfection/assets/timer/time%20dial.png" 
                  alt="Timer Dial" 
                  className="timer-dial-img"
                  style={{ transform: `rotate(${timerRotation}deg)` }}
                  draggable="false"
                />
              </div>
            </div>
          </div>
          
          <div className="controls">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={gameSwitch}
                onChange={handleSwitchChange}
              />
              <span className="slider"></span>
              <span className="switch-label">
                {gameSwitch ? 'Reset' : 'Start'}
              </span>
            </label>
          </div>
        </div>
        
        <div className={`game-board ${placedShapes === 25 ? (gameActive ? 'filled' : 'win') : ''}`}>
          {slots.map((slot, index) => (
            <div
              key={index}
              className="slot"
              data-expected-shape={slot.expectedShape}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, slot.expectedShape)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slot.expectedShape, index)}
            >
              {slot.hasShape && (
                <div className="shape placed">
                  <img 
                    src={shapeTypes.find(s => s.name === slot.expectedShape)?.sprite} 
                    alt={slot.expectedShape}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="shape-tray">
          {shuffledShapes.map((shape, index) => (
            <div
              key={`${shape.name}-${index}`}
              className="shape"
              draggable={gameActive}
              onDragStart={(e) => handleDragStart(e, shape.name, index)}
              onDragEnd={handleDragEnd}
            >
              <img 
                src={shape.sprite} 
                alt={shape.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable="false"
              />
            </div>
          ))}
        </div>
        
        <div className="feedback">
          <div className={`message ${messageType} ${message ? 'show' : ''}`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfectionGame;