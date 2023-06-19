import "../styles/MetamaskBtn.css";

import { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

const MetamaskButton = ({ onConnect }) => {
  const [address, setAddress] = useState(null);

  const connectToMetamask = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.requestAccounts();
        const address = accounts[0];
        sessionStorage.setItem("metamaskAddress", address);
        setAddress(address);
        onConnect(address);
      } else {
        console.error("Metamask not installed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!address)
    return (
      <button onClick={connectToMetamask} className="mmButton">
        <img
          src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
          alt="Metamask icon"
        />
        Conectar con Metamask
      </button>
    );
};

export default MetamaskButton;
