import { TraceanalyticsPage } from './app.po';

describe('traceanalytics App', function() {
  let page: TraceanalyticsPage;

  beforeEach(() => {
    page = new TraceanalyticsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
