/** Unsplash images curated per template niche */
export const TEMPLATE_IMAGES = {
  heroLaunch:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80",
  heroSaas:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
  heroCoaching:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80",
  heroWebinar:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80",
  heroAgency:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
  heroFree:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80",
  formDark:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
  ctaGlow:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80",
  videoThumb:
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7a132?w=1200&q=80",
  avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  avatar2: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  avatar3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  feature1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  feature2: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
  feature3: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
  gallery1: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  gallery2: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  gallery3: "https://images.unsplash.com/photo-1556760543-740958af8cc0?w=800&q=80",
  gallery4: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
} as const;

export const TEMPLATE_PREVIEW_IMAGES: Record<string, string> = {
  "free-starter": TEMPLATE_IMAGES.heroFree,
  launch: TEMPLATE_IMAGES.heroLaunch,
  saas: TEMPLATE_IMAGES.heroSaas,
  coaching: TEMPLATE_IMAGES.heroCoaching,
  webinar: TEMPLATE_IMAGES.heroWebinar,
  agency: TEMPLATE_IMAGES.heroAgency,
};
