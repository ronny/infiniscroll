var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function InfiniScroll(givenConfig) {
    var _a;
    const DefaultConfig = {
        itemsContainerSelector: '#InfiniScrollItemsContainer',
        paginationContainerSelector: '#InfiniScrollPaginationContainer',
        offset: 0,
        loadingText: 'Loading…',
        debug: false,
    };
    const config = Object.assign(Object.assign({}, DefaultConfig), givenConfig);
    const log = config.debug ? (_a = config.logger) !== null && _a !== void 0 ? _a : console : NullLogger();
    const itemsContainerEl = document.querySelector(config.itemsContainerSelector);
    const paginationContainerEl = document.querySelector(config.paginationContainerSelector);
    const domParser = new window.DOMParser();
    return {
        start,
        stop,
    };
    function start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!itemsContainerEl) {
                log.error(`InfiniScroll itemsContainerSelector ${config.itemsContainerSelector} does not match any element`);
                return;
            }
            if (!paginationContainerEl) {
                log.error(`InfiniScroll paginationContainerSelector ${config.paginationContainerSelector} does not match any element`);
                return;
            }
            addScrollListeners();
        });
    }
    function stop() {
        return __awaiter(this, void 0, void 0, function* () {
            removeScrollListeners();
        });
    }
    function addScrollListeners() {
        if (!paginationContainerEl) {
            return;
        }
        document.addEventListener('scroll', checkIfPaginationInView, { passive: true });
        window.addEventListener('resize', checkIfPaginationInView, { passive: true });
        window.addEventListener('orientationchange', checkIfPaginationInView, { passive: true });
    }
    function removeScrollListeners() {
        document.removeEventListener('scroll', checkIfPaginationInView);
        window.removeEventListener('resize', checkIfPaginationInView);
        window.removeEventListener('orientationchange', checkIfPaginationInView);
    }
    function checkIfPaginationInView() {
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
    function loadNextPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!itemsContainerEl || !paginationContainerEl) {
                return;
            }
            const response = yield fetch(url, {
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
            const doc = domParser.parseFromString(yield response.text(), 'text/html');
            const nextPageItemsContainer = doc.querySelectorAll(config.itemsContainerSelector)[0];
            if (!nextPageItemsContainer) {
                log.error(`InfiniScroll: loadNextPage: next page has no items container matching selector ${config.itemsContainerSelector}`);
                return;
            }
            itemsContainerEl.insertAdjacentHTML('beforeend', nextPageItemsContainer.innerHTML);
            const nextPagePaginationContainer = doc.querySelectorAll(config.paginationContainerSelector)[0];
            if (!nextPagePaginationContainer) {
                paginationContainerEl.innerHTML = '';
                removeScrollListeners();
            }
            else {
                paginationContainerEl.innerHTML = nextPagePaginationContainer.innerHTML;
                start();
            }
        });
    }
    function NullLogger() {
        return {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            error() { },
        };
    }
}
