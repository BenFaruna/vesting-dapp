import { useState, useEffect } from 'react';
import styles from '../styles/style.module.css';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import Web3Modal from "web3modal";
import { vestAddress } from '../contractAddress';
import Vesting from '../artifacts/contracts/Vesting.sol/Vesting.json';

export default function Organization() {
    const router = useRouter();
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState(null);
    const [sAddress, setSAdress] = useState(null);
    const [orgData, setOrgData] = useState([]);
    const [loadingState, setLoadingState] = useState('');
    console.log(loadingState);
    

    useEffect(() => {
        try {
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
                const org = await vestContract.organizations(signerAddress);
                const orgData = {
                    tokenName: org.tokenName,
                    tokenSymbol: org.tokenSymbol,
                    tokenAmount: parseInt(org.tokenAmount),
                    totalSupply: parseInt(org.totalSupply)
                }
                console.log(orgData);
                setOrgData(orgData);

                setLoadingState("loaded");
            });
        }
        catch (e) {
            console.log(e);
        }
    }, []);

    const createOrg = async (e) => {
        try {
            e.preventDefault();
            const walletAddress = e.target[3].value;
            const tokenName = e.target[0].value;
            const symbol = e.target[1].value;
            const amount = e.target[2].value;
            const create = await contract.createOrganization(
                walletAddress, tokenName, symbol, amount
            );
            const receipt = await create.wait();
            if (receipt.status === 1) {
                alert("Organization created");
                setOrgData({tokenName, tokenSymbol: symbol, tokenSupply: amount})
                router.push("/organization");
            }
            else {
                alert("Organization not created");
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    const createStakeholder = async (e) => {
        try {
            e.preventDefault();
            const walletAddress = e.target[0].value;
            const role = e.target[1].value;
            const period = e.target[2].value;
            const amount = e.target[3].value;
            const create = await contract.newStakeholder(
                walletAddress, role, period, amount
            );
            const receipt = await create.wait();
            if (receipt.status === 1) {
                alert("Stakeholder created");
                setSAdress(walletAddress);
            }
            else {
                alert("Stakeholder not created");
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    const whitelist = async (e) => {
        try {
            e.preventDefault();
            const walletAddress = e.target[0].value;
            const whitelistUser = await contract.whitelistAddress(
                walletAddress
            );
            const receipt = await whitelistUser.wait();
            if (receipt.status === 1) {
                alert("Stakeholder whitelisted");
            }
            else {
                alert("Stakeholder not whitelisted");
            }
        }
        catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            {loadingState !== "loaded" ? (
                <div className={styles.main}>
                    <center>
                        <p>Loading...</p>
                    </center>
                </div>
            ) : (

                <div className={styles.main}>
                    {orgData !== "" || orgData === undefined || orgData === null ? (
                        <>
                            <h2>Token Name: {orgData.tokenName}</h2>
                            <h3>Symbol: {orgData.tokenSymbol}</h3>
                            <h3>Amount Left: {orgData.tokenAmount}</h3>
                            <h3>Amount Distributed: {orgData.totalSupply}</h3>
                            <div className={styles.section}>
                                <form onSubmit={createStakeholder} className={styles.container}>
                                    <h3>Create Stakeholder</h3>
                                    <input className={styles.input} type="text" placeholder="Stakeholder Address" />
                                    <input className={styles.input} type="text" placeholder="Role" />
                                    <input className={styles.input} type="number" placeholder="Vesting Period" />
                                    <input className={styles.input} type="number" placeholder="Token Amount" />
                                    <button className={styles.button} type="submit">Create</button>
                                </form>
                                <form onSubmit={whitelist} className={styles.container}>
                                    <h3>Whitelist</h3>
                                    <input className={styles.input} type="text" value={sAddress} readOnly />
                                    <button className={styles.button} type="submit">Whitelist</button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={createOrg} className={styles.container}>
                            <h2>Create Organization</h2>
                            <input className={styles.input} type="text" placeholder="Token Name" />
                            <input className={styles.input} type="text" placeholder="Token Symbol" />  
                            <input className={styles.input} type="number" placeholder="Token Amount" />
                            <input className={styles.input} type="text" value={address} readOnly />
                            <button className={styles.button} type="submit">Create</button>
                        </form>
                    )}
                </div>
            )}
        </>
    )
}