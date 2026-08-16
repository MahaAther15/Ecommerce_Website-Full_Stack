import Button from "../Common/Button";

export default function HomeBanner() {
  return (
    <section id="sm-banner" className="section-p1">
      <div className="banner-box">
        <h4>Crazy Deals</h4>
        <h2>Buy 1 Get 1 free</h2>
        <span>The Best classic dress is on sale at carax</span>
        <Button text="Learn More" className="white" />
      </div>
      <div className="banner-box banner-box2">
        <h4>Spring/Summer</h4>
        <h2>Upcomming season</h2>
        <span>The Best classic dress is on sale at carax</span>
        <Button text="Collection" className="white" />
      </div>
    </section>
  );
}