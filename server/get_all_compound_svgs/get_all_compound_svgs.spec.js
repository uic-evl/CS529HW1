import { chromium } from "playwright";
import { test } from "@playwright/test";
import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("get_all_compound_svgs/data_part_a.json", "utf8")
);
const smilesList = data.map((item) => item.part_a_smiles);
const smilesText = smilesList.join("\n");

test("get_all_compound_svgs", async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(
    "https://www.cheminfo.org/Chemistry/Cheminformatics/SMILES_to_svg/index.html",
    { waitUntil: "domcontentloaded" }
  );

  const parent = await page.waitForSelector(
    '//*[text()="List of SMILES"]/../..'
  );

  await parent.click();

  await page.waitForTimeout(1000);

  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");

  await page.waitForTimeout(1000);

  const textarea = await page.waitForSelector(
    '//*[text()="List of SMILES"]/../..//textarea'
  );

  await textarea.fill(smilesText);

  await page.getByRole("button", { name: "Execute" }).click();

  await page.waitForTimeout(5000);

  const span = await page.waitForSelector(
    '//span[text()="SVG" and contains(@class, "slick-column-name")]'
  );
  await span.click({ button: "right" });

  await page.waitForTimeout(1000);

  // await page.pause();

  await page.click('//a[normalize-space(text())="Export"]');

  await page.waitForTimeout(1000);

  const exportTextarea = await page.waitForSelector(
    '//span[text()="Export data from module "]/../..//textarea'
  );

  const outputText = await exportTextarea.inputValue();

  fs.writeFileSync(
    "get_all_compound_svgs/all_compound_part_a_svgs.txt",
    outputText,
    "utf8"
  );

  console.log(
    "Extracted output saved to get_all_compound_svgs/all_compound_part_a_svgs.txt"
  );

  await browser.close();
});
