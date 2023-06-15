import { AnchorProvider } from "@project-serum/anchor"
import Wallet from "@project-serum/anchor/dist/cjs/nodewallet"

import { Connection, Keypair } from "@solana/web3.js"
import { HELLO_MOON_RPC_URL } from "@env"

export const connection = new Connection(HELLO_MOON_RPC_URL, "confirmed")

const createAnchorProvider = (wallet: any) => {
  const provider = new AnchorProvider(connection, wallet ?? new Wallet(Keypair.generate()), {
    maxRetries: 2,
  })

  return provider
}

export default createAnchorProvider
