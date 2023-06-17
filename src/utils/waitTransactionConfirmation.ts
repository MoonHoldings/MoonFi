import { TransactionSignature } from '@solana/web3.js'
import createAnchorProvider from './createAnchorProvider'

const waitTransactionConfirmation = async (tx: TransactionSignature, onSuccess: (tx: TransactionSignature, ...args: any[]) => any, onFail: (tx?: TransactionSignature, ...args: any[]) => any) => {
  const provider = createAnchorProvider()

  const confirmedTransaction = await provider.connection.confirmTransaction({ signature: tx } as any, 'confirmed')

  if (confirmedTransaction.value.err) {
    onFail(tx)
  } else {
    onSuccess(tx)
  }
}

export default waitTransactionConfirmation
