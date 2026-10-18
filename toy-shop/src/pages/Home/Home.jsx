import { useEffect, useState } from 'react';
import ProductCard from '../../features/products/components/ProductCard.jsx';
import './Home.css';

const featuredProducts = [
  {
    id: 'spider',
    image: 'Rectangle 10.jpg',
    alt: 'В’язаний павук',
    name: 'Павук Спідер',
    price: '250 грн',
  },
  {
    id: 'gennadiy',
    image: 'Rectangle 11.jpg',
    alt: 'В’язаний динозавр',
    name: 'Динозавр Геннадій',
    price: '565 грн',
  },
  {
    id: 'andriy',
    image: 'blueberry.jpg',
    alt: 'В’язана іграшка',
    name: 'Андрій Гей',
    price: '500 000$',
  },
  {
    id: 'hornet',
    image: 'hornet1.JPG',
    alt: 'В’язана Хорнет',
    name: 'Хорнет',
    price: '700 грн',
  },
  {
    id: 'matviy',
    image: 'Matt.jpg',
    alt: 'В’язана іграшка Матвій',
    name: 'Матвій',
    price: 'безкоштовно',
  },
];

const specialFeatures = [
  'Кожен виріб створюю вручну, вкладаючи увагу та турботу в кожну петлю. Це робить іграшки не просто милою забавкою, а маленьким джерелом радості та тепла.',
  'Я використовую тільки якісні нитки та наповнювачі, які безпечні для дітей і приємні на дотик. Тому мої іграшки можна сміливо дарувати навіть найменшим.',
  'Кожна іграшка має свій неповторний вигляд. Я експериментую з формами, кольорами та деталями, щоб кожен виріб був особливим і не повторювався.',
  'Мої іграшки стануть чудовим подарунком на будь-яке свято або просто для душі. Вони приносять радість і залишають теплі спогади у тих, хто їх отримує.',
];

function ArrowIcon({ direction }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon-arrow-${direction}`}
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path d="M27.414 19.414l-10 10c-.781.781-2.047.781-2.828 0l-10-10c-.781-.781-.781-2.047 0-2.828s2.047-.781 2.828 0L14 23.172V4c0-1.105.895-2 2-2s2 .895 2 2v19.172l6.586-6.586c.39-.39.902-.586 1.414-.586s1.024.195 1.414.586c.781.781.781 2.047 0 2.828z" />
    </svg>
  );
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(() =>
    window.innerWidth <= 640 ? 1 : 2
  );

  useEffect(() => {
    function updateVisibleCount() {
      setVisibleCount(window.innerWidth <= 640 ? 1 : 2);
    }

    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  function moveCarousel(direction) {
    setCurrentIndex(
      (index) =>
        (index + direction * visibleCount + featuredProducts.length) %
        featuredProducts.length
    );
  }

  const visibleProducts = Array.from(
    { length: visibleCount },
    (_, offset) =>
      featuredProducts[(currentIndex + offset) % featuredProducts.length]
  );

  return (
    <div className="home-page">
      <section className="hero-section section">
        <div className="container">
          <h1 className="crochet_toys">В'язанка</h1>
          <form
            className="search_form"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="label-form visually-hidden" htmlFor="search_toy">
              Що вас цікавить?
            </label>
            <div className="search_form_toy">
              <input
                className="input-form"
                id="search_toy"
                name="search_toy"
                placeholder="Що вас цікавить?"
                type="search"
              />
            </div>
          </form>
        </div>
      </section>

      <section className="section about_me-section" id="about_me">
        <div className="container">
          <div className="me_container">
            <div className="description_container">
              <h2 className="about_me">Про мене</h2>
              <p className="my_description">
                Привіт! Мене звати Іванна, і я створюю милі в’язані іграшки
                власноруч.
              </p>
              <p className="my_description">
                В’язання для мене — це не просто хобі, а спосіб дарувати тепло
                та радість іншим. Кожна іграшка — унікальна, бо я вкладаю у неї
                любов і увагу до деталей. Я використовую лише якісні, безпечні
                та приємні на дотик матеріали. Мої вироби стануть ідеальним
                подарунком або другом для вашої дитини.
              </p>
            </div>
            <div className="crochet_container">
              <img
                className="foto_crochet"
                src="/homepage/images/crochet.jpg"
                alt="Стакан із гачками для в’язання"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section my_toys-section" id="my_toys">
        <div className="container">
          <h2 className="my_toys">Чому мої іграшки особливі</h2>
          <div className="toys_list-container">
            <ul className="toys-list">
              {specialFeatures.map((feature) => (
                <li className="toys-item" key={feature}>
                  <div className="toys_item-container">{feature}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bestseller-section" id="my_products">
        <div className="container">
          <h2 className="bestseller">Популярні товари</h2>
          <div className="carousel-wrapper">
            <button
              aria-label="Попередні товари"
              className="icon-arrow"
              onClick={() => moveCarousel(-1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
            <ul className="products">
              {visibleProducts.map((product) => (
                <li key={product.name}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            <button
              aria-label="Наступні товари"
              className="icon-arrow"
              onClick={() => moveCarousel(1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
