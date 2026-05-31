export interface Country {
    name: string;
    requiresInterview: boolean;
    consulateName: string;
}

export const countries: Country[] = [
    { name: "United States", requiresInterview: true, consulateName: "U.S. Consulate" },
    { name: "United Kingdom", requiresInterview: true, consulateName: "British High Commission" },
    { name: "Canada", requiresInterview: true, consulateName: "Consulate General of Canada" },
    { name: "Australia", requiresInterview: false, consulateName: "Australian High Commission" },
    { name: "Germany", requiresInterview: true, consulateName: "German Consulate" },
    { name: "France", requiresInterview: true, consulateName: "Consulate General of France" },
    { name: "Japan", requiresInterview: true, consulateName: "Consulate General of Japan" },
    { name: "South Korea", requiresInterview: true, consulateName: "Consulate General of the Republic of Korea" },
    { name: "China", requiresInterview: true, consulateName: "Consulate General of China" },
    { name: "Brazil", requiresInterview: true, consulateName: "Consulate General of Brazil" },
    { name: "Nigeria", requiresInterview: true, consulateName: "Consulate General of Nigeria" },
    { name: "India", requiresInterview: true, consulateName: "Consulate General of India" },
    { name: "Singapore", requiresInterview: false, consulateName: "Singapore High Commission" },
    { name: "Switzerland", requiresInterview: false, consulateName: "Consulate General of Switzerland" },
    { name: "United Arab Emirates", requiresInterview: true, consulateName: "Consulate General of the UAE" },
    { name: "Turkey", requiresInterview: true, consulateName: "Consulate General of Turkey" },
];

export function getRandomCountry(): Country {
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

export function getCountryByName(name: string): Country | undefined {
    if (!name) return undefined;
    return countries.find(c => c.name.toLowerCase() === name.toLowerCase());
}
