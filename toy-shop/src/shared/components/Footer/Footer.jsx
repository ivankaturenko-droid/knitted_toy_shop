import { Link } from 'react-router-dom';
import HomeSectionLink from '../HomeSectionLink.jsx';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="contacts">
      <div className={styles.container}>
        <div className={styles.footerContainer}>
          <nav aria-label="Навігація у футері" className={styles.footerNav}>
            <Link aria-label="На головну" to="/">
              <img
                alt="В’язані іграшки"
                className={styles.logo}
                src="/homepage/images/yarn%201.svg"
              />
            </Link>
            <ul className={styles.navList}>
              <li>
                <Link className={styles.navLink} to="/catalog">
                  Каталог
                </Link>
              </li>
              <li>
                <HomeSectionLink
                  className={styles.navLink}
                  sectionId="about_me"
                >
                  Про мене
                </HomeSectionLink>
              </li>
              <li>
                <HomeSectionLink
                  className={styles.navLink}
                  sectionId="my_products"
                >
                  Мої іграшки
                </HomeSectionLink>
              </li>
              <li>
                <HomeSectionLink
                  className={styles.navLink}
                  sectionId="contacts"
                >
                  Контакти
                </HomeSectionLink>
              </li>
            </ul>
          </nav>
          <address className={styles.contacts}>
            <ul>
              <li>
                <a
                  className={styles.contactLink}
                  href="https://www.instagram.com/ivan.na5113/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                  ivan.na5113
                </a>
              </li>
              <li>
                <a className={styles.contactLink} href="tel:+380980448168">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M6.6 2.8 10 6.2 8 9.1c1.3 2.5 3.3 4.5 5.8 5.8l2.9-2 3.4 3.4-1.8 3.1c-.5.8-1.4 1.2-2.3 1-7.4-1.6-12.5-6.7-14.1-14.1-.2-.9.2-1.8 1-2.3z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +38 (098) 044-81-68
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>
    </footer>
  );
}
