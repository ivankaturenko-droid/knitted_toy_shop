import { Link } from 'react-router-dom';
import heartIcon from '../../assets/icons/heart.svg';

export default function Home() {
  return (
    <section className="home-hero">
      <p className="home-hero__eyebrow">
        <img alt="" aria-hidden="true" src={heartIcon} />З любов’ю створені
        вручну
      </p>
      <h1 className="page-heading">Маленькі друзі з великою історією</h1>
      <p className="page-intro">
        Обирайте м’які в’язані іграшки, зроблені з турботою та увагою до
        деталей.
      </p>
      <Link className="button" to="/catalog">
        Переглянути каталог
      </Link>
    </section>
  );
}
