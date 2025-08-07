import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, classId, time, access_token, participants, description } =
    req.body;

  // Validate required fields
  if (!title || !time || !access_token) {
    return res.status(400).json({
      error:
        "Missing required fields: title, time, and access_token are required.",
    });
  }

  // OAuth2 credentials from environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback";

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth2 credentials in environment variables");
    return res.status(500).json({
      error: "Server configuration error: Missing Google OAuth2 credentials",
    });
  }

  try {
    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Set the access token
    oauth2Client.setCredentials({
      access_token: access_token,
    });

    // Initialize Google Calendar API
    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    // Prepare event timing
    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    // Create calendar event with Google Meet
    const eventResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1, // Required for Meet integration
      requestBody: {
        summary: title,
        description:
          description ||
          `Class meeting${classId ? ` for class ID: ${classId}` : ""}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
        attendees: Array.isArray(participants)
          ? participants.map((email: string) => ({ email }))
          : [],
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: false,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 24 hours before
            { method: "popup", minutes: 10 }, // 10 minutes before
          ],
        },
      },
    });

    const event = eventResponse.data;

    // Extract Google Meet link
    const meetLink = event.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    )?.uri;

    if (!meetLink) {
      console.warn("Google Meet link not generated for event:", event.id);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      eventId: event.id,
      htmlLink: event.htmlLink,
      meetLink: meetLink,
      eventDetails: {
        title: event.summary,
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
        description: event.description,
      },
      message:
        "Google Calendar event created successfully with Google Meet link",
    });
  } catch (error: unknown) {
    console.error("Google Calendar API Error:", error);

    // Handle specific error cases
    let errorMessage = "Failed to create Google Calendar event with Meet link";
    let statusCode = 500;

    // Type guard to check if error has response property
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response: { status: number; data: { error?: { message?: string } } } };
      const { status, data } = apiError.response;
      statusCode = status;

      switch (status) {
        case 401:
          errorMessage =
            "Authentication failed. Please re-authorize with Google.";
          break;
        case 403:
          if (data.error?.message?.includes("insufficient permissions")) {
            errorMessage =
              "Insufficient permissions. Please ensure the app has Calendar access.";
          } else {
            errorMessage =
              "Access forbidden. Check your Google Calendar permissions.";
          }
          break;
        case 404:
          errorMessage = "Calendar not found. Using default calendar.";
          break;
        default:
          errorMessage = data.error?.message || errorMessage;
      }
    }

    return res.status(statusCode).json({
      error: errorMessage,
      success: false,
      details:
        process.env.NODE_ENV === "development"
          ? {
              originalError: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            }
          : undefined,
    });
  }
}

// Required environment variables:
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret
// GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback (or your production URL)