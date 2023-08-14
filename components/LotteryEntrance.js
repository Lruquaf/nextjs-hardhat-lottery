import { addresses, abis } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";
import { Bell } from "@web3uikit/icons";

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const lotteryAddress = chainId in addresses ? addresses[chainId]["lottery"] : null;
    const lotteryAbi = abis["lottery"];
    const priceConverterAddress =
        chainId in addresses ? addresses[chainId]["priceConverter"] : null;
    const priceConverterAbi = abis["priceConverter"];

    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");
    const [price, setPrice] = useState("0");
    const [amountInETH, setAmountInETH] = useState("0");

    const dispatch = useNotification();

    const {
        runContractFunction: enterLottery,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: lotteryAbi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        params: {},
        msgValue: amountInETH,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: lotteryAbi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getPlayerNumber } = useWeb3Contract({
        abi: lotteryAbi,
        contractAddress: lotteryAddress,
        functionName: "getPlayerCounter",
        params: {},
    });
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: lotteryAbi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    const { runContractFunction: getPrice } = useWeb3Contract({
        abi: priceConverterAbi,
        contractAddress: priceConverterAddress,
        functionName: "getPrice",
        params: {},
    });

    async function updateUI() {
        if (isWeb3Enabled) {
            const entranceFeeFromCall = await getEntranceFee();
            const numberOfPlayersFromCall = await getPlayerNumber();
            const recentWinnerFromCall = await getRecentWinner();
            const priceFromCall = await getPrice();
            setEntranceFee(entranceFeeFromCall);
            setNumberOfPlayers(numberOfPlayersFromCall);
            setRecentWinner(recentWinnerFromCall);
            setPrice(priceFromCall);
            calculateAmountInETH(entranceFeeFromCall, priceFromCall);
        }
    }

    function calculateAmountInETH(entranceFee, price) {
        const amountInWei = ethers.utils.parseUnits((entranceFee / price).toString(), "ether");
        setAmountInETH(amountInWei);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1);
            updateUI();
            handleNewNotification(tx);
        } catch (error) {
            console.log(error);
        }
    };

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Completed!",
            title: "Transaction Notification",
            position: "topR",
            icon: Bell("bell"),
        });
    };

    return (
        <div className="p-5 bg-sky-200">
            <h1 className="text-xl py-5 font-bold mb-2">There is lottery entrance!</h1>
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mb-4 rounded ml-auto"
                        onClick={async function () {
                            await enterLottery({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Lottery"
                        )}
                    </button>
                    <div>Entrance Fee: ${ethers.utils.formatUnits(entranceFee, "ether")} ({entranceFee / price} ETH)</div>
                    <div>Number of Players: {numberOfPlayers.toString()}</div>
                    <div>Recent Winner: {recentWinner.toString()}</div>
                </div>
            ) : (
                <div>No Lottery Address Detected!</div>
            )}
        </div>
    );
}
