export const __stage__ = import.meta.env.VITE_STAGE;

export const __dev__ = __stage__ === "development";

export const __stg__ = __stage__ === "staging";

export const __prd__ = __stage__ === "production";

export const __stripe_pk__ = import.meta.env.VITE_STRIPE_PK;

export const __api_endpoint__ = __prd__
  ? "https://lander1.ai/api"
  : __stg__
  ? "https://stg.lander1.ai/api"
  : __dev__
  ? "http://localhost:2000/api"
  : (undefined as never);

export const __windows__ = /(Windows|Win)/.test(navigator.platform);

export const __macos__ = /(Mac)/.test(navigator.platform);

export const __linux__ = /(Linux)/.test(navigator.platform);
