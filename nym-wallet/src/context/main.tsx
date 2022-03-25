import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { TLoginType } from 'src/pages/sign-in/types';
import { Account, AppEnv, Network, TCurrency, TMixnodeBondDetails } from '../types';
import { TUseuserBalance, useGetBalance } from '../hooks/useGetBalance';
import {
  getMixnodeBondDetails,
  selectNetwork,
  signInWithMnemonic,
  signInWithPassword,
  signOut,
  getEnv,
} from '../requests';
import { currencyMap } from '../utils';
import { Console } from '../utils/console';

export const urls = (networkName?: Network) =>
  networkName === 'MAINNET'
    ? {
        blockExplorer: 'https://blocks.nymtech.net',
        networkExplorer: 'https://explorer.nymtech.net',
      }
    : {
        blockExplorer: `https://${networkName}-blocks.nymtech.net`,
        networkExplorer: `https://${networkName}-explorer.nymtech.net`,
      };

type TClientContext = {
  mode: 'light' | 'dark';
  appEnv?: AppEnv;
  clientDetails?: Account;
  mixnodeDetails?: TMixnodeBondDetails | null;
  userBalance: TUseuserBalance;
  showAdmin: boolean;
  showSettings: boolean;
  showTerminal: boolean;
  network?: Network;
  currency?: TCurrency;
  isLoading: boolean;
  isAdminAddress: boolean;
  error?: string;
  setIsLoading: (isLoading: boolean) => void;
  setError: (value?: string) => void;
  switchNetwork: (network: Network) => void;
  getBondDetails: () => Promise<void>;
  handleShowSettings: () => void;
  handleShowAdmin: () => void;
  handleShowTerminal: () => void;
  logIn: (opts: { type: 'mnemonic' | 'password'; value: string }) => void;
  signInWithPassword: (password: string) => void;
  logOut: () => void;
};

export const ClientContext = createContext({} as TClientContext);

export const ClientContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [appEnv, setAppEnv] = useState<AppEnv>();
  const [clientDetails, setClientDetails] = useState<Account>();
  const [mixnodeDetails, setMixnodeDetails] = useState<TMixnodeBondDetails | null>();
  const [network, setNetwork] = useState<Network | undefined>();
  const [currency, setCurrency] = useState<TCurrency>();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [mode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const userBalance = useGetBalance(clientDetails?.client_address);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const loadAccount = async (n: Network) => {
    try {
      const client = await selectNetwork(n);
      setClientDetails(client);
    } catch (e) {
      enqueueSnackbar('Error loading account', { variant: 'error' });
      Console.error(e as string);
    } finally {
      setCurrency(currencyMap(n));
    }
  };

  const getBondDetails = async () => {
    setMixnodeDetails(undefined);
    try {
      const mixnode = await getMixnodeBondDetails();
      setMixnodeDetails(mixnode);
    } catch (e) {
      Console.error(e as string);
    }
  };

  useEffect(() => {
    getEnv().then(setAppEnv);
  }, []);

  useEffect(() => {
    const refreshAccount = async () => {
      if (network) {
        await loadAccount(network);
        await getBondDetails();
        await userBalance.fetchBalance();
      }
    };
    refreshAccount();
  }, [network]);

  const logIn = async ({ type, value }: { type: TLoginType; value: string }) => {
    if (value.length === 0) {
      setError(`A ${type} must be provided`);
      return;
    }
    try {
      setIsLoading(true);
      if (type === 'mnemonic') {
        await signInWithMnemonic(value);
      } else {
        await signInWithPassword(value);
      }
      setNetwork('MAINNET');
      history.push('/balance');
    } catch (e) {
      setError(e as string);
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    userBalance.clearAll();
    setClientDetails(undefined);
    setNetwork(undefined);
    setError(undefined);
    setIsLoading(false);
    setMixnodeDetails(undefined);
    await signOut();
    enqueueSnackbar('Successfully logged out', { variant: 'success' });
  };

  const handleShowAdmin = () => setShowAdmin((show) => !show);
  const handleShowSettings = () => setShowSettings((show) => !show);
  const handleShowTerminal = () => setShowTerminal((show) => !show);
  const switchNetwork = (_network: Network) => setNetwork(_network);

  const memoizedValue = useMemo(
    () => ({
      mode,
      appEnv,
      isAdminAddress: Boolean(appEnv?.ADMIN_ADDRESS && clientDetails?.client_address === appEnv.ADMIN_ADDRESS),
      isLoading,
      error,
      clientDetails,
      mixnodeDetails,
      userBalance,
      showAdmin,
      showSettings,
      showTerminal,
      network,
      currency,
      setIsLoading,
      setError,
      signInWithPassword,
      switchNetwork,
      getBondDetails,
      handleShowSettings,
      handleShowAdmin,
      handleShowTerminal,
      logIn,
      logOut,
    }),
    [
      mode,
      appEnv,
      isLoading,
      error,
      clientDetails,
      mixnodeDetails,
      userBalance,
      showAdmin,
      showSettings,
      showTerminal,
      network,
      currency,
    ],
  );

  return <ClientContext.Provider value={memoizedValue}>{children}</ClientContext.Provider>;
};
