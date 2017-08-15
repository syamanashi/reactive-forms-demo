import { TemplateDemoPage } from './app.po';

describe('template-demo App', () => {
  let page: TemplateDemoPage;

  beforeEach(() => {
    page = new TemplateDemoPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
