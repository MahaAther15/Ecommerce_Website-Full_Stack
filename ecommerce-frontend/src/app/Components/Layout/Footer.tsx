import Link from "next/link";

export default function Footer() {
  return (
    <footer className="section-p1">
      <div className="col">
        <img className="logo" src="/img/logo.png" alt="Logo" />
        <h4>Contact</h4>
        <p>
          <strong>Address: </strong>Wellington Road, Street 32, San Francisco
        </p>
        <p>
          <strong>Phone: </strong>+01 2222 336 / (+91) 01 2345 6789
        </p>
        <p>
          <strong>Hours: </strong>10:00 - 18:00, Mon - Sat
        </p>
        <div className="follow">
          <h4>Follow Us</h4>
          <div className="icon">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-pinterest-p"></i>
            <i className="fab fa-youtube"></i>
          </div>
        </div>
      </div>
      <div className="col">
        <h4>About</h4>
        <Link href="/about">About us</Link>
        <Link href="#">Delievery Information</Link>
        <Link href="#">Privacy Policy</Link>
        <Link href="#">Terms & Conditions</Link>
        <Link href="/contact">Contact Us</Link>
      </div>
      <div className="col">
        <h4>My Account</h4>
        <Link href="#">Sign In</Link>
        <Link href="/cart">View Cart</Link>
        <Link href="/like">My Wishlist</Link>
        <Link href="#">Track My Order</Link>
        <Link href="#">Help</Link>
      </div>
      <div className="col install">
        <h4>Install App</h4>
        <p>From App or Store or Google Play</p>
        <div className="row">
          <img src="/img/pay/app.jpg" alt="App Store" />
          <img src="/img/pay/play.jpg" alt="Google Play" />
        </div>
        <p>Secured Payment Gateways</p>
        <img src="/img/pay/pay.png" alt="Payment Gateways" />
      </div>
      <div className="copyright">
        <p>© 2011, Cara-Ecommerce</p>
      </div>
    </footer>
  );
}
