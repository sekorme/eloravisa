export async function getUserCurrencyInfo(){
    const res = await fetch("https://ipapi.co/json/")
    const data = await res.json()
    return {
        country: data.country_name,
        currency: data.currency
    }
}


export async function convertGHS(amount:number, toCurrency:string){
    const res = await fetch(`https://api.exchangerate.host/convert?from=GHS&to=${toCurrency}&amount=${amount}`)
    const data = await res.json()
    return data.result
}