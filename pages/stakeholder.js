import { useState, useEffect } from 'react';
import styles from '../styles/style.module.css';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import { vestAddress } from '../contractAddress';
import Vesting from '../artifacts/contracts/Vesting.sol/Vesting.json';

export default function Stakeholder() {
    const router = useRouter();
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState(null);
    const [userData, setUserData] = useState([]);
    const [whitelisted, setWhitelist] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [loadingState, setLoadingState] = useState(null);

    useEffect(() => {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            setCurrentTime(currentTime);

            // Create a Web3Modal instance
            const web3Modal = new Web3Modal();

            // Connect to the user's Ethereum provider
            web3Modal.connect().then(async (provider) => {
                // Create an ethers.js provider using the Web3 provider
                const ethersProvider = await new ethers.providers.Web3Provider(provider);
                const signer = await ethersProvider.getSigner();
                const signerAddress = await signer.getAddress();
                setProvider(ethersProvider);
                setAddress(signerAddress);

                // Create an instance of the contract using the contract ABI and address
                const vestContract = await new ethers.Contract(
                    vestAddress,
                    Vesting.abi,
                    ethersProvider.getSigner()
                );
                setContract(vestContract);

                // Get organization if it exists
                const user = await vestContract.stakeholders(signerAddress);
                const userData = {
                    role: user.role,
                    vestingPeriod: parseInt(user.vestingPeriod),
                    tokenAmount: parseInt(user.tokenAmount),
                    claimed: parseInt(user.claimedToken)
                }
                setUserData(userData);

                const whitelisted = await vestContract.whitelistedAddresses(signerAddress);
                if (whitelisted) {
                    setWhitelist(whitelisted);
                }

                setLoadingState("loaded");
            });
        }
        catch (err) {
            console.error(err);
        }
    }, []);

    const claimTokens = async (e) => {
        try {
            e.preventDefault();
            const amount = e.target[0].value;
            const claim = await contract.claimToken(
                amount
            );
            const receipt = await claim.wait();
            if (receipt.status === 1) {
                alert("Claimed tokens");
                router.push("/stakeholder");
            }
            else {
                alert("Claim unsuccessful");
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    const shortenAddress = (strAddress) => {
        return strAddress.slice(0, 3) + "..." + strAddress.slice(-6)
    };

    return (
        <>
            {loadingState !== "loaded" ? (
                <div className={styles.main}>
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    {userData === null || userData === undefined ? (
                        <div className={styles.main}>
                            <h2>Stakeholder</h2>
                            <p>You are not a stakeholder</p>
                        </div>
                    ) : (
                        <div className={styles.main}>
                            <form onSubmit={claimTokens} className={styles.container}>                                
                                <h2>Stakeholder</h2>
                                <h3>{shortenAddress(address)}</h3>
                                <h3>Role: {userData.role}</h3>
                                <h3>Claimable: {userData.tokenAmount}</h3>
                                <h3>Claimed Balance: {userData.claimed}</h3>
                                {currentTime > userData.vestingPeriod ? (
                                    <>
                                        {userData.tokenAmount === 0 ? (
                                            <></>
                                        ) : (
                                            <>
                                                {whitelisted !== true ? (
                                                    <p>Not yet whitelisted</p>
                                                    
                                                ) : (
                                                    <>
                                                        <input className={styles.input} type="number" placeholder="Token Amount" />
                                                        <button className={styles.button} type="submit">Claim</button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                            </form>
                        </div>
                    )}
                </>
            )}
        </>
    )
}