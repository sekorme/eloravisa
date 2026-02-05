export async function convertCurrency(ghsAmount: number, targetCurrency: string): Promise<number> {
    if (targetCurrency === "USD") return ghsAmount;

    try {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/2138fe6c21e660424e59f1ae/latest/USD`);

        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log("ExchangeRate API response:", data);

        const rate = data?.conversion_rates?.[targetCurrency];

        if (!rate || typeof rate !== "number") {
            throw new Error(`Invalid or missing rate for ${targetCurrency}`);
        }

        return Number((ghsAmount * rate).toFixed(2)); // round to 2 decimals
    } catch (error) {
        console.error("Currency conversion error:", error);
        return ghsAmount; // fallback to original amount
    }
}
