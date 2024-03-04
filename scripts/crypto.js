export default async function getCurrentPrice({coin_id}){
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=" + coin_id + "&vs_currencies=eur",{
         method: "GET",
         mode: "cors",
         cache: "no-cache",
         headers: {
             "x-cg-demo-api-key": process.env.EXPO_PUBLIC_COIN_GECKO_API_TOKEN,
             "Content-Type": "application/json" 
    }
    });
    const jsonData = await res.json();
    return jsonData;
}

export async function getHistory({coin_id}){
    const res = await fetch("https://api.coingecko.com/api/v3/coins/" + coin_id +"/market_chart?vs_currency=eur&days=1",{
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "x-cg-demo-api-key": process.env.EXPO_PUBLIC_COIN_GECKO_API_TOKEN,
            "Content-Type": "application/json" 
        }
    });
    const jsonData = await res.json();
    //only return price because the app won't display the rest of the data
    return jsonData.prices;

    
}