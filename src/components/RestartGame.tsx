import React, { useState } from 'react';
import { setupGame, getGameState } from '../utils/contractUtils';

interface RestartGameProps {
  appGateway: string;
  rpcUrl: string;
  onGameStateUpdate?: (newState: any) => void;
}

const RestartGame: React.FC<RestartGameProps> = ({ appGateway, rpcUrl, onGameStateUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRestart = async () => {
    try {
      setIsLoading(true);
      const privateKey = import.meta.env.VITE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key is not set');
      }
      await setupGame(rpcUrl, appGateway, privateKey);
      
      // Update game state after setup
      if (onGameStateUpdate) {
        const newGameState = await getGameState(rpcUrl, appGateway);
        onGameStateUpdate(newGameState);
      }
    } catch (error) {
      console.error('Error resetting characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      textAlign: 'center'
    }}>
      <button
        onClick={handleRestart}
        disabled={isLoading}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: isLoading ? '#999' : '#FF4081',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.backgroundColor = '#FF1744';
          }
        }}
        onMouseOut={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.backgroundColor = '#FF4081';
          }
        }}
      >
        {isLoading ? (
          <>
            <span className="loader" style={{
              width: '20px',
              height: '20px',
              border: '3px solid #FFF',
              borderBottom: '3px solid transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'rotation 1s linear infinite'
            }}/>
            Resetting...
          </>
        ) : (
          <>🔄 Reset Characters</>
        )}
      </button>
      <style>
        {`
          @keyframes rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default RestartGame; 