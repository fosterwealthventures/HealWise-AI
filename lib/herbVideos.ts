interface HerbVideoMapping {
  key: string;
  videoId: string;
}

const HERB_VIDEOS: HerbVideoMapping[] = [
  { key: 'cinnamon', videoId: '3N1nFHDXkIg' },
  { key: 'turmeric', videoId: 'rjY3_iQe9T0' },
  { key: 'wormwood', videoId: '4Fh32NpVUig' },
  { key: 'soursop', videoId: 'MXeOM7IHqnU' },
  { key: 'ginger', videoId: 'ZvQ_m8PzEVE' },
  { key: 'moringa', videoId: 'n8kN8hnHtNg' },
  { key: 'marshmallow root', videoId: 'i40JZdkT7aY' },
  { key: 'chicory root', videoId: 'XK2KDD9OVjE' },
  { key: 'ashwagandha', videoId: 'Z9cPP0QaPFc' },
  { key: 'lemon balm', videoId: 'q0gVazJ15-8' },
  { key: 'mint', videoId: '-xPe4C-kN38' },
  { key: 'parsley', videoId: 'IRGNpnRArNk' },
  { key: 'dandelion', videoId: '9Ee8nqNtAh8' },
  { key: 'holy basil', videoId: '0XMY5qtHyBA' },
  { key: 'citronella', videoId: 'QyxfgbpjFCE' },
  { key: 'chamomile', videoId: 'gus2oz4TiHs' },
  { key: 'anxiety', videoId: 'N_YFDMvEMeE' },
  { key: 'passionflower', videoId: 'N_YFDMvEMeE' },
];

export function getHerbVideoId(herbName: string): string | null {
  const lowerName = herbName.toLowerCase();
  const entry = HERB_VIDEOS.find(({ key }) => lowerName.includes(key.toLowerCase()));
  return entry?.videoId ?? null;
}
