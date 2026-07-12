import type { MetadataRoute } from "next";
import { locales } from "./[lang]/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quoteflow.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/solicitar"];

  return locales.flatMap((lang) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${lang}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, `${BASE_URL}/${alt}${route}`]),
        ),
      },
    })),
  );
}