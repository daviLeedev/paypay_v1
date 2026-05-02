<script setup lang="ts">
import { DEFAULT_FEATURE_FLAGS, DEFAULT_MOBILE_HOME_CONFIG } from "@repo/config";
import type { AdminCommand, MobileBannerItem, MobileLayoutMode, MobileProductItem } from "@repo/types";

const config = useRuntimeConfig();
const iframeRef = ref<HTMLIFrameElement | null>(null);
const nuxtApp = useNuxtApp();
const { connected, logs, events, snapshot } = useMobileLabState();

const cloneBanners = (banners: MobileBannerItem[]) => banners.map((banner) => ({ ...banner }));
const cloneProducts = (products: MobileProductItem[]) => products.map((product) => ({ ...product }));

const localFlags = reactive({ ...DEFAULT_FEATURE_FLAGS });
const latencyMs = ref(0);
const forceError = ref(false);
const localLayoutMode = ref<MobileLayoutMode>(DEFAULT_MOBILE_HOME_CONFIG.layoutMode);
const editableBanners = ref<MobileBannerItem[]>(cloneBanners(DEFAULT_MOBILE_HOME_CONFIG.banners));
const editableProducts = ref<MobileProductItem[]>(cloneProducts(DEFAULT_MOBILE_HOME_CONFIG.products));

const mobileUrl = computed(() => {
  const url = new URL(String(config.public.mobileWebUrl));
  url.searchParams.set("embedded", "true");
  return url.toString();
});

const postCommand = (command: AdminCommand) => {
  nuxtApp.$mobileLabBridge?.send(iframeRef.value?.contentWindow, "command", command);
};

const requestState = () => {
  postCommand({ type: "admin:request-state" });
};

const navigateMobile = (path: string) => {
  postCommand({ type: "admin:navigate", payload: { path, query: { embedded: true } } });
};

const toggleFlag = (key: string) => {
  localFlags[key] = !localFlags[key];
  postCommand({ type: "admin:set-feature-flag", payload: { key, enabled: localFlags[key] } });
};

const applyMockBehavior = () => {
  postCommand({
    type: "admin:set-mock-behavior",
    payload: {
      latencyMs: latencyMs.value,
      forceError: forceError.value
    }
  });
};

const applyLayoutMode = (layoutMode: MobileLayoutMode) => {
  localLayoutMode.value = layoutMode;
  postCommand({ type: "ui:set-layout-mode", payload: { layoutMode } });
};

const normalizeBanner = (banner: MobileBannerItem, index: number): MobileBannerItem => ({
  ...banner,
  id: banner.id.trim() || `banner-${index + 1}`,
  title: banner.title.trim() || `Banner ${index + 1}`,
  imageUrl: banner.imageUrl.trim() || "/images/banners/daily-blooms.svg",
  linkTo: banner.linkTo?.trim() || "/",
  tone: banner.tone ?? "default"
});

const normalizeProduct = (product: MobileProductItem, index: number): MobileProductItem => ({
  ...product,
  id: product.id.trim() || `product-${index + 1}`,
  title: product.title.trim() || `Product ${index + 1}`,
  subtitle: product.subtitle?.trim(),
  price: product.price?.trim(),
  imageUrl: product.imageUrl?.trim() || "/images/products/rose-bouquet.svg",
  linkTo: product.linkTo?.trim() || `/products/${product.id.trim() || `product-${index + 1}`}`
});

const addBanner = () => {
  editableBanners.value = [
    ...editableBanners.value,
    {
      id: `lab-banner-${editableBanners.value.length + 1}`,
      title: "New flower banner",
      description: "Fresh campaign message",
      imageUrl: "/images/banners/daily-blooms.svg",
      linkTo: "/products/rose-bouquet",
      tone: "default"
    }
  ];
};

const removeBanner = (index: number) => {
  editableBanners.value = editableBanners.value.filter((_, itemIndex) => itemIndex !== index);
};

const applyBanners = () => {
  postCommand({
    type: "ui:set-banners",
    payload: { banners: editableBanners.value.map(normalizeBanner) }
  });
};

const setActiveBanner = (index: number) => {
  postCommand({ type: "ui:set-active-banner", payload: { index } });
};

const addProduct = () => {
  const id = `custom-flower-${editableProducts.value.length + 1}`;

  editableProducts.value = [
    ...editableProducts.value,
    {
      id,
      title: "새 꽃 상품",
      subtitle: "관리 화면에서 설명을 바꿔보세요.",
      price: "39,000원",
      imageUrl: "/images/products/rose-bouquet.svg",
      badge: "New",
      linkTo: `/products/${id}`
    }
  ];
};

const removeProduct = (index: number) => {
  editableProducts.value = editableProducts.value.filter((_, itemIndex) => itemIndex !== index);
};

const applyProducts = () => {
  postCommand({
    type: "ui:set-products",
    payload: { products: editableProducts.value.map(normalizeProduct) }
  });
};

watch(
  snapshot,
  (nextSnapshot) => {
    if (!nextSnapshot?.ui) {
      return;
    }

    localLayoutMode.value = nextSnapshot.ui.homeConfig.layoutMode;
    editableBanners.value = cloneBanners(nextSnapshot.ui.homeConfig.banners);
    editableProducts.value = cloneProducts(nextSnapshot.ui.homeConfig.products);
  },
  { deep: true }
);
</script>

