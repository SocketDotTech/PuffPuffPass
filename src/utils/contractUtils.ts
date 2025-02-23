import { ethers } from 'ethers';

const ABI = [
  "function playerCharacterTurnsLeft(uint32 chainSlug, uint256 characterId) view returns (uint256)",
  "function playerPowersLeft(uint32 chainSlug, uint256 powerId) view returns (uint256)",
  "function chemicalXAmount(uint32 chainSlug) view returns (uint256)",
  "function lifeMapping(uint32 chainSlug) view returns (uint256)",
  "function gameStarted() view returns (bool)",
  "function gameEnded() view returns (bool)",
  "function winner() view returns (uint32)",
  "function currentTurnChainSlug() view returns (uint32)",
  "function refreshLife(uint32[]) external",
  "function playWithCharacter(uint32 chainSlug, bool isAttack, uint256 characterId, uint256 powerId) external",
  "function setup(uint32 chainSlug, uint256[4] characterIds, uint256[2] powerIds, address optPlayer) external"
];

export const CHARACTER_NAMES: { [key: number]: string } = {
  1: 'Bubbles',
  2: 'Blossom',
  3: 'Buttercup',
  4: 'ProfessorX',
  5: 'Mojojojo',
  6: 'Sedusa',
  7: 'RowdyRuff',
  8: 'AlienX'
};

export const POWER_NAMES: { [key: number]: string } = {
  1: 'Buff',
  2: 'Huff'
};

export async function getGameState(rpcUrl: string, contractAddress: string) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(contractAddress, ABI, provider);
  
  const chainSlugs = [421614, 11155420];
  const gameState: any = {
    chemicalX: {},
    life: {},
    characters: {},
    powers: {}
  };

  // Get global game state in parallel
  const [gameStarted, gameEnded, winner, currentTurn] = await Promise.all([
    contract.gameStarted(),
    contract.gameEnded(),
    contract.winner(),
    contract.currentTurnChainSlug()
  ]);

  gameState.gameStarted = gameStarted;
  gameState.gameEnded = gameEnded;
  gameState.winner = winner;
  gameState.currentTurn = currentTurn;

  // Get per-chain state in parallel
  await Promise.all(chainSlugs.map(async (chainSlug) => {
    // Initialize state objects
    gameState.characters[chainSlug] = {};
    gameState.powers[chainSlug] = {};

    // Fetch all character states in parallel
    const characterPromises = Array.from({length: 8}, (_, i) => i + 1).map(async (i) => {
      const turnsLeft = await contract.playerCharacterTurnsLeft(chainSlug, i);
      return [i, Number(turnsLeft)];
    });

    // Fetch all power states in parallel
    const powerPromises = Array.from({length: 2}, (_, i) => i + 1).map(async (i) => {
      const powerLeft = await contract.playerPowersLeft(chainSlug, i);
      return [i, Number(powerLeft)];
    });

    // Fetch resources in parallel
    const [characterResults, powerResults, chemicalX, life] = await Promise.all([
      Promise.all(characterPromises),
      Promise.all(powerPromises),
      contract.chemicalXAmount(chainSlug),
      contract.lifeMapping(chainSlug)
    ]);

    // Update character states
    characterResults.forEach(([id, turnsLeft]) => {
      gameState.characters[chainSlug][id] = {
        name: CHARACTER_NAMES[id],
        turnsLeft
      };
    });

    // Update power states
    powerResults.forEach(([id, powerLeft]) => {
      gameState.powers[chainSlug][id] = {
        name: POWER_NAMES[id],
        powerLeft
      };
    });

    // Update resources
    gameState.chemicalX[chainSlug] = Number(chemicalX);
    gameState.life[chainSlug] = Number(life);
  }));

  return gameState;
}

export async function refreshLifeForPlayers(
  rpcUrl: string, 
  contractAddress: string, 
  privateKey: string
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);
  
  try {
    const tx = await contract.refreshLife([421614, 11155420], {
      gasPrice: 0,
      type: 0 // legacy transaction
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error refreshing life:', error);
    throw error;
  }
}

export async function playWithCharacter(
  rpcUrl: string,
  contractAddress: string,
  privateKey: string,
  chainSlug: number = 11155420,
  characterId: number = 8,
  powerId: number = 1,
  isAttack: boolean = true
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);
  
  try {
    const tx = await contract.playWithCharacter(
      chainSlug,
      isAttack,
      characterId,
      powerId,
      {
        gasPrice: 0,
        type: 0 // legacy transaction
      }
    );
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error playing with character:', error);
    throw error;
  }
}

export async function setupGame(
  rpcUrl: string,
  contractAddress: string,
  privateKey: string,
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);
  
  try {
    // First setup for Arbitrum
    const tx1 = await contract.setup(
      421614,
      [1, 2, 3, 4],
      [1, 2],
      '0xb62505feacC486e809392c65614Ce4d7b051923b',
      {
        gasPrice: 0,
        type: 0 // legacy transaction
      }
    );
    await tx1.wait();
    console.log('Game restarted successfully for Arbitrum');

    // Second setup for Base
    const tx2 = await contract.setup(
      11155420,
      [5, 6, 7, 8],
      [1, 2],
      '0xb62505feacC486e809392c65614Ce4d7b051923b',
      {
        gasPrice: 0,
        type: 0 // legacy transaction
      }
    );
    await tx2.wait();
    console.log('Game restarted successfully for Base');
    
    return true;
  } catch (error) {
    console.error('Error setting up game:', error);
    throw error;
  }
} 