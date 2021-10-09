# InfiniScroll

Infinite scrolling pagination. Loads next page as you scroll.

Based on https://github.com/Elkfox/Ajaxinate with these modifications:

- TypeScript code base
- uses standard `fetch` API instead of `XMLHttpRequest` ("ajax")
  - works in Mobile Safari in iOS 15
- passive event listeners for improved performance
- compiled for use with `<script type="module">`
- only `scroll` method is supported, `click` is not supported

## Usage

```html
<script type="module">
  import { InfiniScroll } from 'https://cdn.example.com/infiniscroll.js';

  InfiniScroll({
    itemsContainerSelector: '#InfiniScrollItemsContainer',
    paginationContainerSelector: '#InfiniScrollPaginationContainer',
    offset: 0,
    loadingText: 'Loading…',
    debug: false,
  }).start();
</script>

<ul id="InfiniScollItemsContainer">
  <li>Item</li>
</ul>

<nav id="InfiniScrollPaginationContainer">
  <!-- ⚠️ InfiniScroll picks the first <a> as the next page link -->
  <a href="/items?page=2">Next page</a>
</nav>
```
