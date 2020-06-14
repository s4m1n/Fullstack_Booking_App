const express = require('express');
const app = express();
const cors = require('cors');

var var_arr = ['Refresh the browser to see your events!'];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Hello from get');
});

app.post('/', (req, res) => {
  const code = req.body.code;
  // console.log(code);
  const fs = require('fs');
  const { google } = require('googleapis');

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/calendar'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = 'token.json';

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   */
  function getAccessToken(oAuth2Client, callback) {
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   */
  function listEvents(auth) {
    async function fun() {
      const calendar = await google.calendar({ version: 'v3', auth });
      calendar.events.list(
        {
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        },
        (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const events = res.data.items;
          if (events.length) {
            console.log('Upcoming 10 events:', events);
            events.map((event, i) => {
              // const start = event.start.dateTime || event.start.date;
              // console.log(`${start} - ${event.summary}`);
              var_arr.push(event);
            });
          } else {
            console.log('No upcoming events found.');
          }
        }
      );
    }
    fun();
  }

  res.send(var_arr);
});

app.post('/events', (req, res) => {
  const { google } = require('googleapis');
  const { OAuth2 } = google.auth;

  // Create a new instance of oAuth and set our Client ID & Client Secret.
  const oAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  // Call the setCredentials method on our oAuth2Client instance and set our refresh token.
  oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  // Create a new calender instance.
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  // Create a new event start date instance for temp uses in our calendar.
  const eventStartTime = new Date();
  eventStartTime.setDate(eventStartTime.getDay() + 2);

  // Create a new event end date instance for temp uses in our calendar.
  const eventEndTime = new Date();
  eventEndTime.setDate(eventEndTime.getDate() + 2);
  eventEndTime.setMinutes(eventEndTime.getMinutes() + 60);

  // Create a dummy event for temp uses in our calendar
  const event = {
    summary: `${req.body.summary}`,
    description: `${req.body.description}`,
    colorId: 6,
    start: {
      dateTime: eventStartTime,
    },
    end: {
      dateTime: eventEndTime,
    },
  };

  console.log(event);

  // Check if we a busy and have an event on our calendar for the same time.
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        items: [{ id: 'primary' }],
      },
    },
    (err, res) => {
      // Check for errors in our query and log them if they exist.
      if (err) return console.error('Free Busy Query Error: ', err);

      const eventArr = res.data.calendars.primary.busy;

      // Check if event array is empty which means we are not busy
      if (eventArr.length === 0) {
        // If we are not busy create a new calendar event.
        return calendar.events.insert(
          { calendarId: 'primary', resource: event },
          (err) => {
            if (err)
              return console.error('Error Creating Calender Event:', err);

            return console.log('Event created successfully.');
          }
        );
      }
      // If event array is not empty log that we are busy.
      return console.log(`Sorry I'm busy for that time...`);
    }
  );
  console.log(req.body);
  // using Twilio SendGrid's v3 Node.js Library
  // https://github.com/sendgrid/sendgrid-nodejs
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: req.body.to,
    from: 'johndoe@gmail.com',
    subject: req.body.summary,
    text: req.body.description,
    html: req.body.description,
  };
  // sgMail.send(msg);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
