import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

function Timer({ autoStart = true, onTimeUpdate }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newSeconds);
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, onTimeUpdate]);

  // Auto-start when component mounts
  useEffect(() => {
    if (autoStart) {
      setIsRunning(true);
    }
  }, [autoStart]);

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-1.5 border border-dark-700">
      <Clock className="w-4 h-4 text-dark-400" />
      <span className={`font-mono text-sm font-bold min-w-[4rem] text-center ${
        isRunning ? 'text-green-400' : 'text-dark-300'
      }`}>
        {formatTime(seconds)}
      </span>
      
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={toggleTimer}
          className={`p-1 rounded transition-colors ${
            isRunning 
              ? 'text-yellow-400 hover:bg-yellow-500/10' 
              : 'text-green-400 hover:bg-green-500/10'
          }`}
          title={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

Timer.propTypes = {
  autoStart: PropTypes.bool,
  onTimeUpdate: PropTypes.func
};

export default Timer;
