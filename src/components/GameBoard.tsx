import { useEffect, useState } from 'react';
import { getGameState, refreshLifeForPlayers, playWithCharacter } from '../utils/contractUtils';
import buttercupImage from '../assets/blossom.png';
import { GameState, Character, Power } from '../types/game';

interface GameStateProps {
  rpcUrl: string;
  contractAddress: string;
  gameState?: GameState;
}

const CHARACTER_NAMES: { [key: number]: string } = {
  1: 'Bubbles',
  2: 'Blossom',
  3: 'Buttercup',
  4: 'ProfessorX',
  5: 'Mojojojo',
  6: 'Sedusa',
  7: 'RowdyRuff',
  8: 'AlienX'
};

const POWER_NAMES: { [key: number]: string } = {
  1: 'Buff',
  2: 'Huff'
};

const CHAIN_IMAGES: { [key: number]: string } = {
  421614: 'https://arbiscan.io/assets/arbitrum/images/svg/logos/chain-dark.svg?v=25.1.4.0',
  11155420: 'https://sepolia-optimism.etherscan.io/assets/opsepolia/images/svg/logos/chain-dark.svg?v=25.1.4.0'
};

const CHARACTER_IMAGES: { [key: number]: string } = {
  4: 'https://imgs.search.brave.com/k9yM4lnYO01bwwT7H39diX9Zt3trJGkUE3EjK9SrPxo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2lsdmVycGV0dGlj/b2F0cmV2aWV3LmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAx/NS8wOS90aGUtcG93/ZXJwdWZmLWdpcmxz/LXByb2Zlc3NvcjMu/anBn', // professorX
  7: 'https://imgs.search.brave.com/MLLCjDYcYi0j4KpbxXuYEGXYCbdd2ZdpYJPcFRyhRQQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9wcmV2/aWV3LnJlZGQuaXQv/YW5hbHl6aW5nLWNo/YXJhY3Rlci1kZWln/bnMtdGhlLXBvd2Vy/cHVmZi1naXJscy12/MC0zMmFhdzVwMWpl/amMxLmpwZz93aWR0/aD0xMjAwJmZvcm1h/dD1wanBnJmF1dG89/d2VicCZzPTgyZTFm/MmZlZWZjNTY3ZmRh/NDdiYWVmYTliOWVl/MzFkYjMzYjQ4MGU', // RowdyRuff
  3: buttercupImage, // buttercup
  5: 'https://imgs.search.brave.com/CuKY2AqdGZT3V2Vcr6rBTR2bii7WCVXImiht8RIPWRE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMwLmdhbWVyYW50/aW1hZ2VzLmNvbS93/b3JkcHJlc3Mvd3At/Y29udGVudC91cGxv/YWRzLzIwMjMvMTEv/bW9qby1qb2pvLWlu/LXRoZS1wb3dlcnB1/ZmYtZ2lybHMuanBn', // mojojojo
  8: 'https://imgs.search.brave.com/spP8-DLYdRuig0yzhu6G1eBcsU5TfodBYCJ4b_L5GFc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9lMS5w/eGZ1ZWwuY29tL2Rl/c2t0b3Atd2FsbHBh/cGVyLzg1My82MS9k/ZXNrdG9wLXdhbGxw/YXBlci1hbGllbi14/LWJ5LWVsbWlrZTkt/YmVuLTEwLWFsaWVu/LXgtdGh1bWJuYWls/LmpwZw', // alienX
  2: 'https://imgs.search.brave.com/n_TBEPT9MefvYjVaYqO-Ela4WjBlS61cwfYPTWgJ-DQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NzF5M3hUQnZTeEwu/anBn', // blossom
  1: 'https://imgs.search.brave.com/XAEOTMjry5vhmrlw_7cWFnx5IVI5BYVOSl0bB2ZRMWI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvZmVhdHVy/ZWQvcG93ZXJwdWZm/LWdpcmxzLWJ1YmJs/ZXMtMXRnY2d1YjFj/ZHk0NjdjNC5qcGc' // bubbles
};

// Add this interface for the CharacterCard props
interface CharacterCardProps {
  name: string;
  turnsLeft: number;
  chainSlug: number;
  contractAddress: string;
  rpcUrl: string;
  onAction?: () => void;
  gameState: GameState;
}

// Add character stats interface
interface CharacterStats {
  attack: number;
  heal: number;
  cost: number;
}

