const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

exports.liveScore = async function liveScore(link) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    );
    await page.setDefaultNavigationTimeout(0);
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      )
        req.abort();
      else req.continue();
    });
    await page.goto(link);
    const button = await page.$(
      "#container > section.Layout__Content-nwxypc-0.bwIGHL > span.MainContent__MainContentWrapper-mpfhc-0.gFKhTV > div > div.RacePage__ContentWrapper-sc-1mwzmtr-0.jfTEUP > div.RacePage__ButtonWrapper-sc-1mwzmtr-2.bmkyTa > nav > div:nth-child(2)"
    );

    await button.click();

    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const html = document.querySelector(
        "#container > section.Layout__Content-nwxypc-0.bwIGHL > span.MainContent__MainContentWrapper-mpfhc-0.gFKhTV > div > div.RacePage__ContentWrapper-sc-1mwzmtr-0.jfTEUP > div.LiveShow__TableOuter-mr0xq3-3.jtutqk"
      );
      return html.innerHTML;
    });
    const $ = cheerio.load(data);
    const rows = $(".LiveShow__TableRow-mr0xq3-0");
    let arr = [];
    rows.map((i, e) => {
      let result = "";
      const horseName = $(e).find(".LiveShow__HorseName-mr0xq3-9").text();
      const liveOdds = $(e).find(".LiveShow__MatchOddsText-mr0xq3-6").html();
      const horseNumber = $(e).find(".LiveShow__ClothNumber-mr0xq3-10").text();
      const liveOddData = $(liveOdds).find("span > span").text();
      if (liveOddData) {
        result += liveOddData.split(",")[0];
      }

      if (result.replace(",", "").length > 0) {
        arr.push({
          score: horseNumber + " " + result,
          value: eval(result),
          horseName,
        });
      }
    });
    await browser.close();
    return arr?.map((a, index) => ({ ...a, index: index + 1 }));
  } catch (error) {
    console.log(error);
    process.exit();
  }
};
