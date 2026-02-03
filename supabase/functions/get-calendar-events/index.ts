import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Helper function to parse iCal DATE-TIME (YYYYMMDDTHHMMSSZ or YYYYMMDD)
function parseIcalDate(icalDate: string): Date {
  const year = parseInt(icalDate.substring(0, 4));
  const month = parseInt(icalDate.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(icalDate.substring(6, 8));

  if (icalDate.includes("T")) {
    // Has time component
    const hour = parseInt(icalDate.substring(9, 11));
    const minute = parseInt(icalDate.substring(11, 13));
    const second = parseInt(icalDate.substring(13, 15));
    // Assuming UTC if 'Z' is present, otherwise local time for simplicity
    // For more robust handling, a proper iCal parser library would be ideal
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
    // Date only
    return new Date(year, month, day);
  }
}

serve(async (req) => {
  const ICAL_URL = "https://calendar.google.com/calendar/ical/soi.bpma%40gmail.com/private-b1d15c8bb4e7822676c4dce01499231f/basic.ics";

  try {
    const response = await fetch(ICAL_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
    }
    const icalText = await response.text();

    const events: any[] = [];
    let currentEvent: any = null;
    const lines = icalText.split(/\r\n|\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("BEGIN:VEVENT")) {
        currentEvent = {};
      } else if (trimmedLine.startsWith("END:VEVENT")) {
        if (currentEvent) {
          // Process dates
          if (currentEvent.DTSTART) {
            currentEvent.start = parseIcalDate(currentEvent.DTSTART);
            // If DTSTART is DATE-only, DTEND is also DATE-only and represents the day after the event.
            // We want the event to span the entire day of DTSTART and DTEND (if DTEND exists and is DATE-only)
            if (currentEvent.DTSTART.length === 8 && currentEvent.DTEND && currentEvent.DTEND.length === 8) {
              const endDate = parseIcalDate(currentEvent.DTEND);
              endDate.setDate(endDate.getDate() - 1); // Adjust to the actual end day
              currentEvent.end = endDate;
            } else if (currentEvent.DTEND) {
                currentEvent.end = parseIcalDate(currentEvent.DTEND);
            } else {
                currentEvent.end = currentEvent.start; // If no end date, event is just one day
            }
            // Convert to ISO string for easier handling in frontend
            currentEvent.start = currentEvent.start.toISOString();
            currentEvent.end = currentEvent.end.toISOString();

          }
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        const parts = trimmedLine.split(":");
        if (parts.length > 1) {
          let key = parts[0];
          let value = parts.slice(1).join(":");

          // Handle properties with parameters like DTSTART;VALUE=DATE:
          const keyParts = key.split(";");
          if (keyParts.length > 1) {
            key = keyParts[0];
            // Potentially store parameters if needed, for now just taking the main key
          }

          // Unfold multi-line values (if any, though basic.ics usually doesn't have them)
          // For now, simple line split is used. A full iCal parser would handle this.
          currentEvent[key] = value;
        }
      }
    }

    return new Response(JSON.stringify(events), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
