import express from "express";
const app = express.Router();
import Utils from "../Utils/Utils.js";
app.get("/fortnite/api/calendar/v1/timeline", (req, res) => {
  const memory = Utils.GetVersion(req);
  let activeEvents = [
    {
      eventType: `EventFlag.Season${memory.season}`,
      activeUntil: "2024-10-13T00:00:00.000Z",
      activeSince: "2024-08-30T00:00:00.000Z",
    },
    {
      eventType: `EventFlag.${memory.lobby}`,
      activeUntil: "9999-01-01T00:00:00.000Z",
      activeSince: "2020-01-01T00:00:00.000Z",
    },
  ];
  // Shop countdown: synced with the daily rotation reset (shop_rotation.json, default 16:00)
  const isoDate = Utils.getShopResetInfo().nextResetIso;
  res.json({
    channels: {
      "client-matchmaking": {
        states: [],
        cacheExpire: "9999-01-01T00:00:00.000Z",
      },
      "client-events": {
        states: [
          {
            validFrom: "0001-01-01T00:00:00.000Z",
            activeEvents: activeEvents,
            state: {
              activeStorefronts: [],
              eventNamedWeights: {},
              seasonNumber: memory.season,
              seasonTemplateId: `AthenaSeason:athenaseason${memory.season}`,
              matchXpBonusPoints: 0,
              seasonBegin: "2020-01-01T00:00:00Z",
              seasonEnd: "9999-01-01T00:00:00Z",
              seasonDisplayedEnd: "9999-01-01T00:00:00Z",
              weeklyStoreEnd: isoDate,
              stwEventStoreEnd: "9999-01-01T00:00:00.000Z",
              stwWeeklyStoreEnd: "9999-01-01T00:00:00.000Z",
              sectionStoreEnds: {
                Featured: isoDate,
              },
              dailyStoreEnd: isoDate,
            },
          },
        ],
        cacheExpire: isoDate,
      },
    },
    eventsTimeOffsetHrs: 0,
    cacheIntervalMins: 10,
    currentTime: new Date().toISOString(),
  });
});
export default app;
