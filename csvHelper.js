const fs = require("fs");
const path = require("path");

function convertEmailToName(email) {
  // Extract the part before '@'
  const emailPrefix = email.split("@")[0];

  // Split the prefix by '.' and capitalize the first letter of each part
  const nameParts = emailPrefix
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  // Join the first and last name
  return `${nameParts[0]} ${nameParts[1]}`;
}

function buildOnCallHeader(events) {
  return events.map((event) => {
    return `${event.DTStart}`;
  });
}

function countOccurrences(arr) {
  const counts = {};

  arr.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });

  return counts;
}

function duplicateObjectsOfMoreThanOneDay(input) {
  const startDate = new Date(input.DTStart);
  const endDate = new Date(input.DTEnd);
  const result = [];

  // Loop through the dates and create new objects
  while (startDate < endDate) {
    // Clone the input object and update the DTStart
    const newObject = {
      ...input,
      DTStart: startDate.toISOString().split("T")[0],
    };

    // Push the new object into the result array
    result.push(newObject);

    // Increment the date
    startDate.setDate(startDate.getDate() + 1);
  }

  return result;
}

// Convert events to a CSV format string
function eventsToCSV(events) {
  // const rows = events.map(event => `${event.DTStart},${event.DTEnd},${event.Attendee}`);

  const allNormalized = [];

  // Loop through each original object and generate the duplicates
  events.forEach((item) => {
    const duplicates = duplicateObjectsOfMoreThanOneDay(item);
    // Push original object
    // allNormalized.push(item);
    // Push the duplicates
    allNormalized.push(...duplicates);
  });

  // Sort by DTStart date
  allNormalized.sort((a, b) => new Date(a.DTStart) - new Date(b.DTStart));

  const onCallCsvHeader = buildOnCallHeader(allNormalized);
  const onCallCsvRows = allNormalized.map((event) => [
    convertEmailToName(event.Attendee),
  ]);

  const insights = countOccurrences(onCallCsvRows);
  console.log(insights);

  return [
    onCallCsvHeader.join(","), // Dates as first row
    onCallCsvRows.join(","), // Attendees as second row
  ].join("\n");
}

// Write the events to a CSV file
function writeToCSV(events, filename) {
  try {
    const csvData = eventsToCSV(events);

    const directory = path.join(__dirname, "on-calls");
    const filePath = path.join(directory, filename);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(filePath, csvData, "utf8");
    console.log(`CSV file written successfully to: ${filename}`);
  } catch (error) {
    throw new Error(`Error writing to CSV file: ${error.message}`);
  }
}

module.exports = { writeToCSV };
