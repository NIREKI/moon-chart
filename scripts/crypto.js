export default async function getCurrentPrice(){
    const res = fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur",{
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "x-cg-demo-api-key": process.env.EXPO_PUBLIC_COIN_GECKO_API_TOKEN,
            "Content-Type": "application/json" 
        }
    })
    .then(res => res.json())
    .then(res => console.log(res));
}

export async function getHistory(){
    const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=1",{
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "x-cg-demo-api-key": process.env.EXPO_PUBLIC_COIN_GECKO_API_TOKEN,
            "Content-Type": "application/json" 
        }
    });
    const jsonData = await res.json();
    console.log(jsonData.prices[0]);
    
}