// Eleventy configuration. Content lives in src/, the built site goes to _site/.
export default function (config) {
  config.addPassthroughCopy({ "src/assets": "assets" });
  config.addPassthroughCopy({ "src/static": "." });
  config.addPassthroughCopy({ "src/uploads": "wp-content/uploads" });
  // Images load only as the reader scrolls to them.
  config.addTransform("lazy-images", (content, outputPath) =>
    outputPath && outputPath.endsWith(".html") ? content.replace(/<img (?!loading=)/g, '<img loading="lazy" decoding="async" ') : content
  );
  config.ignores.add("src/drafts/**");
  config.ignores.add("src/_settings/**");

  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  config.addFilter("readable", (d) => fmt.format(new Date(d)));
  config.addFilter("iso", (d) => new Date(d).toISOString().slice(0, 10));
  config.addFilter("slug", (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  config.addFilter("limit", (a, n) => a.slice(0, n));
  // Plain text from rendered HTML, with entities decoded so the template can escape them once.
  const decode = (t) => t.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  // Summary for lists: skips images, their captions, headings and reference lists.
  const summarise = (html) => {
    let h = String(html || "")
      .replace(/<figure[\s\S]*?<\/figure>/g, " ")
      .replace(/<h[1-6][\s\S]*?<\/h[1-6]>/g, " ")
      .replace(/<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?[^<]{0,140}<\/p>(\s*<p>(?:(?!<\/p>)[\s\S]){0,140}?(?<![.?!…"”'’:)])\s*<\/p>)?/g, " ")
      .replace(/<img[^>]*>/g, " ");
    const t = decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").replace(/\s([.,;:?!])/g, "$1").trim();
    return t.length > 200 ? t.slice(0, 200).replace(/\s\S*$/, "").replace(/[,;:]$/, "") + "…" : t;
  };
  config.addFilter("excerpt", summarise);
  config.addFilter("summary", (post) => post.data.description || summarise(post.templateContent));
  config.addFilter("firstImage", (html) => {
    const m = String(html || "").match(/<img[^>]*src="([^"]+)"/);
    return m ? m[1] : "";
  });

  // The site's themes. Each article keeps its detailed topics; this groups them for browsing.
  const THEMES = {
    "Leadership": ["Leadership", "Servant Leadership", "Feedback", "Talent", "Motivation", "Authenticity", "Excellence", "FACTER", "Sandbox"],
    "Faith & Reflection": ["Faith", "Reflection & Journaling", "Restoration", "Simplicity", "Easter", "Fasting", "Appreciation", "Stewardship", "Education", "Reading Levels"],
    "Family": ["Family", "Parenting", "Marriage"],
    "Bhutan": ["Bhutan"],
    "Public Service": ["Public Service"],
    "Hard Seasons": ["Hard Seasons", "Suffering", "Trials", "Dying"],
    "Change & Purpose": ["Change", "Transition", "Purpose"],
  };
  const themesOf = (topics) => Object.keys(THEMES).filter((th) => (topics || []).some((t) => th === t || THEMES[th].includes(t)));
  config.addFilter("themes", themesOf);
  const byNewest = (a, b) => b.date - a.date;
  config.addFilter("related", (all, page, topics) => {
    const mine = themesOf(topics);
    return all.filter((p) => p.url !== page.url && themesOf(p.data.topics).some((t) => mine.includes(t))).slice(0, 3);
  });
  config.addFilter("neighbours", (all, page) => {
    const i = all.findIndex((p) => p.url === page.url);
    return { newer: i > 0 ? all[i - 1] : null, older: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
  });
  config.addCollection("featured", (api) => api.getFilteredByTag("posts").filter((p) => p.data.featured).sort((a, b) => a.data.featured - b.data.featured));

  config.addCollection("articles", (api) => api.getFilteredByTag("posts").sort((a, b) => b.date - a.date));
  config.addCollection("topicList", (api) => {
    const posts = api.getFilteredByTag("posts");
    return Object.keys(THEMES)
      .map((name) => ({ name, items: posts.filter((p) => themesOf(p.data.topics).includes(name)).sort(byNewest) }))
      .filter((t) => t.items.length);
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
