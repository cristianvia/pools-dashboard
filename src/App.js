import "./App.css";
import MetamaskButton from "./MetamaskButton";
import React, { useEffect, useState } from "react";
import axios from "axios";
const { JSBI } = require("@uniswap/sdk");

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [positions, setPositions] = useState([]);
  let liquidity = 0;

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
              where: { owner: "0x79ba030fe10b5bb6a31f5faa0fa1d05bc23c5dc8", pool: "0xa374094527e1673a86de625aa59517c5de346d32" }
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
              token0 {
                decimals
              }
              token1 {
                decimals
              }
              pool(id: "0xa374094527e1673a86de625aa59517c5de346d32") {
                sqrtPrice
              }
            }
          }
          `,
          }
        );

        console.log("API Response:", response);
        console.log("Data:", response.data);
        const liquidity = parseInt(response.data.data.positions[0].liquidity);
        const decimal0 = parseInt(
          response.data.data.positions[0].token0.decimals
        );
        const decimal1 = parseInt(
          response.data.data.positions[0].token1.decimals
        );
        const sqrtPriceX96 = parseInt(
          response.data.data.positions[0].pool.sqrtPrice
        );

        const tickLower = parseInt(
          response.data.data.positions[0].tickLower.id.split("#")[1]
        );
        const tickUpper = parseInt(
          response.data.data.positions[0].tickUpper.id.split("#")[1]
        );

        //Add logic from getPositionLiquidity
        let sqrtRatioA = Math.sqrt(1.0001 ** tickLower);
        let sqrtRatioB = Math.sqrt(1.0001 ** tickUpper);

        const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
        function getTickAtSqrtRatio(sqrtPriceX96) {
          let tick = Math.floor(
            Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001)
          );
          return tick;
        }
        let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
        let sqrtPrice = sqrtPriceX96 / Q96;

        let amount0wei = 0;
        let amount1wei = 0;
        if (currentTick <= tickLower) {
          amount0wei = Math.floor(
            liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
          );
        } else if (currentTick > tickUpper) {
          amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
        } else if (currentTick >= tickLower && currentTick < tickUpper) {
          amount0wei = Math.floor(
            liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
          );
          amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
        }

        let amount0Human = Math.abs(amount0wei / 10 ** decimal0).toFixed(
          decimal0
        );
        let amount1Human = Math.abs(amount1wei / 10 ** decimal1).toFixed(
          decimal1
        );

        console.log("Liquidez:", liquidity);
        console.log("sqrtPrice:", sqrtPriceX96);
        console.log("Amount amount0Human: ", amount0Human);
        console.log("Amount amount1Human: ", amount1Human);

        if (response.data.errors) {
          console.error("Errors in API response:", response.data.errors);
        }

        if (response.data.data && response.data.data.positions) {
          setPositions(response.data.data.positions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
            {positions.length === 0 ? (
              <p>No hay ninguna pool activa ahora mismo</p>
            ) : (
              positions.map((position) => (
                <div key={position.id}>
                  <h2>ID de la posición: {position.id}</h2>
                  <p>Owner: {position.owner}</p>
                  <p>Liquidez: {liquidity}</p>
                  <p>
                    Rango bajo:{" "}
                    {parseFloat(
                      1.0001 ** parseInt(position.tickLower.id.split("#")[1]) *
                        10 ** 12
                    )}
                  </p>
                  <p>
                    Rango alto:{" "}
                    {parseFloat(
                      1.0001 ** parseInt(position.tickUpper.id.split("#")[1]) *
                        10 ** 12
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </header>
      </div>
    </>
  );
}

export default App;
