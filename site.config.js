const CONFIG = {
  // profile setting (required)
  profile: {
    name: "NEW_EMPIRE",
    image: "/Cow Avatar.png",
    role: "도전러",
    bio: "살다보니, 살아집니다.",
    email: "newempire.biz@gmail.com",
    linkedin: "",
    github: "",
    instagram: "new_empire7",
  },
  projects: [
    {
      name: `이런저런 사업`,
      href: "",
    },
  ],
  // blog setting (required)
  blog: {
    title: "NEW_EMPIRE",
    description: "welcome to newempire-log!",
  },

  // CONFIG configration (required)
  link: "https://newempire.vercel.app",
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
      repo: "newewempire7/newempire",
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
