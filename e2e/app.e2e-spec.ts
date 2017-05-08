import { DiplomaPage } from './app.po';

describe('diploma App', () => {
  let page: DiplomaPage;

  beforeEach(() => {
    page = new DiplomaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
