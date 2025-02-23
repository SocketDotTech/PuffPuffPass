import GameBoard from './components/GameBoard';
import RestartGame from './components/RestartGame';
import { useState } from 'react';

function App() {
  const [gameState, setGameState] = useState<any>(null);

  const testConfig = {
    rpcUrl: import.meta.env.VITE_RPC_URL,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS
  };

  if (!testConfig.rpcUrl || !testConfig.contractAddress) {
    return <div>Missing environment variables</div>;
  }

  return (
    <div>
      <RestartGame 
        appGateway={testConfig.contractAddress}
        rpcUrl={testConfig.rpcUrl}
        onGameStateUpdate={setGameState}
      />
      <GameBoard 
        rpcUrl={testConfig.rpcUrl}
        contractAddress={testConfig.contractAddress}
        gameState={gameState}
      />
    </div>
  );
}

export default App;