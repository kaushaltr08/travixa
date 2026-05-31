require("dotenv").config({ path: "./config.env" });

const connectDB = require("../config/db");
const Destination = require("../models/Destination");
const Experience = require("../models/Experience");
const TravelStyle = require("../models/TravelStyle");

const destinations = [
  ["Goa", "goa", "Goa", "A coastal favorite for beaches, nightlife, Portuguese heritage, seafood, and relaxed weekend escapes.", "/images/destinations/goa.jpg", "November to February", "Rs. 12,000 - Rs. 45,000"],
  ["Jaipur", "jaipur", "Rajasthan", "A vibrant heritage city with forts, palaces, markets, museums, local food, and craft experiences.", "/images/destinations/jaipur.jpg", "October to March", "Rs. 9,500 - Rs. 38,000"],
  ["Udaipur", "udaipur", "Rajasthan", "The city of lakes, palaces, rooftop dining, heritage hotels, and romantic sunset boat rides.", "/images/destinations/udaipur.jpg", "October to March", "Rs. 10,000 - Rs. 55,000"],
  ["Rishikesh", "rishikesh", "Uttarakhand", "A Ganga-side destination for yoga, rafting, cafes, temples, suspension bridges, and wellness stays.", "/images/destinations/rishikesh.jpg", "September to June", "Rs. 9,000 - Rs. 32,000"],
  ["Manali", "manali", "Himachal Pradesh", "A mountain destination known for snow views, adventure sports, cafes, valleys, and road trips.", "/images/destinations/manali.jpg", "October to June", "Rs. 15,000 - Rs. 50,000"],
  ["Leh", "leh", "Ladakh", "A high-altitude adventure destination with monasteries, passes, lakes, rugged drives, and stark landscapes.", "/images/destinations/leh.jpg", "May to September", "Rs. 25,000 - Rs. 75,000"],
  ["Kerala", "kerala", "Kerala", "A lush travel circuit with backwaters, beaches, tea gardens, wildlife, Ayurveda, and houseboats.", "/images/destinations/kerala.jpg", "September to March", "Rs. 18,000 - Rs. 60,000"],
  ["Kashmir", "kashmir", "Jammu and Kashmir", "A scenic valley experience with lakes, gardens, meadows, snow activities, and mountain views.", "/images/destinations/kashmir.jpg", "March to October and December to February", "Rs. 22,000 - Rs. 70,000"],
  ["Andaman", "andaman", "Andaman and Nicobar Islands", "An island escape for turquoise beaches, scuba diving, snorkeling, ferries, and quiet coastal stays.", "/images/destinations/andaman.jpg", "October to May", "Rs. 28,000 - Rs. 85,000"],
].map(([name, slug, state, description, coverImage, bestTimeToVisit, budgetRange]) => ({
  name,
  slug,
  state,
  description,
  coverImage,
  bestTimeToVisit,
  budgetRange,
  hiddenGems: ["Quiet viewpoint", "Local market lane", "Old neighborhood walk"],
  attractions: ["Signature viewpoint", "Historic quarter", "Cultural landmark"],
  localExperiences: ["Guided food walk", "Sunset trail", "Craft or nature experience"],
  foodRecommendations: ["Regional thali", "Street snack", "Local dessert"],
}));

const travelStyles = [
  ["Adventure", "Trekking, rafting, passes, forests, and high-energy outdoor plans.", "mountain"],
  ["Luxury", "Boutique stays, private transfers, spa time, and elevated dining.", "sparkles"],
  ["Couple Escape", "Romantic stays, sunset windows, quiet neighborhoods, and slow meals.", "heart"],
  ["Hidden Gems", "Less obvious places, local lanes, viewpoints, and distinctive stays.", "compass"],
  ["Photography", "Golden-hour routes, textured markets, landscapes, and clean frames.", "camera"],
  ["Food Explorer", "Markets, street food, regional kitchens, and chef-led discoveries.", "utensils"],
];

const seedDestinations = async () => {
  await connectDB();

  const savedDestinations = [];
  for (const destination of destinations) {
    const saved = await Destination.findOneAndUpdate({ slug: destination.slug }, destination, {
      returnDocument: "after",
      runValidators: true,
      upsert: true,
    });
    savedDestinations.push(saved);
  }

  for (const [name, description, icon] of travelStyles) {
    await TravelStyle.findOneAndUpdate(
      { name },
      { name, description, icon },
      { returnDocument: "after", runValidators: true, upsert: true }
    );
  }

  for (const destination of savedDestinations.slice(0, 6)) {
    await Experience.findOneAndUpdate(
      { destinationId: destination._id, title: `${destination.name} local intelligence walk` },
      {
        destinationId: destination._id,
        title: `${destination.name} local intelligence walk`,
        category: "Local Experience",
        description: `A curated Travixa experience for discovering ${destination.name} beyond the obvious stops.`,
        image: destination.coverImage,
      },
      { returnDocument: "after", runValidators: true, upsert: true }
    );
  }

  console.log(`Seeded ${destinations.length} destinations, ${travelStyles.length} styles, and sample experiences.`);
  process.exit(0);
};

seedDestinations().catch((error) => {
  console.error(error);
  process.exit(1);
});
