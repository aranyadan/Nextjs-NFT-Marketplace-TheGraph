import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralis, useMoralisQuery } from "react-moralis"
import NFTBox from "../components/NFTBox"

export default function Home() {
    // Index the events off-chain and read from database
    // Setup a server to listen for those events to be fired, and we will add them to a database to query
    const { isWeb3Enabled } = useMoralis()
    const { data: listedNfts, isFetching: fetchingListedNfts } =
        useMoralisQuery(
            // Table Name
            "ActiveItem",
            // Function for query
            (query) => query.limit(10).descending("tokenId")
        )

    // console.log(listedNfts)

    // Moralis does this centralized, thegraph does it decentralized
    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    fetchingListedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            // console.log(nft.attributes)
                            const {
                                price,
                                nftAddress,
                                tokenId,
                                marketplaceAddress,
                                seller,
                            } = nft.attributes
                            return (
                                <div key={`${nftAddress}${tokenId}`}>
                                    <NFTBox
                                        price={price}
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        marketplaceAddress={marketplaceAddress}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`}
                                    />
                                </div>
                            )
                        })
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
        </div>
    )
}
