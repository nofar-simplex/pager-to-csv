# Export On-Call Schedule To CSV

## Overview

This script runs an on-call schedule parser using Node.js, fetching data from a specified iCalendar (iCal) URL and generating a CSV file with the schedule.

## Prerequisites

- Node.js installed on your system
- Required dependencies installed (if applicable)
- Internet connection to fetch the iCal feed
- (Optional) A custom `run-oncall` command added to your shell configuration (e.g., `.zshrc` or `.bashrc`)
- (Optional) Custom environment variables `onCallDir` and `onCallCSV` defined in your shell configuration

## Installation

1. Clone the repository (if applicable):
   ```sh
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Ensure all dependencies are installed (if applicable):
   ```sh
   npm install
   ```
3. (Optional) If you want to use the `run-oncall` shortcut, add the following to your shell configuration with defaults values (e.g., `.zshrc` or `.bashrc`):
   ```sh

    onCallDir=~/ws/simplex/pager-to-csv # EDIT BASED ON YOUR PREFERENCES
    onCallCSV=~/ws/simplex/pager-to-csv/on-calls

   function run-oncall() {
       cd $onCallDir || { echo "Failed to change directory to $onCallDir"; return 1; }
       while [[ $# -gt 0 ]]; do
           case "$1" in
               --url)
                   icalUrl="$2"
                   shift 2
                   ;;
               --timezone)
                   timezone="$2"
                   shift 2
                   ;;
               --month)
                   month="$2"
                   shift 2
                   ;;
               --team)
                   team="$2"
                   shift 2
                   ;;
               *)
                   echo "Unknown option: $1"
                   return 1;
                   ;;
           esac
       done
       echo "Please set the team name and target month as per your requirement."
       
       # EDIT DEFAULT VALUES
       icalUrl="${icalUrl:-https://nuvei.pagerduty.com/private/524fe818c015b6b5c9319c3905590bb8de83645c57df5003/feed/PCKZD3T}" 
       timezone="${timezone:-2}"
       month="${month:-4}"
       team="${team:-APT}" 

       NODE_TLS_REJECT_UNAUTHORIZED='0' node index.js --url="$icalUrl" --timezone="$timezone" --month="$month" --team="$team"

       open $onCallCSV
   }
   ```
   Then, reload your shell configuration:
   ```sh
   source ~/.zshrc  # or source ~/.bashrc
   ```

## Usage

### Running with the `run-oncall` Shortcut

To run the script using the shell shortcut:

```sh
run-oncall [OPTIONS]
```

### Running Directly from Node.js

If you prefer to run the script without using the `run-oncall` shortcut, navigate to the project directory and run:

```sh
NODE_TLS_REJECT_UNAUTHORIZED='0' node index.js --url="<iCal URL>" --timezone=<timezone> --month=<month> --team=<team>
```

### Available Options

| Option       | Description                  | Default Value                                                                                       |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `--url`      | iCalendar feed URL           | (Set based on your info) |
| `--timezone` | Timezone offset from UTC     | `2`                                                                                                 |
| `--month`    | Target month (numeric value) | (Set based on your info)                                                                     |
| `--team`     | Team name                    | ((Set based on your info)                                                                     |

### Example Usage

```sh
run-oncall --url="https://example.com/calendar.ics" --timezone=3 --month=5 --team=APT
```

or

```sh
NODE_TLS_REJECT_UNAUTHORIZED='0' node index.js --url="https://example.com/calendar.ics" --timezone=3 --month=5 --team=APT
```

This will fetch the on-call schedule for the `APT` team from the specified iCalendar URL , for the month of May.

## Output

After running the script, you will see output similar to the following:

```sh
https://nuvei.pagerduty.com/private/524fe818c015b6b5c9319c3905590bb8de83645c57df5003/feed/PCKZD3T
(node:84507) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
(Use `node --trace-warnings ...` to show where the warning was created)
{
  'Nofar Elhadad': 5,
  'first last': 7,
  '.. ..': 9,
}
CSV file written successfully to: APT_March.csv
Schedule exported to: APT_March.csv
```

The CSV file will be saved with the format `teamName_monthName.csv`, e.g., `APT_March.csv`, containing the number of on-call occurrences per team member.

## Troubleshooting

- Ensure Node.js is installed and available in your environment.
- Check if the specified iCalendar URL is accessible.
- If encountering SSL issues, the script disables TLS verification using `NODE_TLS_REJECT_UNAUTHORIZED='0'`.
- If using the `run-oncall` shortcut, ensure your shell configuration is properly sourced.