// Add character stats mapping
const CHARACTER_STATS: { [key: number]: CharacterStats } = {
  1: { attack: 5, heal: 10, cost: 5 },   // Bubbles
  2: { attack: 10, heal: 5, cost: 5 },   // Blossom
  3: { attack: 8, heal: 7, cost: 5 },    // Buttercup
  4: { attack: 2, heal: 10, cost: 5 },   // ProfessorX
  5: { attack: 10, heal: 5, cost: 5 },   // Mojojojo
  6: { attack: 8, heal: 7, cost: 5 },    // Sedusa
  7: { attack: 5, heal: 10, cost: 5 },   // RowdyRuff
  8: { attack: 25, heal: 35, cost: 6 },  // AlienX
};

// Add power stats interface and mapping
interface PowerStats {
  attackMultiplier: number;
  healMultiplier: number;
  cost: number;
}

const POWER_STATS: { [key: number]: PowerStats } = {
  1: { attackMultiplier: 2, healMultiplier: 1, cost: 5 }, // Buff
  2: { attackMultiplier: 1, healMultiplier: 2, cost: 5 }, // Huff
};

function HealthBar({ value, maxValue = 100 }: { value: number; maxValue?: number }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="relative w-full bg-gray-800 rounded-full h-6 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      >
        <div className="h-full w-full bg-[rgba(255,255,255,0.1)] animate-pulse"></div>
      </div>
      {/* Life value overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
        {value} / {maxValue}
      </div>
    </div>
  );
}

function CharacterCard({ 
  name, 
  turnsLeft, 
  chainSlug, 
  contractAddress, 
  rpcUrl, 
  onAction,
  gameState 
}: CharacterCardProps) {
  const [isTransacting, setIsTransacting] = useState(false);
  const characterId = Object.entries(CHARACTER_NAMES).find(([_, charName]) => charName === name)?.[0];
  const hasImage = characterId && CHARACTER_IMAGES[Number(characterId)];
  const stats = characterId ? CHARACTER_STATS[Number(characterId)] : null;

  // Get available powers for this chain from gameState prop
  const availablePowers = gameState.powers[chainSlug] || {};
  const powerOptions = Object.entries(availablePowers)
    .filter(([_, power]) => power.powerLeft > 0)
    .map(([id, power]) => ({
      id: Number(id),
      name: power.name,
      powerLeft: power.powerLeft
    }));

  // Set default selected power to null (no power selected)
  const [selectedPower, setSelectedPower] = useState<number | null>(null);

  const handleAction = async (isAttack: boolean) => {
    if (isTransacting || !characterId) return;
    setIsTransacting(true);

    try {
      const privateKey = import.meta.env.VITE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key not found in environment variables');
      }

      await playWithCharacter(
        rpcUrl,
        contractAddress,
        privateKey,
        chainSlug,
        Number(characterId),
        selectedPower ?? 0, // Use 0 when no power is selected
        isAttack
      );

      if (onAction) {
        onAction();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
      alert('Failed to perform action. Check console for details.');
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-all animate-slide-in">
      <div className="flex items-center gap-2 mb-3">
        {hasImage && (
          <img 
            src={CHARACTER_IMAGES[Number(characterId)]} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-400">
            Turns left: <span className="text-purple-400">{turnsLeft}</span>
          </div>
        </div>
      </div>

      {/* Character Stats - removed cost */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="bg-red-900/30 rounded p-1 text-center">
            <div className="text-red-400">ATK</div>
            <div>{stats.attack}</div>
          </div>
          <div className="bg-green-900/30 rounded p-1 text-center">
            <div className="text-green-400">HEAL</div>
            <div>{stats.heal}</div>
          </div>
        </div>
      )}

      {/* Power Selection with No Power option */}
      <div className="mb-2">
        <select
          value={selectedPower ?? ''}
          onChange={(e) => setSelectedPower(e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm"
          disabled={isTransacting}
        >
          <option value="">No Power</option>
          {powerOptions.map(power => (
            <option key={power.id} value={power.id}>
              {power.id === 1 
                ? `Buff (x${POWER_STATS[1].attackMultiplier} ATK)`
                : `Huff (x${POWER_STATS[2].healMultiplier} HEAL)`
              } ({power.powerLeft} left)
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction(true)}
          disabled={isTransacting || turnsLeft <= 0}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
        >
          {isTransacting ? '...' : `Attack (${stats?.attack || 0})`}
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={isTransacting || turnsLeft <= 0}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
        >
          {isTransacting ? '...' : `Heal (${stats?.heal || 0})`}
        </button>
      </div>
    </div>
  );
}

export default function GameBoard({ rpcUrl, contractAddress, gameState: initialGameState }: GameStateProps) {
  const [localGameState, setLocalGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);

  useEffect(() => {
    if (initialGameState) {
      setLocalGameState(initialGameState);
      setLoading(false);
    } else {
      fetchGameState();
    }
  }, [initialGameState]);

  const fetchGameState = async () => {
    const state = await getGameState(rpcUrl, contractAddress);
    setLocalGameState(state);
    setLoading(false);
  };

  useEffect(() => {
    if (!initialGameState) {
      const interval = setInterval(fetchGameState, 3000);
      return () => clearInterval(interval);
    }
  }, [rpcUrl, contractAddress, initialGameState]);

  const handleRefreshGameState = async () => {
    if (isTransacting) return;
    setIsTransacting(true);
    
    try {
      await fetchGameState();
    } catch (error) {
      console.error('Failed to refresh game state:', error);
      alert('Failed to refresh game state. Check console for details.');
    } finally {
      setIsTransacting(false);
    }
  };

  if (loading || !localGameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 relative min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Puff Puff Pass Game</h1>
      
      {/* Game state display */}
      <div className="grid grid-cols-2 gap-4 mb-16">
        {[421614, 11155420].map((chainSlug) => (
          <div 
            key={chainSlug} 
            className={`border p-4 rounded transition-all duration-300 ease-out ${
              Number(localGameState.currentTurn) === chainSlug 
                ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-500/20' 
                : 'opacity-60 bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={CHAIN_IMAGES[chainSlug]} 
                alt={`Chain ${chainSlug}`} 
                className={`h-8 w-8 ${Number(localGameState.currentTurn) !== chainSlug && 'grayscale'}`}
              />
              <h2 className="text-xl">
                Player {chainSlug}
                {Number(localGameState.currentTurn) === chainSlug && (
                  <span className="ml-2 text-sm bg-purple-500 px-2 py-1 rounded-full animate-pulse">
                    Current Turn
                  </span>
                )}
              </h2>
            </div>
            <p className="animate-fade-in">Chemical X: {localGameState.chemicalX[chainSlug]}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Life:</span>
                <span className="text-sm text-gray-300">{localGameState.life[chainSlug]}</span>
              </div>
              <HealthBar value={localGameState.life[chainSlug]} maxValue={100} />
            </div>
            <p className="animate-fade-in">
              Current Turn: {Number(localGameState.currentTurn)}
            </p>
            {localGameState.gameEnded && localGameState.winner === chainSlug && (
              <p className="text-green-500 font-bold animate-bounce">Winner!</p>
            )}

            {/* Characters */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Characters:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(localGameState.characters[chainSlug] || {})
                  .filter(([_, char]) => char.turnsLeft > 0)
                  .map(([id, char]: [string, any]) => (
                    <CharacterCard
                      key={id}
                      name={char.name}
                      turnsLeft={char.turnsLeft}
                      chainSlug={chainSlug}
                      contractAddress={contractAddress}
                      rpcUrl={rpcUrl}
                      onAction={fetchGameState}
                      gameState={localGameState}
                    />
                  ))}
              </div>
            </div>

            {/* Powers */}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Powers:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(localGameState.powers[chainSlug] || {})
                  .filter(([_, power]) => power.powerLeft > 0)
                  .map(([id, power]: [string, any]) => (
                    <PowerCard
                      key={id}
                      name={power.name}
                      powerLeft={power.powerLeft}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repositioned and restyled Refresh Button */}
      <div className="fixed bottom-4 right-4">
        <button 
          onClick={handleRefreshGameState}
          disabled={isTransacting}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded-full shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 ${isTransacting ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {isTransacting ? 'Syncing...' : 'Sync'}
        </button>
      </div>
    </div>
  );
}

function PowerCard({ name, powerLeft }: { name: string; powerLeft: number }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-all animate-slide-in">
      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-400">
        Power left: <span className="text-pink-400">{powerLeft}</span>
      </div>
    </div>
  );
}

const animations = {
  'fade-in': {
    '0%': {
      opacity: '0.4',
      transform: 'scale(0.95)'
    },
    '100%': {
      opacity: '1',
      transform: 'scale(1)'
    }
  },
  'slide-in': {
    '0%': {
      transform: 'translateY(10px)',
      opacity: '0'
    },
    '100%': {
      transform: 'translateY(0)',
      opacity: '1'
    }
  }
}; 