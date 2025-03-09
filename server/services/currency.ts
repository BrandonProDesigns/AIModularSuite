import axios from 'axios';

const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

interface ExchangeRates {
  rates: { [key: string]: number };
  time_last_update_utc: string;
}

let cachedRates: ExchangeRates | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const response = await axios.get(EXCHANGE_API_URL);
    cachedRates = response.data;
    lastFetch = now;
    return cachedRates;
  } catch (error) {
    throw new Error('Failed to fetch exchange rates');
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string
): Promise<number> {
  const rates = await getExchangeRates();
  
  if (!rates.rates[fromCurrency] || !rates.rates[toCurrency]) {
    throw new Error('Invalid currency code');
  }

  const baseRate = rates.rates[fromCurrency];
  const targetRate = rates.rates[toCurrency];
  
  return (amount / baseRate) * targetRate;
}
