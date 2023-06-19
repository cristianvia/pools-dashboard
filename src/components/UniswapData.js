import React, { useEffect, useState } from "react";
import axios from "axios";

/* No todos son necesarios */
import {
  AiOutlineCalendar,
  AiOutlineShoppingCart,
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineStock,
} from "react-icons/ai";
import {
  FiShoppingBag,
  FiEdit,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiStar,
  FiShoppingCart,
} from "react-icons/fi";
import {
  BsKanban,
  BsBarChart,
  BsBoxSeam,
  BsCurrencyDollar,
  BsShield,
  BsChatLeft,
} from "react-icons/bs";
import { BiColorFill } from "react-icons/bi";
import { IoMdContacts } from "react-icons/io";
import { RiContactsLine, RiStockLine } from "react-icons/ri";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import { TiTick } from "react-icons/ti";
import { GiLouvrePyramid } from "react-icons/gi";
import { GrLocation } from "react-icons/gr";

const { JSBI } = require("@uniswap/sdk");

function UniswapData() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [positions, setPositions] = useState([]);
  const [actualPriceState, setActualPriceState] = useState(null);
  const [maticAmount, setMaticAmount] = useState(null);
  const [usdcAmount, setUsdcAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
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
        setMaticAmount(amount0Human);
        let amount1Human = Math.abs(amount1wei / 10 ** decimal1).toFixed(
          decimal1
        );
        setUsdcAmount(amount1Human);

        const actualPrice = sqrtPrice ** 2 * 10 ** (decimal0 - decimal1);
        setActualPriceState(actualPrice);

        const getTotalAmount = amount0Human * actualPrice + amount1Human;
        setTotalAmount(getTotalAmount);

        console.log("precio actual", actualPrice);
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
      {positions.length === 0 ? (
        <p>No hay ninguna pool activa ahora mismo</p>
      ) : (
        positions.map((position) => (
          <div
            key={position.id}
            className="flex m-3 flex-wrap justify-center gap-1 items-center"
          >
            {/* Añadir styles customizados a cada icon: background, color y icon diferente
            
            
            
            TODO
            */}
            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">{position.id}</span>
              </p>
              <p className="text-sm text-gray-400  mt-1">ID de la posición</p>
            </div>
            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {actualPriceState && (
                    <span>{actualPriceState.toFixed(5)}</span>
                  )}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">Precio actual</p>
            </div>

            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {parseFloat(
                    1.0001 ** parseInt(position.tickLower.id.split("#")[1]) *
                      10 ** 12
                  ).toFixed(5)}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">Rango bajo</p>
            </div>

            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {parseFloat(
                    1.0001 ** parseInt(position.tickUpper.id.split("#")[1]) *
                      10 ** 12
                  ).toFixed(5)}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">Rango alto</p>
            </div>

            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {maticAmount && (
                    <span>{parseInt(maticAmount).toFixed(5)}</span>
                  )}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">
                Cantidad total MATIC
              </p>
            </div>

            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {maticAmount && (
                    <span>{parseInt(usdcAmount).toFixed(5)}</span>
                  )}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">Cantidad total USDC</p>
            </div>

            <div className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                <MdOutlineSupervisorAccount />
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">
                  {maticAmount && (
                    <span>{parseInt(totalAmount).toFixed(5)}</span>
                  )}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">Liquidez total</p>
            </div>

            <a
              className="whiteColor"
              href={`https://app.uniswap.org/#/pools/${position.id}`}
            >
              <h5>Ver posición en uniswap</h5>
            </a>
          </div>
        ))
      )}
    </>
  );
}

export default UniswapData;
