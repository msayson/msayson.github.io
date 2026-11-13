import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const routeManifest = JSON.parse(
  await readFile(path.join(root, ".migration", "jekyll-routes.json"), "utf8"),
);

for (const route of routeManifest.canonicalFiles) {
  const url = route.replace(/index\.html$/, "");
  test(`canonical route responds: ${url}`, async ({ request, baseURL }) => {
    const response = await request.get(new URL(url, baseURL).toString());
    expect(response.status(), url).toBe(200);
  });
}

test("home page links to featured posts and the blog index", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Selected Articles" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View all posts" }),
  ).toHaveAttribute("href", "/blog/");
});

test("blog pagination and category navigation work", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Blog pages" })).toBeVisible();
  await page.getByRole("link", { name: "Older »" }).click();
  await expect(page).toHaveURL(/\/blog\/page2\/$/);
  await page.getByRole("link", { name: "View Categories" }).click();
  await expect(page).toHaveURL(/\/blog\/categories\/$/);
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
});

test("site navigation opens search and finds blog posts", async ({ page }) => {
  await page.goto("/blog/");
  await page.getByRole("link", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\/$/);
  await expect(page.getByRole("heading", { name: "Search posts" })).toBeVisible();

  await page.locator("pagefind-input input").fill("data deletion verification");
  await expect(
    page.locator(
      'pagefind-results a[href="/blog/gaps-in-data-deletion-verification-auditability/"]',
    ),
  ).toBeVisible();
});

test("RSS feed is served as XML", async ({ request, baseURL }) => {
  const response = await request.get(new URL("/feed.xml", baseURL).toString());
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  expect(await response.text()).toContain("<rss");
});

test("images load on representative pages", async ({ page }) => {
  for (const route of [
    "/about/",
    "/blog/aws-organization-members-cost-explorer-access/",
    "/blog/epson-configuring-printers-on-linux/",
    "/blog/starting-out-on-debian/",
    "/blog/lxde-customizing-the-log-in-background/",
    "/blog/advances-in-computer-vision-and-chasing-long-tail/",
  ]) {
    await page.goto(route);
    const images = page.locator("article img");
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute("src", /.+/);
      await expect(image).toHaveAttribute("alt");
      await expect
        .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
        .toBe(true);
    }
  }
});

test("known above-the-fold images load eagerly at desktop viewport", async ({ page }) => {
  const expectedImages = [
    ["/blog/setting-vim-colour-schemes/", "20161129_vimDefaultColourScheme"],
    ["/blog/scalability-of-data-processing/", "20170404_singleSocket"],
    [
      "/blog/concurrency-from-app-to-massively-distributed-service/",
      "20231130_DistributedComputeToHandleMillionTps-MultiThreadedApp",
    ],
    ["/blog/reviving-a-dead-laptop-with-linux/", "20160515_lxlewebsite"],
    [
      "/blog/security-engineering-by-ross-anderson/",
      "20160624_securityengineering_anderson_cover",
    ],
    [
      "/blog/advances-in-computer-vision-and-chasing-long-tail/",
      "20160606_terrykimura_stuffedanimals_facialrecognition",
    ],
    [
      "/blog/advances-in-computer-vision-and-chasing-long-tail/",
      "20160606_vislab_followingaperson",
    ],
    ["/blog/starting-out-on-debian/", "20160307_debian_family_tree"],
    ["/blog/debian-setting-environment-variables/", "20160324_go_version"],
    ["/blog/lxde-customizing-the-log-in-background/", "20160307_orion_nebula_nasa_images600"],
  ];

  for (const [route, filename] of expectedImages) {
    await page.goto(route);
    const image = page.locator(`img[src*="${filename}."]`);
    await expect(image).toHaveAttribute("loading", "eager");
    await expect(image).toHaveAttribute("fetchpriority", "high");
  }
});
