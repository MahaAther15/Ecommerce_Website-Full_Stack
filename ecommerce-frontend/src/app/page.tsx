import HomeHero from "./Components/Home/HomeHero";
import FeaturedDetails from "./Components/Home/featuredDetails";
import FeaturedText from "./Components/Home/FeaturedText";
import SaleOffer from "./Components/Home/SaleOffer";
import NewArrivals from "./Components/Home/NewArrivals";
import HomeBanner from "./Components/Home/HomeBanner";
import HomeBanner2 from "./Components/Home/HomeBanner2";
import HomeBlogSection from "./Components/Home/HomeBlogSection";

export default function Home() {
  return (
    <main>
      <HomeHero />
      <FeaturedDetails />
      <FeaturedText />
      <SaleOffer />
      <NewArrivals />
      <HomeBanner />
      <HomeBanner2 />
      <HomeBlogSection />
    </main>
  );
}
