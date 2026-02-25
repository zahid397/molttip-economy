"use client";

import { ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  // We will inject Web3/MetaMask providers here later.
  // For now, it just passes the children through so your app compiles.
  return <>{children}</>;
};
