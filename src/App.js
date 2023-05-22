import "./App.css";
import MetamaskButton from "./MetamaskButton";
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.post(
          "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
          {
            query: `
          {
            positions(
              orderBy: id
              orderDirection: desc
              first: 1
              #where: {owner: "${walletAddress}", pool: "0xa374094527e1673a86de625aa59517c5de346d32"}
              where: {owner: "0x79ba030fe10b5bb6a31f5faa0fa1d05bc23c5dc8", pool: "0xa374094527e1673a86de625aa59517c5de346d32"}
            ) {
              id
              owner
              liquidity
              tickLower {
                id
              }
              tickUpper {
                id
              }
            }
          }
          `,
          }
        );

        console.log("API Response:", response);
        console.log("Data:", response.data);

        if (response.data.errors) {
          console.error("Errors in API response:", response.data.errors);
        }

        if (response.data.data && response.data.data.positions) {
          setPositions(response.data.data.positions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      if (!walletAddress) {
        console.log("Wallet address is not set");
        return;
      }
    };

    fetchPositions();
  }, [walletAddress]);

  return (
    <>
      <div className="App">
        <header className="App-header">
          <p>
            <MetamaskButton onConnect={setWalletAddress} />
            {walletAddress && <p> {walletAddress}</p>}
          </p>
          <div>
            {positions.map((position) => (
              <div>
                {positions.map((position) => (
                  <div key={position.id}>
                    <h2>ID de la posición: {position.id}</h2>
                    <p>Owner: {position.owner}</p>
                    <p>Liquidez: {position.liquidity}</p>
                    <p>
                      Rango bajo: 
                      {parseFloat(
                        ((1.0001 ** parseInt(position.tickLower.id.split('#')[1])) * (10 ** 12))
                      )}
                    </p>
                    <p>Rango alto: {parseFloat(
                        ((1.0001 ** parseInt(position.tickUpper.id.split('#')[1])) * (10 ** 12))
                      )}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </header>
      </div>
    </>
  );
}

export default App;
