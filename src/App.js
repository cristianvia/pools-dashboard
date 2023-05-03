import './App.css';
import MetamaskButton from './MetamaskButton';
import { useState } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <MetamaskButton onConnect={setWalletAddress} />
          {walletAddress && <p> {walletAddress}</p>}
        </p>
      </header>
    </div>
  );
}

export default App;
