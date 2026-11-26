import consumer from "../../data/applications/consumer.json";
import healthcare from "../../data/applications/healthcare.json";
import industrial from "../../data/applications/industrial.json";
import smartHome from "../../data/applications/smart-home.json";
import seriesReferences from "../../data/applications/series-references.json";
import marketIllustrations from "../../data/applications/illustrations.json";

export { marketIllustrations, seriesReferences };

export const applicationMarkets = [consumer, healthcare, industrial, smartHome];
export const marketHref = (market) => "/applications/" + market.id;
export const findMarket = (pathname) =>
  applicationMarkets.find((market) => marketHref(market) === pathname);

export const marketFitId = (market) => {
  const name = market.id.replaceAll("-", "_");
  return (
    "superworld_electronics_applications_" + name + "_find_the_right_series_by_" + name + "_system"
  );
};

export const systemHref = (market, system) =>
  marketHref(market) + "?system=" + system.id + "#" + marketFitId(market);

export const publishedSeriesPaths = new Set(
  applicationMarkets.flatMap((market) =>
    market.systems.flatMap((system) =>
      system.modules.flatMap((block) => block.mappings.flatMap((mapping) => mapping.series)),
    ),
  ),
);
