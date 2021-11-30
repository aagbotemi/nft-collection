import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';
import twitterLogo from './assets/twitter-logo.svg';

import { toast } from 'react-toastify';

const TWITTER_HANDLE = 'abiodunAwoyemi';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-mlsttagkhh';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xCb3da68B45F65412603B243B0F4154a24D4cD452";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [eventAlert, setEventAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true);

  toast.configure({
    autoClose: 7000,
    draggable: true,
  });

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      // console.log("Make sure you have metamask!");
      toast.dismiss();
      toast.info("Make sure you have metamask!", {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      
      setupEventListener()
    } else {
      // console.log("No authorized account found")
      toast.dismiss();
      toast.error("No authorized account found", {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
    }
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      // alert("You are not connected to the Rinkeby Test Network!");
      toast.dismiss();
      toast.error("You are not connected to the Rinkeby Test Network!", {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        // alert("Get MetaMask!");
        toast.dismiss();
        toast.info("Get MetaMask!", {
          position: "top-right",
          pauseOnHover: true,
          draggable: false,
        });
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      toast.dismiss();
      toast.success("Connected Successfully", {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });

      setupEventListener();
    } catch (error) {
      // console.log(error)
      toast.dismiss();
      toast.error(error.message, {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
    }
  }

  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          let alert = `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`

          setEventAlert(alert)
        });

        console.log("Setup event listener!")
      } else {
        // console.log("Ethereum object doesn't exist!");
        toast.dismiss();
        toast.error("Ethereum object doesn't exist!", {
          position: "top-right",
          pauseOnHover: true,
          draggable: false,
        });
      }
    } catch (error) {
      // console.log(error)
      toast.dismiss();
      toast.error(error.message, {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setLoading(true);

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setLoading(false);

        // toast.dismiss();
        // toast.success(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`, {
        //   position: "top-right",
        //   pauseOnHover: true,
        //   draggable: false,
        // });
      } else {
        // console.log("Ethereum object doesn't exist!");
        toast.dismiss();
        toast.error("Ethereum object doesn't exist!", {
          position: "top-right",
          pauseOnHover: true,
          draggable: false,
        });
      }
    } catch (error) {
      // console.log(error)
      toast.dismiss();
      toast.error(error.message, {
        position: "top-right",
        pauseOnHover: true,
        draggable: false,
      });
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="px-10 w-auto border-0 rounded font-semibold text-white text-lg cursor-pointer h-12 connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => {
    return (
      <>
        {loading 
          ? <button className="mint-button px-10 w-auto border-0 rounded font-semibold text-white text-lg cursor-pointer h-12 connect-wallet-button">
            <div className="spinner block w-5 h-5 rounded-full"></div>
          </button>
          : <button onClick={askContractToMintNft} className="px-10 w-auto border-0 rounded font-semibold text-white text-lg cursor-pointer h-12 connect-wallet-button">
            Mint NFT
          </button>
        }
      </>
    )
  }

  return (
    <div className="App h-screen text-center">
      <div className=" min-h-screen flex flex-col justify-between">
        <div className="p-10">
          <p className="header gradient-text m-0 font-bold text-5xl">My NFT Collection</p>
          <p className="text-xl text-white py-7">
            Each unique. Each beautiful. Discover your NFT today.
            <br />
            I'm minting my own NFT Collection.
          </p>
          
          {currentAccount === "" 
            ? renderNotConnectedContainer() 
            : renderMintUI()}

          <br />
          <br />

          <a href={OPENSEA_LINK} target="_blank">
            <button className="px-10 w-auto border-0 rounded font-semibold text-white text-lg cursor-pointer h-12 connect-wallet-button">
              Checkout the Collection
            </button>
          </a>
        </div>
        <div className="flex justify-center items-center pb-7">
          <img alt="Twitter Logo" className="w-8 h-8" src={twitterLogo} />
          <a
            className="text-white font-semibold"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built  by @${TWITTER_HANDLE}`}</a>
        </div>

        {eventAlert
          ? show && <div className="fixed left-1/2 top-2 bg-white w-96 p-4 rounded" style={{transform: "translate(-50%, 0%)"}}>
            <div className="break-words">{ eventAlert }</div>
          
            <button onClick={() => setShow(false)} className="bg-red-400 px-5 py-1 rounded text-white font-semibold text-right mt-4">Close</button>
          </div>
          : null 
        }
      </div>
    </div>
  );
}

export default App;
