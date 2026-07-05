/** Curated Unsplash URLs — Asia travel (ixlib params for reliable CDN delivery) */
export function unsplashUrl(photoId: string, width = 800) {
  return `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;
}

export const UNSPLASH = {
  hero: unsplashUrl("photo-1528183429752-a97d0bf99b5a", 1600),
  heroAlt: unsplashUrl("photo-1582719478250-c89cae4dc85b", 1200),
  heroEco: unsplashUrl("photo-1520250497591-112f2f40a3f4", 1200),
  aboutMountain: unsplashUrl("photo-1469854523086-cc02fe5d8800", 600),
  aboutTemple: unsplashUrl("photo-1528183429752-a97d0bf99b5a", 600),
  aboutLake: unsplashUrl("photo-1506905925346-21bda4d32df4", 600),
  destinations: {
    chiangMai: unsplashUrl("photo-1528183429752-a97d0bf99b5a", 800),
    bali: unsplashUrl("photo-1571896349842-33c89424de2d", 800),
    phiPhi: unsplashUrl("photo-1520250497591-112f2f40a3f4", 800),
    hoiAn: unsplashUrl("photo-1582719478250-c89cae4dc85b", 800),
    singapore: unsplashUrl("photo-1525625293386-3f8f99389edd", 800),
    luangPrabang: unsplashUrl("photo-1506905925346-21bda4d32df4", 800),
  },
  /** Used when a destination image fails to load */
  destinationFallback: unsplashUrl("photo-1528183429752-a97d0bf99b5a", 800),
  stays: {
    homestay: unsplashUrl("photo-1566073771259-6a8506099945", 900),
    boutique: unsplashUrl("photo-1582719478250-c89cae4dc85b", 900),
    ecoLodge: unsplashUrl("photo-1520250497591-112f2f40a3f4", 900),
    guesthouse: unsplashUrl("photo-1571896349842-33c89424de2d", 900),
  },
} as const;
