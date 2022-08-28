import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";


export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [ balanceOfCryptoDevTokens, setBalanceOfCryptoDevsToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero)
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);
  const web3modalRef = useRef();

  const getTotalTokensMinted = async() =>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    }catch(err)
    {
      console.log(err);
    }
  }
  const getTokensToBeClaimed = async() =>{
    try{
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if(balance===zero){
        setTokenAmount(zero)
      }
      else{
        var amount = 0;
        for(var i =0;i<balance; i++)
        {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address,i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          if(!claimed)
          {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      } 
    }catch(err){
      console.log(err);
      setTokensToBeClaimed(zero);
    }
  }

  const getBalanceOfCryptoDevTokens = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevsToken(balance)
    }catch(err){
      console.log(err)
      setBalanceOfCryptoDevsToken(zero);
    }
  }
  const mintCryptoDevCoins = async(amount)=>{
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err){
      console.log(err);
    }
  }
  const getOwner = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )
      const _owner = await tokenContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    }catch(err){
      console.log(err)
    }
  }
  const withdrawCoins = async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
    }
  }
  const claimCryptoDevTokens = async()=>{
    try{
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  }
  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3modalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if(chainId!=4)
    {
      window.alert("change network to ropsten")
      throw new Error("Change the network to Rinkeby")
    }
    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }
  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    if(!walletConnected){
      web3modalRef.current = new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      })
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      //withdrawCoins();
    }
  },[walletConnected]);

  const renderButton = ()=>{
    if(loading){
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // if (walletConnected && isOwner) {
    //   return (
    //     <div>
    //       <button className={styles.button1} onClick={withdrawCoins}>
    //         Withdraw Coins
    //       </button>
    //     </div>
    //   );
    // }
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevCoins(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  }
  return (
   <div>
     <Head>
       <title>Crypto Devs</title>
       <meta name = "description" content="ICO-Dapp" />
       <link rel = "icon" href="/favicon.ico"/>
     </Head>
     <div className={styles.main}>
       <div>
         <h1 className={styles.title}>Welcome to Crypto Devs</h1>
         <div className= {styles.descrption}>
           You can claim or mint Crypto Dev tokens here
         </div>
         {walletConnected?(
           <div>
             <div className = {styles.descrption}>
               You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto Dev Tokens
             </div>
             {renderButton()}
           </div>
         ):(
           <button onClick={connectWallet} className={styles.button}>
             Connect wallet
           </button>
         )}
       </div> 
     </div>
     <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
   </div>
  )
}
