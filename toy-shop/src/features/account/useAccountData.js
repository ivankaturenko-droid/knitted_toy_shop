import { useContext } from 'react';
import { AccountDataContext } from './AccountContext.js';

export function useAccountData() {
  const accountData = useContext(AccountDataContext);
  if (!accountData) {
    throw new Error(
      'useAccountData потрібно використовувати всередині AccountDataProvider.'
    );
  }
  return accountData;
}
