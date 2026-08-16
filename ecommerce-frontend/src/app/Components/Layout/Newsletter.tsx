export default function Newsletter() {
    return (
        <section id="news-letter" className="section-p1 section-m1">
            <div className="newstext">
                <h4>Sign Up for NewsLetter</h4>
                <p>Get E-mail updates about our latest shop and <span>special offers</span></p>
            </div>
            <div className="form">
                <input type="text" placeholder="Your Email-Address" />
                <button className="sign">Sign Up</button>
            </div>
        </section>
    )
}