import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";

const contractAddress = "0x7215c347458DB86531f3c4Cae1c60c0B93e435Ce";
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "newMessage",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAdvertiser",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newAmount",
        type: "uint256",
      },
    ],
    name: "MessageUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "currentAdvertiser",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAd",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "message",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newMessage",
        type: "string",
      },
    ],
    name: "updateMessage",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "updateOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const App = () => {
  const [currentAd, setCurrentAd] = useState("Hello World!");
  const [currentBid, setCurrentBid] = useState(0);
  const [advertiser, setAdvertiser] = useState("0x0");
  const [newAd, setNewAd] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [provider, setProvider] = useState(null);
  const [status, setStatus] = useState("");
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const submitBid = async () => {
    const signer = provider.getSigner(); // Assumes Metamask or similar is injected in the browser
    const contractWithSigner = contract.connect(await signer);
    try {
      const tx = await contractWithSigner.updateMessage(newAd, {
        value: ethers.parseEther(bidAmount),
      });
      setStatus("Transaction sent, waiting for confirmation...");
      await tx.wait();
      setStatus("Transaction confirmed!");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.ethereum) {
        setProvider(new ethers.BrowserProvider(window.ethereum));
        // getCurrentAd()
      } else {
        console.error("Please install MetaMask!");
      }
    }
  }, []);

  async function fetchCurrentAd() {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
      const adData = await contract.getCurrentAd();
      setCurrentAd(adData[0]);
      setAdvertiser(adData[1]);
      setCurrentBid(ethers.formatEther(adData[2]));
      console.log(adData[0]);
    } catch (error) {
      console.error('Error fetching current ad:', error);
    }
  }
  

  useEffect(() => {
    fetchCurrentAd();
  }, []);
  

  useEffect(() => {
    const setupEventListener = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        contract.on(
          "MessageUpdated",
          (newMessage, newAdvertiser, newAmount, event) => {
            // Update your state variables here
            setCurrentAd(newMessage);
            setCurrentBid(ethers.formatEther(newAmount));
            setAdvertiser(newAdvertiser);
          }
        );
        // contract.getEvent
        console.log("Provider:", provider); // Debug line
      } else {
        console.error("Ethereum provider is not available");
      }
    };

    setupEventListener();

    // Cleanup the event listener
    return () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        contract.removeAllListeners("MessageUpdated");
      }
    };
  }, []);

  return (
    <div className="app">
      {/* Landing Section */}
      <section className="landing">
        <h1>BidBoard</h1>
        <p>Status: {status}</p>
      </section>

      <div className="container">
        {/* Bid Section */}
        <section className="bid-section">
          <input
            type="text"
            value={newAd}
            onChange={(e) => setNewAd(e.target.value)}
            placeholder="Enter your advert message"
          />
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter your bid amount"
          />
          <button onClick={submitBid}>Submit Bid</button>
        </section>

        {/* Advert Display Section */}
        <section className="advert-display">
          <div className="current-ad">"{currentAd}"</div>
          <div className="card-details">
            <div className="current-bid">
              Current Bid: <br />
              {currentBid} ETH
            </div>
            <div className="advertiser">
              Advertiser: <br />
              {advertiser}
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer>
        <a
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repository
        </a>
        {/* Add more links as needed */}
      </footer>
    </div>
  );
};

export default App;
