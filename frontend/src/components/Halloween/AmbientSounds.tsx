import React, { useState, useRef, useEffect } from 'react';

const AmbientSounds: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element with a loop of Halloween ambient sounds
    // In production, this would load actual audio files
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // In production, set the src to actual Halloween ambient sound file
      // audioRef.current.src = '/sounds/halloween-ambient.mp3';
      audioRef.current.play().catch(err => {
        console.error('Audio playback failed:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-halloween-purple hover:bg-halloween-darkPurple text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Toggle sound controls"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isPlaying ? (
            <>
              <path
                d="M11 5L6 9H2V15H6L11 19V5Z"
                fill="currentColor"
              />
              <path
                d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.07 5.93C19.9447 7.80528 20.9979 10.3462 20.9979 13C20.9979 15.6538 19.9447 18.1947 18.07 20.07"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              <path
                d="M11 5L6 9H2V15H6L11 19V5Z"
                fill="currentColor"
              />
              <line
                x1="23"
                y1="9"
                x2="17"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="17"
                y1="9"
                x2="23"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </button>

      {/* Controls panel */}
      {showControls && (
        <div className="absolute bottom-16 right-0 bg-halloween-darkPurple border-2 border-halloween-purple rounded-lg p-4 shadow-xl animate-fade-in min-w-[200px]">
          <h3 className="text-sm font-bold text-halloween-orange mb-3">
            🎃 Spooky Sounds
          </h3>
          
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-full btn-secondary mb-3 text-sm py-2"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* Volume control */}
          <div className="space-y-2">
            <label className="text-xs text-gray-300 flex items-center justify-between">
              <span>Volume</span>
              <span className="text-halloween-orange">{Math.round(volume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-halloween-black rounded-lg appearance-none cursor-pointer accent-halloween-orange"
            />
          </div>

          {/* Sound info */}
          <p className="text-xs text-gray-400 mt-3 italic">
            Ambient Halloween atmosphere
          </p>
        </div>
      )}
    </div>
  );
};

export default AmbientSounds;
