const debugAPI = false;
/**
     * @returns Returned ein JSON Object wie
     * {"c": 175.26, "d": -4.4, "dp": -2.4491, "h": 176.9, "l": 173.7901, "o": 176.15, "pc": 179.66, "t": 1709582846}
     * c = Current Price
     * d = Change zum previous close
     * dp = Change in Prozent zum previous close
     * h = Highest, höchster Wert heute
     * l = geringster Wert heute
     * o: Open Wert
     * pc: previous close
     * t: timestamp der Daten.
     * @copyright finnhub https://finnhub.io/docs/api/quote
     * @param {string} symbol Das Symbol der Aktie, zB AAPL für Apple
     * @var key Muss in der .env als EXPO_PUBLIC_FINNHUB_API_TOKEN angegeben werden
     */
export async function getCurrentStockPrice( {symbol} ){
    var noFetch = false;
    if(noFetch) {
        return(require('../data/finnhuh_quote.json'));
    }
    let key = process.env.EXPO_PUBLIC_FINNHUB_API_TOKEN;
    const res = await fetch("https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(debugAPI){
        console.log("Stock Price: ", res.status);
    }
    if(res.status !== 200){
        console.log("Error")
    }
    if(res.status === 429){
        //TODO: handle rate limit
        console.log("Finnhub Rate Limit Exceeded");
    }
    const jsonData = await res.json();

    return jsonData;
    
}
/**
 * @returns JSON Object mit:
 * {"exchange": "US", "holiday": null, "isOpen": true, "session": "regular", "t": 1709584064, "timezone": "America/New_York"}
 * exchange = US (keine andere wird von dem free key unterstützt)
 * holiday = ob aktuell Feiertag ist
 * isOpen = true/false ob die börse geöffnet hat
 * session: die aktuelle session in der die Börse sich befindet.. "pre-market"/"regular"
 * t = Timestamp
 * @copyright finnhub
 */
export async function getStockMarketStatus() {
    let key = process.env.EXPO_PUBLIC_FINNHUB_API_TOKEN;
    const res = await fetch("https://finnhub.io/api/v1/stock/market-status?exchange=US&token=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const jsonData = await res.json();
    
    return jsonData;
}
/**
 * Fraglich, ob diese Funktion genutzt wird.
 * @returns JSON Object mit allen aktuellen Tagen an denen die Börse außerordentlich geschlossen hat
 * @copyright finnhub
 */
export async function getStockMarketHolidays() {
    /**
     * response:
     * {"data": [{"atDate": "2026-12-25", "eventName": "Christmas Day", "tradingHour": ""},...}
     */
    let key = process.env.EXPO_PUBLIC_FINNHUB_API_TOKEN;
    const res = await fetch("https://finnhub.io/api/v1/stock/market-holiday?exchange=US&token=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const jsonData = await res.json();

    return jsonData;
}
/**
 * @returns JSON Object mit Informationen zum Unternehmen.
 * country
 * currency
 * exchange
 * finnhubIndustry -> Welcher Industrie die Firma zugehört ist laut Finnhub
 * ipo -> erstmaliger öffentlicher Verkauf der Wertpapiere
 * logo -> svg link zu dem Logo des Unternehmens
 * marketCapitalization -> Gesamtwert des Unternehmens
 * name -> name des Unternehmens
 * phone -> Telefonnummer
 * ticker -> zB AAPL
 * weburl -> Website des Unternehmens
 * @copyright finnhub
 * @param {*} param0 
 */
export async function getStockCompanyProfile( {symbol} ){
    var noFetch = false;
    if(noFetch) {
        return(require('../data/finnhub_profile2.json'));
    }
    let key = process.env.EXPO_PUBLIC_FINNHUB_API_TOKEN;
    const res = await fetch("https://finnhub.io/api/v1/stock/profile2?symbol=" + symbol + "&token=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const jsonData = await res.json();
    return jsonData;
}

/**
 * Retrieves stock history data for the given symbol.
 *
 * Response Format: "results":[{"v":47237,"vw":181.4583,"o":181.7,"c":181.48,"h":181.9,"l":181.15,"t":1708419600000,"n":1787},...]
 * Macht es notwendig, dass die Daten für eine Verwendung wie bei crypto.js transformiert werden müssen, Format: [timestamp, preis]
 * 
 * Wichtig ist hier der timestamp "t" und der Wert "vw" als Preis, da dies der Struktur von CoinGecko am nahesten kommt.
 * 
 * Problem: Die API kann nur Daten zurückgeben, die ein Tag alt sind, also den heutigen Tag nicht beinhalten.
 * @param {Object} symbol - the stock symbol to retrieve data for
 * @return {Object} the JSON data containing the stock history
 * @copyright polygon.io
 */
export async function getStockHistory( {symbol, exchangeRate} ){
    let today = getTodaysDate();
    let yesterday = getYesterdaysDate();
    let key = process.env.EXPO_PUBLIC_POLYGON_API_TOKEN;
    // gibt den letzten Tag in 10 minütigen Abständen zurück.
    const res = await fetch("https://api.polygon.io/v2/aggs/ticker/" + symbol + "/range/10/minute/" + yesterday + "/" + today +"?adjusted=true&sort=asc&limit=5000&apiKey=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(debugAPI){
        console.log("Stock history: ", res.status);
    }
    if(res.status === 429){
        // TODO: Handle too many requests error. Only 5 requests per minute allowed.
        return null;
    } else if (res.status === 200){
        const jsonData = await res.json();
        const filteredResults = jsonData.results.map((item) => ({timestamp: item.t, price: (exchangeRate >= 1) ? item.vw * exchangeRate : item.vw / exchangeRate}));
        return filteredResults;
    }
    
}

/**
     * Function to get today's date in the format 'yyyy-mm-dd'.
     *
     * @return {string} The formatted date string
     */
function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Get yesterday's date in the format 'YYYY-MM-DD'.
 *
 * @return {string} The formatted yesterday's date
 */
function getYesterdaysDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}