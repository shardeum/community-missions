import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/commands';

describe('Landing Page', () => {
  beforeEach(() => cy.visit('/'));
  it('loads landing page', () => {
    cy.get('#landing-page');
  });

  it('allows navigation to pool', () => {
    cy.get('#pools-page-link').click();
    cy.url().should('include', '/pools');
  });

  it('allows navigation to swap', () => {
    cy.get('#swap-page-link').click();
    cy.url().should('include', '/swap');
  });

  it('allows navigation to farm', () => {
    cy.get('#farm-page-link').click();
    cy.url().should('include', '/farm');
  });

  it('allows navigation to dragons lair', () => {
    cy.get('#dragons-page-link').click();
    cy.url().should('include', '/dragons');
  });

  it('allows navigation to analytics', () => {
    cy.get('#analytics-page-link').click();
    cy.url().should('include', '/analytics');
  });

  /**it('is connected', () => {
    cy.get('#web3-status-connected').click()
    cy.get('#web3-account-identifier-row').contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })*/
});
