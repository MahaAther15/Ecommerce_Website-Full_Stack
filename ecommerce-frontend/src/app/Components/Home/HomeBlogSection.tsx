export default function HomeBlogSection() {
  return (
    <section id="news-letter" className="section-p1 section-m1">
      <div className="newstext">
        <h4>Sign Up For Newsletters</h4>
        <p>
          Get E-mail updates about our latest shop and <span>special offers.</span>
        </p>
      </div>
      <div className="form">
        <input type="text" placeholder="Your email address" />
        <button className="sign">Sign Up</button>
      </div>
    </section>
  );
}
