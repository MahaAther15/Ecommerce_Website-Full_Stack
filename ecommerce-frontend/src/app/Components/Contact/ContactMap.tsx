export default function ContactMap() {
  return (
    <section id="contact-details" className="section-p1">
      <div className="details">
        <span>GET IN TOUCH</span>
        <h2>Visit one of your agency locations or contact us today</h2>
        <h3>Head Office</h3>
        <div>
          <li>
            <i className="fal fa-map"></i>
            <p>56 Glassford Street glsgow G! 1UL New York</p>
          </li>
          <li>
            <i className="fal fa-envelope"></i>
            <p>contact@gmail.com</p>
          </li>
          <li>
            <i className="fal fa-phone-alt"></i>
            <p>+92 6789 6777 909</p>
          </li>
          <li>
            <i className="fal fa-clock"></i>
            <p>Monday to Saturday: 9.00 to 16.pm</p>
          </li>
        </div>
      </div>
      <div className="map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9878.746052397459!2d-1.2648176282210346!3d51.75705573223412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876c6a9ef8c485b%3A0xd2ff1883a001afed!2sUniversity%20of%20Oxford!5e0!3m2!1sen!2s!4v1753291014510!5m2!1sen!2s"
          width="600"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
}