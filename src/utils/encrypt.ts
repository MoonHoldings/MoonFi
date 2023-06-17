import { CRYPTO_SECRET } from '@env'
import CryptoJS from 'crypto-js'

const encrypt = (tobeEncrypted: any) => {
  const encryptedText = CryptoJS.AES.encrypt(JSON.stringify(tobeEncrypted), CRYPTO_SECRET)

  return encryptedText
}

export default encrypt
