import useAppStore from "../store/useAppStore";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
};

const CURRENCY_RATES = {
  // Hardcoded for now. In a real app, this would be fetched from an API
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
};

export default function useCurrencyFormatter() {
  const { currency } = useAppStore();

  const formatAmount = (amountInINR) => {
    // Assuming backend always stores in INR. If backend stores in original currency, no conversion needed.
    // For this app, let's assume base currency in DB is INR.
    const convertedAmount = amountInINR * (CURRENCY_RATES[currency] || 1);
    
    const symbol = CURRENCY_SYMBOLS[currency] || "₹";
    
    return `${symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return { formatAmount, currencySymbol: CURRENCY_SYMBOLS[currency] || "₹" };
}
