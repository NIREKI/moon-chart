/**
 * 
 * @param {string} coin_id die ID des Coins bei CoinGecko, zB bitcoin für Bitcoin 
 * @returns den aktuellen Kurs der gewünschten Kryptowährung in EUR
 * @var key muss in der .env als EXPO_PUBLIC_COIN_GECKO_API_TOKEN angegeben werden
 */
//if true wir der fetch status in der console gelogged
const debugAPI = false;
export default async function getCurrentCryptoPrice({coin_id}){
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
    return jsonData[coin_id].eur;
}
/**
 * TODO: Days Parameter einfügen
 * @param {string} coin_id die ID des Coins bei CoinGecko, zB bitcoin für Bitcoin 
 * @returns ein zweidimensionales Array, was aus [timestamp, preis] besteht.
 */
export async function getCryptoHistory({coin_id}){
    const res = await fetch("https://api.coingecko.com/api/v3/coins/" + coin_id +"/market_chart?vs_currency=eur&days=1",{
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "x-cg-demo-api-key": process.env.EXPO_PUBLIC_COIN_GECKO_API_TOKEN,
            "Content-Type": "application/json" 
        }
    });
    if(debugAPI){
        console.log("Crypto history: ", res.status);
    }
    const jsonData = await res.json();
    // vorab wird die Data in das Format [[timestamp, price],...] gebracht.
    const jsonResponse = jsonData.prices.map(item => {
        return{
            timestamp: item[0],
            price: item[1]
        }
    });
    //es wird nur das prices object mitgegeben, da die anderen Daten an keiner Stelle angezeigt werden sollen.
    return jsonResponse;

    
}