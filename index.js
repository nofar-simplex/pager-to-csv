// File: index.js
const { writeToCSV } = require("./csvHelper");
// const fetch = require('node-fetch'); // Install via npm if not present
const ical = require("node-ical"); // Install via npm for iCal parsing
const path = require("path");
const { URL } = require("url");

// Helper function to convert hours to milliseconds
function floatToDuration(hours) {
  return hours * 60 * 60 * 1000;
}

// Fetch iCal data from the provided URL
async function fetchData(icalUrl) {
  console.log(icalUrl);
  try {
    // const response = await fetch(icalUrl);
    // ical.fromURL(icalUrl, {}, function (err, data) {
    //   console.log(err, data);
    //   if (err) {
    //     return;
    //   }
    //   for (let k in data) {
    //     if (data.hasOwnProperty(k)) {
    //       var ev = data[k];
    //       if (data[k].type == "VEVENT") {
    //         console.log(
    //           `${ev.summary} is in ${
    //             ev.location
    //           } on the ${ev.start.getDate()} of ${
    //             months[ev.start.getMonth()]
    //           } at ${ev.start.toLocaleTimeString("en-GB")}`
    //         );
    //       }
    //     }
    //   }
    // });

    const response = await ical.fromURL(icalUrl);
    // console.log(response);
    if (response.error) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // return await JSON.stringify(response);
    return response;
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
}

function formatDateWithTimezone(date, timezoneOffset) {
  // Create a new Date object
  const localDate = new Date(date);

  // Adjust the time by adding the timezone offset (in minutes)
  localDate.setMinutes(
    localDate.getMinutes() + localDate.getTimezoneOffset() + timezoneOffset * 60
  );

  // Format the date as YYYY-MM-DDTHH:MM:SS
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  const seconds = String(localDate.getSeconds()).padStart(2, "0");

  // return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  return `${year}-${month}-${day}`;
}

// Parse the iCal data and adjust for the timezone offset
// function parseICal(events, tzOffset) {
//   try {
//     // const events = ical.parseICS(data);
//     const data = Object.values(events).slice(1);
//     return data.map((event) => {
//       if (event.start) {
//         event.start = formatDateWithTimezone(event.start, tzOffset);
//       }
//       if (event.end) {
//         event.end = formatDateWithTimezone(event.end, tzOffset);
//       }
//       return {
//         DTStart: event.start ? event.start : "",
//         DTEnd: event.end ? event.end : "",
//         Attendee: event.attendee || "",
//       };
//     });
//   } catch (error) {
//     throw new Error(`Error parsing iCal data: ${error.message}`);
//   }
// }

function parseICal(events, tzOffset, monthNumber) {
  try {
    let month = monthNumber;
    if (monthNumber < 1 || monthNumber > 12) {
      month = 1;
    }

    // Convert the month to a Date object for filtering
    const currentMonth = new Date();
    currentMonth.setMonth(month - 1); // Set the current month
    const currentYear = currentMonth.getFullYear();

    // Define the date range for filtering (15th of previous month to 15th of the current month)
    const startDate = new Date(currentYear, currentMonth.getMonth() - 1, 15); // 15th of previous month
    const endDate = new Date(currentYear, currentMonth.getMonth(), 15); // 15th of the current month

    // Parse the events
    const data = Object.values(events).slice(1);

    // Filter events based on the start date
    return data
      .map((event) => {
        if (event.start) {
          event.start = formatDateWithTimezone(event.start, tzOffset);
        }
        if (event.end) {
          event.end = formatDateWithTimezone(event.end, tzOffset);
        }

        const eventStartDate = new Date(event.start);

        // Return only events that are within the desired date range
        if (eventStartDate >= startDate && eventStartDate <= endDate) {
          return {
            DTStart: event.start ? event.start : "",
            DTEnd: event.end ? event.end : "",
            Attendee: event.attendee || "",
          };
        }
        return null; // Filter out events outside the date range
      })
      .filter((event) => event !== null); // Remove null entries
  } catch (error) {
    throw new Error(`Error parsing iCal data: ${error.message}`);
  }
}

function monthName(number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (number < 1 || number > 12) {
    return "Invalid number";
  }

  return months[number - 1];
}

async function main() {
  const args = process.argv.slice(2);
  const icalUrl = args.find((arg) => arg.startsWith("--url="))?.split("=")[1];
  const monthNumber = args
    .find((arg) => arg.startsWith("--month="))
    ?.split("=")[1];
  const tzHours =
    parseFloat(
      args.find((arg) => arg.startsWith("--timezone="))?.split("=")[1]
    ) || 2;
  const teamName = args.find((arg) => arg.startsWith("--team="))?.split("=")[1];

  if (!icalUrl) {
    console.error("Please provide a URL using the --url flag.");
    return;
  }

  try {
    const data = await fetchData(icalUrl);
    const events = parseICal(data, tzHours, monthNumber);

    const parsedURL = new URL(icalUrl);
    const filenameSegment = path.basename(parsedURL.pathname);

    const month = monthName(monthNumber);
    const csvFilename = `${teamName}_${month}.csv`;

    writeToCSV(events, csvFilename);
    console.log("Schedule exported to:", csvFilename);
  } catch (error) {
    console.error(error.message);
  }
}

main();
