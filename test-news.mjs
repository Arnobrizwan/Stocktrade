import * as yf from 'yahoo-finance2';

async function testNews() {
    try {
        const YahooFinance = yf.default;
        const yahooFinance = new YahooFinance();
        const result = await yahooFinance.search('NVDA', { newsCount: 5 });
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error);
    }
}

testNews();
