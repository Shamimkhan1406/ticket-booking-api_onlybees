const axios = require("axios");

// CHANGE THIS BASE URL IF NEEDED
const BASE_URL = "http://localhost:50";

// Put your real eventId and sectionId here
const EVENT_ID = "6966022b9106f1d34abf46ae";
const SECTION_ID = "6966022b9106f1d34abf46af";

// Number of parallel requests
const TOTAL_REQUESTS = 10;

// Each request tries to book qty tickets
const QTY_PER_REQUEST = 1;

async function runRaceTest() {
  console.log("🚀 Starting Race Condition Test...");
  console.log("TOTAL_REQUESTS:", TOTAL_REQUESTS);
  console.log("QTY_PER_REQUEST:", QTY_PER_REQUEST);

  const requests = Array.from({ length: TOTAL_REQUESTS }).map((_, i) => {
    return axios
      .post(`${BASE_URL}/book`, {
        eventId: EVENT_ID,
        sectionId: SECTION_ID,
        qty: QTY_PER_REQUEST,
      })
      .then((res) => ({
        index: i + 1,
        success: true,
        status: res.status,
        bookingId: res.data?.booking?._id,
      }))
      .catch((err) => ({
        index: i + 1,
        success: false,
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      }));
  });

  const results = await Promise.all(requests);

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log("\n===== RESULTS =====");
  console.log("Success:", successCount);
  console.log("Failed:", failCount);

  console.table(results);

  console.log("\n✅ Test complete.");
}

runRaceTest();
