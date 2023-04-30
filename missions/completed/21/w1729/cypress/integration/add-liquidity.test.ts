describe('Add Liquidity', () => {
  it('loads the two correct tokens', () => {
    cy.visit(
      '/pools?currency0=0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6&currency1=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    );
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should(
      'contain.text',
      'WBTC',
    );
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should(
      'contain.text',
      'ETH',
    );
  });

  it('does not crash if ETH is duplicated', () => {
    cy.visit(
      '/pools?currency0=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&currency1=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    );
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should(
      'not.contain.text',
      'ETH',
    );
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should(
      'contain.text',
      'ETH',
    );
  });

  it('token not in storage is loaded', () => {
    cy.visit(
      '/pools?currency0=0x64aFDF9e28946419E325d801Fb3053d8B8FFdC23&currency1=0x60bB3D364B765C497C8cE50AE0Ae3f0882c5bD05',
    );
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should(
      'contain.text',
      'MEEB',
    );
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should(
      'contain.text',
      'IMX',
    );
  });

  it('single token can be selected', () => {
    cy.visit('/pools?currency0=0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6');
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should(
      'contain.text',
      'WBTC',
    );
    cy.visit('/pools?currency0=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619');
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should(
      'contain.text',
      'ETH',
    );
  });
});
