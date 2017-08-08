import { ForecastingPage } from './app.po';

describe('forecasting App', () => {
  let page: ForecastingPage;

  beforeEach(() => {
    page = new ForecastingPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
