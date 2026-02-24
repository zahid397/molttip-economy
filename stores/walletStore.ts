import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WalletState } from '@/types'

function generateMockAddress(): string {
  return '0x' + crypto.getRandomValues(new Uint32Array(1))[0]
    .toString(16)
    .padStart(8, '0')
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,

      connect: () => {
        const address = generateMockAddress()
        set({
          address,
          isConnected: true,
        })
      },

      disconnect: () =>
        set({
          address: null,
          isConnected: false,
        }),
    }),
    {
      name: 'wallet-storage',
    }
  )
)
