import { createElement, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth.js';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage.js';
import { AccountDataContext } from './AccountContext.js';

const STORAGE_KEY = 'knitted-toy-account-data';
const EMPTY_ACCOUNT_DATA = { addresses: [] };

function isAccountDataMap(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function removeSavedFavorites(accounts) {
  let changed = false;
  const cleanedAccounts = Object.fromEntries(
    Object.entries(accounts).map(([userKey, accountData]) => {
      if (
        !isAccountDataMap(accountData) ||
        !Object.prototype.hasOwnProperty.call(accountData, 'favorites')
      ) {
        return [userKey, accountData];
      }
      const cleanedAccountData = { ...accountData };
      delete cleanedAccountData.favorites;
      changed = true;
      return [userKey, cleanedAccountData];
    })
  );
  return changed ? cleanedAccounts : accounts;
}

function getAddressLabel(address) {
  return [
    address.city,
    address.street,
    address.building && `буд. ${address.building}`,
    address.apartment && `кв. ${address.apartment}`,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
}

export function AccountDataProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.id != null ? String(user.id) : 'guest';
  const [accounts, setAccounts] = useLocalStorage(
    STORAGE_KEY,
    {},
    isAccountDataMap
  );
  useEffect(() => {
    const cleanedAccounts = removeSavedFavorites(accounts);
    if (cleanedAccounts !== accounts) setAccounts(cleanedAccounts);
  }, [accounts, setAccounts]);

  const accountData = accounts[userKey] || EMPTY_ACCOUNT_DATA;

  const updateAccountData = useCallback(
    (update) => {
      setAccounts((currentAccounts) => {
        const currentData = currentAccounts[userKey] || EMPTY_ACCOUNT_DATA;
        return {
          ...currentAccounts,
          [userKey]: update(currentData),
        };
      });
    },
    [setAccounts, userKey]
  );

  const addAddress = useCallback(
    (address) => {
      const id = crypto.randomUUID();
      updateAccountData((currentData) => {
        const isFirstAddress = currentData.addresses.length === 0;
        const newAddress = {
          ...address,
          id,
          isDefault: isFirstAddress || Boolean(address.isDefault),
        };
        return {
          ...currentData,
          addresses: [
            ...(address.isDefault
              ? currentData.addresses.map((entry) => ({
                  ...entry,
                  isDefault: false,
                }))
              : currentData.addresses),
            newAddress,
          ],
        };
      });
    },
    [updateAccountData]
  );

  const saveAddress = useCallback(
    (address) => {
      updateAccountData((currentData) => {
        const existing = currentData.addresses.find(
          (entry) => entry.id === address.id
        );
        const remainsDefault =
          existing?.isDefault &&
          !currentData.addresses.some(
            (entry) => entry.id !== address.id && entry.isDefault
          );
        const isDefault = Boolean(address.isDefault || remainsDefault);
        return {
          ...currentData,
          addresses: currentData.addresses.map((entry) => {
            if (entry.id !== address.id) {
              return isDefault ? { ...entry, isDefault: false } : entry;
            }
            return { ...address, isDefault };
          }),
        };
      });
    },
    [updateAccountData]
  );

  const removeAddress = useCallback(
    (addressId) => {
      updateAccountData((currentData) => {
        const addresses = currentData.addresses.filter(
          (address) => address.id !== addressId
        );
        if (addresses.length > 0 && !addresses.some((item) => item.isDefault)) {
          addresses[0] = { ...addresses[0], isDefault: true };
        }
        return { ...currentData, addresses };
      });
    },
    [updateAccountData]
  );

  const setDefaultAddress = useCallback(
    (addressId) => {
      updateAccountData((currentData) => ({
        ...currentData,
        addresses: currentData.addresses.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        })),
      }));
    },
    [updateAccountData]
  );

  const value = useMemo(
    () => ({
      addresses: Array.isArray(accountData.addresses)
        ? accountData.addresses
        : [],
      addAddress,
      saveAddress,
      removeAddress,
      setDefaultAddress,
      getAddressLabel,
    }),
    [accountData, addAddress, saveAddress, removeAddress, setDefaultAddress]
  );

  return createElement(AccountDataContext.Provider, { value }, children);
}
