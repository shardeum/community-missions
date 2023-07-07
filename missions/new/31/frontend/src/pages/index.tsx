import styles from 'styles/Home.module.scss'
import { useEffect, useState } from 'react'
import ConnectWallet from 'components/Connect/ConnectWallet'
import { useChainModal } from '@rainbow-me/rainbowkit'
import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead, useWaitForTransaction } from 'wagmi'
import upgradableContract from "../abi/UpgradableContract.json"
import { ethers } from "ethers";


export default function Home() {
  return (
    <div className={styles.container}>
      <Main />
    </div>
  )
}

function Main() {
  const { address } = useAccount()
  const { openChainModal } = useChainModal()

  return (
    <main className={styles.main + ' space-y-6'}>
      <div className="text-center">
        <p className="font-medium">Shardeum Mission 31</p>
      </div>

      <div>
        <h4 className="text-center text-sm font-medium">1. Connect your wallet</h4>
        <div className="flex w-full flex-col items-center">
          <ConnectWallet />
        </div>
      </div>

      <div>
        <h4 className="text-center text-sm font-medium">2. Switch to Shardeum Dapp Chain</h4>
        <div className="flex w-full flex-col items-center">
          {openChainModal && (
            <button
              onClick={openChainModal}
              type="button"
              className="m-1 rounded-lg bg-orange-500 py-1 px-3 text-white transition-all duration-150 hover:scale-105"
            >
              Connect to Shardeum
            </button>
          )}
        </div>
      </div>

      <h4 className="text-center text-sm font-medium">3. Try changing importantVariable</h4>
      <div className="w-full max-w-xl rounded-xl bg-sky-500/10 p-6 text-center">
        <dl className={styles.dl}>
          <dt>initial importantVariable</dt>
          <dd>
          {address ? <ReadValue1 /> : 'n/a'}
          </dd>
          <dt>updated importantVariable</dt>
          <dd>{address ? <ReadValue2 /> : 'n/a'}</dd>
          <dt>change importantVariable</dt>
          <dd className="break-all">{address ? <SendTxn /> : 'n/a'} </dd>
        </dl>
      </div>
    </main>
  )
}

function ReadValue1() {
  const [data1, setData1] = useState('')
  const { data } = useContractRead({
    address: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
    abi: upgradableContract.abi,
    functionName: 'importantVariable',
  })

  useEffect(() => {
    if(data){
      setData1((data).toString())
    }
  },[]) 

  return (
    <>
      <p>
        {data && <span>{data1}</span>}
      </p>
    </>
  )
}

function ReadValue2() {
  const [data2, setData2] = useState('')
  const { data, isError } = useContractRead({
    address: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
    abi: upgradableContract.abi,
    functionName: 'importantVariable',
    watch: true,
  })
  const provider = new ethers.providers.JsonRpcProvider("https://dapps.shardeum.org");
  const contract = new ethers.Contract("0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b", upgradableContract.abi, provider);
  // const callContract = async () => {
  //   const res = await contract.importantVariable();
  //   console.log(res.toString());
  //   setData2(res.toString());
  // }

  useEffect(() => {
    if(data){
        setData2((data).toString())
    }
  },[data]) 

  return (
    <>
      {/* <p>
        {isError && <span>Waiting RPC call to success and return updated value</span>}
      </p> */}
      <p>
        {data && <span>{data2}</span>}
      </p>
      {/* <button
          disabled={!data}
          onClick={() => callContract()}
          className="ml-1 rounded-lg bg-blue-500 py-1 px-2 text-white transition-all duration-150 hover:scale-105"
        >
          check updated value */}
      {/* </button> */}
    </>
  )
}

function SendTxn() {
  const [txn, setTxn] = useState('')
  const { config } = usePrepareContractWrite({
    address: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
    abi: upgradableContract.abi,
    functionName: 'changeImportantVariable',
    args: [txn],
  })
  const { data, isLoading, write } = useContractWrite(config)
  const { isError, isSuccess } = useWaitForTransaction({hash: (data?.hash)?.toString()})

  return (
    <>
      <p>
        <input value={txn} onChange={e => setTxn(e.target.value)} placeholder="input any number" className="rounded-lg p-1" />
        <button
          disabled={!write}
          onClick={() => write?.()}
          className="ml-1 rounded-lg bg-blue-500 py-1 px-2 text-white transition-all duration-150 hover:scale-105"
        >
          Send Txn
        </button>
      </p>
      <p>
        {isLoading && <span>Pending transaction confirmation</span>}
        {isError && <span>Transaction error!</span>}
        {isSuccess && <span>Transaction sent successfully!</span>}
      </p>
    </>
  )
}