<template>
  <main class="admin-shell">
    <header class="admin-header">
      <div>
        <p class="eyebrow">Admin Console</p>
        <h1>Mobile Lab</h1>
      </div>
      <span class="status" :class="{ connected }">{{ connected ? "connected" : "waiting" }}</span>
    </header>

    <section class="lab-layout">
      <div class="device-stage">
        <div class="phone-frame" aria-label="iPhone style mobile preview frame">
          <span class="phone-button phone-button--mute" aria-hidden="true" />
          <span class="phone-button phone-button--volume-up" aria-hidden="true" />
          <span class="phone-button phone-button--volume-down" aria-hidden="true" />
          <span class="phone-button phone-button--power" aria-hidden="true" />
          <div class="phone-screen">
            <span class="phone-island" aria-hidden="true">
              <span class="phone-island__camera" />
            </span>
            <iframe ref="iframeRef" class="mobile-frame" :src="mobileUrl" title="mobile-web preview" @load="requestState" />
          </div>
        </div>
      </div>

      <aside class="control-panel">
        <section>
          <h2>Controls</h2>
          <div class="button-row">
            <button type="button" @click="navigateMobile('/')">Home</button>
            <button type="button" @click="navigateMobile('/products/rose-bouquet')">Detail</button>
            <button type="button" @click="requestState">Refresh</button>
          </div>
        </section>

        <section>
          <h2>Banner Manager</h2>
          <div class="manager-list">
            <article v-for="(banner, index) in editableBanners" :key="banner.id" class="manager-card">
              <header>
                <strong>Banner {{ index + 1 }}</strong>
                <button type="button" :disabled="editableBanners.length === 1" @click="removeBanner(index)">Remove</button>
              </header>
              <label class="field-row field-row--stacked">
                <span>Title</span>
                <input v-model="banner.title" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Description</span>
                <input v-model="banner.description" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Image URL</span>
                <input v-model="banner.imageUrl" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Link</span>
                <input v-model="banner.linkTo" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Tone</span>
                <select v-model="banner.tone">
                  <option value="default">Default</option>
                  <option value="primary">Primary</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </article>
          </div>
          <div class="button-row">
            <button type="button" @click="addBanner">Add banner</button>
            <button type="button" @click="applyBanners">Apply banners</button>
            <button type="button" @click="setActiveBanner(0)">First slide</button>
          </div>
        </section>

        <section>
          <h2>Recommended flowers</h2>
          <div class="segmented-row">
            <button type="button" :class="{ active: localLayoutMode === 'single' }" @click="applyLayoutMode('single')">1 column</button>
            <button type="button" :class="{ active: localLayoutMode === 'double' }" @click="applyLayoutMode('double')">2 columns</button>
          </div>
          <div class="manager-list">
            <article v-for="(product, index) in editableProducts" :key="product.id" class="manager-card">
              <header>
                <strong>Item {{ index + 1 }}</strong>
                <button type="button" :disabled="editableProducts.length === 1" @click="removeProduct(index)">Remove</button>
              </header>
              <label class="field-row field-row--stacked">
                <span>Name</span>
                <input v-model="product.title" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Comment</span>
                <input v-model="product.subtitle" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Badge</span>
                <input v-model="product.badge" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Price</span>
                <input v-model="product.price" type="text" />
              </label>
              <label class="field-row field-row--stacked">
                <span>Image URL</span>
                <input v-model="product.imageUrl" type="text" />
              </label>
            </article>
          </div>
          <div class="button-row">
            <button type="button" @click="addProduct">Add item</button>
            <button type="button" @click="applyProducts">Apply items</button>
            <button type="button" @click="navigateMobile('/')">Preview</button>
          </div>
        </section>

        <section>
          <h2>Feature Flags</h2>
          <label v-for="(_, key) in localFlags" :key="key" class="switch-row">
            <span>{{ key }}</span>
            <input type="checkbox" :checked="localFlags[key]" @change="toggleFlag(String(key))" />
          </label>
        </section>

        <section>
          <h2>Mock Behavior</h2>
          <label class="field-row">
            <span>Latency</span>
            <input v-model.number="latencyMs" type="number" min="0" step="100" @change="applyMockBehavior" />
          </label>
          <label class="switch-row">
            <span>Force error</span>
            <input v-model="forceError" type="checkbox" @change="applyMockBehavior" />
          </label>
        </section>
      </aside>
    </section>

    <section class="data-grid">
      <article>
        <h2>State</h2>
        <pre>{{ snapshot ?? "No state received yet" }}</pre>
      </article>

      <article>
        <h2>Logs</h2>
        <ul>
          <li v-for="log in logs" :key="log.id">
            <strong>{{ log.type }}</strong>
            <span>{{ log.timestamp }}</span>
          </li>
        </ul>
      </article>

      <article>
        <h2>Events</h2>
        <ul>
          <li v-for="event in events" :key="event.messageId">
            <strong>{{ event.kind }}</strong>
            <span>{{ event.timestamp }}</span>
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>
