import { useEffect, useState } from 'react';
import { getGameState } from './index';

interface GameStateProps {
  rpcUrl: string;
  contractAddress: string;
}

export default function GameBoard({ rpcUrl, contractAddress }: GameStateProps) {
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameState = async () => {
      const state = await getGameState(rpcUrl, contractAddress);
      setGameState(state);
      setLoading(false);
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [rpcUrl, contractAddress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Game Status */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Puff Puff Pass Game
          </h1>
          <div className="flex justify-center gap-4">
            <StatusBadge label="Game Status" value={gameState.gameStarted ? 'Active' : 'Not Started'} />
            <StatusBadge label="Current Turn" value={gameState.currentTurn} />
            {gameState.gameEnded && (
              <StatusBadge label="Winner" value={gameState.winner} />
            )}
          </div>
        </div>

        {/* Players Board */}
        <div className="grid md:grid-cols-2 gap-8">
          {[421614, 11155420].map((chainSlug) => (
            <PlayerBoard
              key={chainSlug}
              chainSlug={chainSlug}
              playerState={gameState}
              isCurrentTurn={gameState.currentTurn === chainSlug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerBoard({ chainSlug, playerState, isCurrentTurn }) {
  return (
    <div className={`
      rounded-xl p-6 
      ${isCurrentTurn 
        ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500' 
        : 'bg-gray-800'
      }
      shadow-xl transition-all duration-300
    `}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Player {chainSlug}
        {isCurrentTurn && (
          <span className="text-sm bg-purple-500 px-2 py-1 rounded-full">Current Turn</span>
        )}
      </h2>

      {/* Resources */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ResourceCard
          label="Chemical X"
          value={playerState.chemicalX[chainSlug]}
          icon="⚗️"
        />
        <ResourceCard
          label="Life"
          value={playerState.life[chainSlug]}
          icon="❤️"
        />
      </div>

      {/* Characters */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Characters</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(playerState.characters[chainSlug] || {}).map(([id, char]: [string, any]) => (
            <CharacterCard
              key={id}
              name={char.name}
              turnsLeft={char.turnsLeft}
            />
          ))}
        </div>
      </div>

      {/* Powers */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Powers</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(playerState.powers[chainSlug] || {}).map(([id, power]: [string, any]) => (
            <PowerCard
              key={id}
              name={power.name}
              powerLeft={power.powerLeft}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function ResourceCard({ label, value, icon }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm text-gray-300">{label}</div>
        <div className="font-bold">{value}</div>
      </div>
    </div>
  );
}

function CharacterCard({ name, turnsLeft }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-all">
      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-400">
        Turns left: <span className="text-purple-400">{turnsLeft}</span>
      </div>
    </div>
  );
}

function PowerCard({ name, powerLeft }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-all">
      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-400">
        Power left: <span className="text-pink-400">{powerLeft}</span>
      </div>
    </div>
  );
} 