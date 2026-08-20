import type { MetadataRoute } from "next";
import { exams } from "@/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signin`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const exam of exams) {
    const root = `${base}/exams/${exam.id}`;
    // A retiring exam should not be promoted as heavily as its successor.
    const retired = exam.retiresOn ? new Date(exam.retiresOn) <= now : false;
    const priority = retired ? 0.3 : 0.9;

    entries.push(
      { url: root, lastModified: now, changeFrequency: "monthly", priority },
      { url: `${root}/study`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.1 },
      { url: `${root}/practice`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.1 },
      { url: `${root}/flashcards`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.1 },
      { url: `${root}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.2 },
      { url: `${root}/mock`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.1 },
      { url: `${root}/resources`, lastModified: now, changeFrequency: "monthly", priority: priority - 0.2 },
    );

    for (const study of exam.caseStudies) {
      entries.push({
        url: `${root}/case-studies/${study.id}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: priority - 0.3,
      });
    }
  }

  return entries;
}
