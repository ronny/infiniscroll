/**
 * https://github.com/ronny/infiniscroll
 * Copyright (c) 2021 Ronny Haryanto
 * MIT License
 *
 * The majority of this code is based on the work of Elkfox published at
 * https://github.com/Elkfox/Ajaxinate. Original copyright:
 * Copyright (c) 2017 Elkfox Co Pty Ltd (elkfox.com)
 * MIT License
 */
export default InfiniScroll;

export interface InfiniScrollConfig {
  /** selector of repeating content, default: '#InfiniScrollItemsContainer' */
  itemsContainerSelector: string;
  /** selector of pagination container, default: '#InfiniScrollPaginationContainer' */
  paginationContainerSelector: string;
  /** number of pixels before the bottom to start loading more on scroll, default: 0 */
  offset: number;
  /** text shown during loading of next page */
  loadingText: string;

  /** whether to show debugging messages and errors to console, default: false */
  debug: boolean;
  /** optional logger, defaults to `console` when `debug` is `true`, NullLogger otherwise */
  logger?: Logger;
}

interface InfiniScroll {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function InfiniScroll(givenConfig?: Readonly<InfiniScrollConfig>): InfiniScroll {
  const DefaultConfig: InfiniScrollConfig = {
    itemsContainerSelector: '#InfiniScrollItemsContainer',
    paginationContainerSelector: '#InfiniScrollPaginationContainer',
    offset: 0,
    loadingText: 'Loading…',
    debug: false,
  };

  const config: Readonly<InfiniScrollConfig> = {
    ...DefaultConfig,
    ...givenConfig,
  };

  const log = config.debug ? config.logger ?? console : NullLogger();

  const itemsContainerEl = document.querySelector(config.itemsContainerSelector);
  const paginationContainerEl = document.querySelector(config.paginationContainerSelector);

  const domParser = new window.DOMParser();

  return {
    start,
    stop,
  };

  async function start(): Promise<void> {
    if (!itemsContainerEl) {
      log.error(`InfiniScroll itemsContainerSelector ${config.itemsContainerSelector} does not match any element`);
      return;
    }

    if (!paginationContainerEl) {
      log.error(
        `InfiniScroll paginationContainerSelector ${config.paginationContainerSelector} does not match any element`
      );
      return;
    }

    addScrollListeners();
  }

  async function stop(): Promise<void> {
    removeScrollListeners();
  }

  function addScrollListeners(): void {
    if (!paginationContainerEl) {
      return;
    }

    document.addEventListener('scroll', checkIfPaginationInView, { passive: true });
    window.addEventListener('resize', checkIfPaginationInView, { passive: true });
    window.addEventListener('orientationchange', checkIfPaginationInView, { passive: true });
  }

  function removeScrollListeners(): void {
    document.removeEventListener('scroll', checkIfPaginationInView);
    window.removeEventListener('resize', checkIfPaginationInView);
    window.removeEventListener('orientationchange', checkIfPaginationInView);
  }

  function checkIfPaginationInView(): void {
    if (!paginationContainerEl) {
      return;
    }

    const paginationBoundingClientRect = paginationContainerEl.getBoundingClientRect();
    const top = paginationBoundingClientRect.top - config.offset;
    const bottom = paginationBoundingClientRect.bottom + config.offset;
    const paginationInView = top <= window.innerHeight && bottom >= 0;

    if (paginationInView) {
      const nextPageLinkElement = paginationContainerEl.querySelector('a');
      removeScrollListeners();

      if (nextPageLinkElement) {
        nextPageLinkElement.innerText = config.loadingText;
        loadNextPage(nextPageLinkElement.href);
      }
    }
  }

  async function loadNextPage(url: string): Promise<void> {
    if (!itemsContainerEl || !paginationContainerEl) {
      return;
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      keepalive: true,
      redirect: 'follow',
      headers: {
        Accept: 'text/html',
      },
    });
    if (!response.ok) {
      log.error('InfiniScroll: loadNextPage: ', response.status, response.statusText);
      return;
    }
    const doc = domParser.parseFromString(await response.text(), 'text/html');

    const nextPageItemsContainer = doc.querySelectorAll(config.itemsContainerSelector)[0];
    if (!nextPageItemsContainer) {
      log.error(
        `InfiniScroll: loadNextPage: next page has no items container matching selector ${config.itemsContainerSelector}`
      );
      return;
    }
    itemsContainerEl.insertAdjacentHTML('beforeend', nextPageItemsContainer.innerHTML);

    const nextPagePaginationContainer = doc.querySelectorAll(config.paginationContainerSelector)[0];
    if (!nextPagePaginationContainer) {
      paginationContainerEl.innerHTML = '';
      removeScrollListeners();
    } else {
      paginationContainerEl.innerHTML = nextPagePaginationContainer.innerHTML;
      start();
    }
  }

  function NullLogger(): Logger {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error() {},
    };
  }
}

interface Logger {
  error(...args: unknown[]): void;
}
