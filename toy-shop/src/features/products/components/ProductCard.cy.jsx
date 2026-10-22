import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';

describe('ProductCard', () => {
  it('показує назву, опис, ціну та посилання на деталі', () => {
    cy.mount(
      <BrowserRouter>
        <ProductCard
          product={{
            id: 'spider',
            name: 'Павук Спідер',
            price: 250,
            description: 'М’який в’язаний павучок ручної роботи.',
            image: '',
          }}
        />
      </BrowserRouter>
    );

    cy.contains('h2', 'Павук Спідер').should('be.visible');
    cy.contains('250 грн').should('be.visible');
    cy.contains('М’який в’язаний павучок ручної роботи.').should('be.visible');
    cy.contains('a', 'Детальніше').should(
      'have.attr',
      'href',
      '/product/spider'
    );
  });
});
