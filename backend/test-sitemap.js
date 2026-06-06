const express = require('express');
const app = express();

const sitemapRouter = require('./routes/sitemap');
app.use(sitemapRouter);

app.listen(3333, () => {
  console.log('Test server on 3333');
});
