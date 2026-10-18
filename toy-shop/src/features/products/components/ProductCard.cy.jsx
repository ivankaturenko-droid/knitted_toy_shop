import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';

describe('ProductCard', () => {
  it('показує товар, відкриває деталі та додає його до кошика', () => {
    const addToCart = cy.stub().as('addToCart');
    cy.mount(
      <BrowserRouter>
        <ProductCard
          onAddToCart={addToCart}
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
    cy.contains('button', 'Додати в кошик').click();
    cy.contains('button', 'Додано в кошик').should('be.visible');
    cy.get('@addToCart').should('have.been.calledOnce');
  });
});
