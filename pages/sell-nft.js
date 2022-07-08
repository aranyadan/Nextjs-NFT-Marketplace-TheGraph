import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { ethers } from "ethers"
import { Form, useNotification } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"

export default function Home() {
    const { chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult.toString()
        const tokenId = data.data[1].inputResult.toString()
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult.toString(), "ether")
            .toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }
        await runContractFunction({
            params: approveOptions,
            onSuccess: () => {
                handleApproveSuccess(nftAddress, tokenId, price)
            },
            onError: (error) => console.log(error),
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("OK, now time to list")

        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }
        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "NFT Listing",
            title: "NFT Listed!",
            position: "topR",
        })
    }

    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token Id",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Seel your NFT!"
                id="Main Form"
            />
        </div>
    )
}
