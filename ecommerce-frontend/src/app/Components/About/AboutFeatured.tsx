import { FeaturedItem } from "@/app/types/about";
import featuresData from "@/app/data/about.json";



export default function AboutFeatured() {
    const features: FeaturedItem[] = featuresData;

    return (
        <section id="feature" className="section-p1">
            {features.map((feature) => (
                <div key={feature.id} className="fe-box">
                    <img src={feature.image} alt={feature.title} />
                    <h6>{feature.title}</h6>
                </div>
            ))}
        </section>
    );
}
