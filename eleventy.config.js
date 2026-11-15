// Eleventy configuration. Content lives in src/, the built site goes to _site/.
export default function (config) {
  config.addPassthroughCopy({ "src/assets": "assets" });
  config.addPassthroughCopy({ "src/static": "." });
  config.ignores.add("src/drafts/**");
  config.ignores.add("src/_settings/**");

  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  config.addFilter("readable", (d) => fmt.format(new Date(d)));
  config.addFilter("iso", (d) => new Date(d).toISOString().slice(0, 10));
  config.addFilter("slug", (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  config.addFilter("limit", (a, n) => a.slice(0, n));
  config.addFilter("excerpt", (html) => {
    const t = String(html || "").replace(/<figure[\s\S]*?<\/figure>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > 200 ? t.slice(0, 200).replace(/\s\S*$/, "") + "…" : t;
  });

  config.addCollection("articles", (api) => api.getFilteredByTag("posts").sort((a, b) => b.date - a.date));
  config.addCollection("topicList", (api) => {
    const map = new Map();
    for (const item of api.getFilteredByTag("posts")) {
      for (const t of item.data.topics || []) {
        if (!map.has(t)) map.set(t, []);
        map.get(t).push(item);
      }
    }
    return [...map.entries()]
      .map(([name, items]) => ({ name, items: items.sort((a, b) => b.date - a.date) }))
      .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
