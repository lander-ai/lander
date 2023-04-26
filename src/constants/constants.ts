export const __stage__ = import.meta.env.VITE_STAGE;

export const __dev__ = __stage__ === "development";

export const __stg__ = __stage__ === "staging";

export const __prd__ = __stage__ === "production";

export const __stripe_pk__ = import.meta.env.VITE_STRIPE_PK;

export const __api_endpoint__ = __prd__
  ? "https://api.lander.ai/api"
  : __stg__
  ? "https://stg.api.lander.ai/api"
  : __dev__
  ? "http://localhost:2000/api"
  : (undefined as never);
