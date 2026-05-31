export type TravelStyle = {
  name: string;
  description: string;
  icon: string;
  accent: string;
};

export type Destination = {
  name: string;
  slug: string;
  state: string;
  description: string;
  coverImage: string;
  bestTimeToVisit: string;
  budgetRange: string;
  highlights: string[];
  hiddenGems: string[];
  attractions: string[];
  localExperiences: string[];
  foodRecommendations: string[];
};

export type GeneratedDay = {
  day: string;
  title: string;
  plan: string;
};
