import AboutHero from "../Components/About/aboutHero";
import WhoweAre from "../Components/About/WhoweAre";
import AboutFeatured from "../Components/About/AboutFeatured";
import AboutVideo from "../Components/About/AboutVideo";
import Newsletter from "../Components/Layout/Newsletter";
import "./about.css";

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <WhoweAre />
      <AboutFeatured />
      <AboutVideo />
      <Newsletter />
    </div>
  );
}
