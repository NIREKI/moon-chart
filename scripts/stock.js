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
     * @param {string} symbol Das Symbol der Aktie, zB AAPL für Apple
     * @var key Muss in der .env als EXPO_PUBLIC_FINNHUB_API_TOKEN angegeben werden
     */
export async function getCurrentStockPrice( {symbol} ){
    // using the finnhub quote endpoint: https://finnhub.io/api/v1/quote?symbol=&token=
    //https://finnhub.io/docs/api/quote
    let key = process.env.EXPO_PUBLIC_FINNHUB_API_TOKEN;
    const res = await fetch("https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + key, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(res.status !== 200){
        console.log("Error")
    }
    if(res.status === 429){
        console.log("Finnhub Rate Limit Exceeded");
    }
    const jsonData = await res.json();
    console.log(jsonData);

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
 * @returns JSON Object mit allen aktuellen Tagen an denen die Börse außerordentlich geschlossen hat:
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
 * @param {*} param0 
 */
export async function getStockCompanyProfile( {symbol} ){
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
    console.log(jsonData);
    return jsonData;
}