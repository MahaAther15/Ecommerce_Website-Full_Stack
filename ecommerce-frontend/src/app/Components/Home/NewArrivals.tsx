import Link from "next/link";

export default function NewArrivals() {
  return (
    <section id="product1" className="section-p1">
      <h2>New Arrivals</h2>
      <p>Summer Collection New Modern Design</p>
      <div className="container">
        <div className="pro">
          <img src="/img/products/n1.jpg" alt="Cartoon Astronaut T-Shirt" />
          <div className="des">
            <span>Adidas</span>
            <h5>Cartoon Astronaut T-Shirts</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$78</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n2.jpg" alt="Classic Windbreaker Jacket" />
          <div className="des">
            <span>Nike</span>
            <h5>Classic Windbreaker Jacket</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$120</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n3.jpg" alt="Graphic Cotton T-Shirt" />
          <div className="des">
            <span>H&M</span>
            <h5>Graphic Cotton T-Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$25</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n4.jpg" alt="Premium Oxford Shirt" />
          <div className="des">
            <span>Uniqlo</span>
            <h5>Premium Oxford Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$45</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n5.jpg" alt="Classic Fit Polo Shirt" />
          <div className="des">
            <span>Ralph Lauren</span>
            <h5>Classic Fit Polo Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$85</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n6.jpg" alt="Oversized Urban T-Shirt" />
          <div className="des">
            <span>Zara</span>
            <h5>Oversized Urban T-Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$35</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n7.jpg" alt="TechFit Workout T-Shirt" />
          <div className="des">
            <span>Adidas</span>
            <h5>TechFit Workout T-Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$60</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>

        <div className="pro">
          <img src="/img/products/n8.jpg" alt="Slim Fit Linen Shirt" />
          <div className="des">
            <span>H&M</span>
            <h5>Slim Fit Linen Shirt</h5>
            <div className="start">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <h4>$139</h4>
          </div>
          <Link href="#">
            <i className="fas fa-shopping-cart cart"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}