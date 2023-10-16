const CONFIG = {
  // profile setting (required)
  profile: {
    name: "newdoin",
    image: "/avatar_custom.png",
    role: "frontend developer",
    bio: "사람들이 찾는 서비스를 만들고 싶어요",
    email: "ehdls6864@naver.com",
    linkedin: "",
    github: "newdoin",
    instagram: "",
  },
  projects: [
    {
      name: `blog`,
      href: "https://github.com/newdoin/newdoin-log",
    },
  ],
  // blog setting (required)
  blog: {
    title: "newdoin-log",
    description: "welcome to newdoin-log!",
  },

  // CONFIG configration (required)
  link: "https://newdoin-log.vercel.app",
  since: 2023, // If leave this empty, current year will be used.
  lang: "ko-KR", // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES', 'ko-KR']
  ogImageGenerateURL: "https://og-image-korean.vercel.app", // The link to generate OG image, don't end with a slash

  // notion configuration (required)
  notionConfig: {
    pageId: process.env.NOTION_PAGE_ID,
  },

  // plugin configuration (optional)
  googleAnalytics: {
    enable: false,
    config: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID || "",
    },
  },
  googleSearchConsole: {
    enable: false,
    config: {
      siteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    },
  },
  utterances: {
    enable: true,
    config: {
      repo: "newdoin/blog-comments",
      "issue-term": "og:title",
      label: "💬 Utterances",
    },
  },
  cusdis: {
    enable: false,
    config: {
      host: "https://cusdis.com",
      appid: "", // Embed Code -> data-app-id value
    },
  },
  isProd: process.env.VERCEL_ENV === "production", // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  revalidateTime: 21600 * 7, // revalidate time for [slug], index
}

module.exports = { CONFIG }
