// Last-resort data for the live deployment.
//
// Yahoo Finance rejects datacenter traffic, so on Vercel every quote call
// returns 429 and the routes fall through to their catch blocks. Those blocks
// used to emit invented placeholder numbers (NVDA at $880.45), which is worse
// than useless on a page a visitor might read as a real quote.
//
// Falling back to the committed snapshot instead means a degraded response is
// still genuine Yahoo data, just captured earlier and labelled as such.
import trending from "../../public/data/trending.json";
import marketPulse from "../../public/data/market-pulse.json";
import analysts from "../../public/data/analysts.json";
import posts from "../../public/data/posts.json";
import meta from "../../public/data/meta.json";

export const snapshot = { trending, marketPulse, analysts, posts, meta };
export const snapshotCapturedAt: string = meta.capturedAt;
