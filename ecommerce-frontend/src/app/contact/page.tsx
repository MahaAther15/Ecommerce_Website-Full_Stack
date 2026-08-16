import ContactHero from "../Components/Contact/ContactHero";
import ContactMap from "../Components/Contact/ContactMap";
import Contactform from "../Components/Contact/Contactform";
import Newsletter from "../Components/Layout/Newsletter";

export default function ContactPage() {
  return (
    <div>
      <ContactHero />
      <ContactMap />
      <Contactform />
      <Newsletter />
    </div>
  );
}
