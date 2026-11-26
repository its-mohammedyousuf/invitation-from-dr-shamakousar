/* ==========================================================================
   EDIT YOUR INVITATION HERE
   Change any text between the quotation marks, save, and re-upload.
   Everything on the website (names, date, times, venue, music) comes from this file.
   ========================================================================== */

window.INVITE = {

  /* Browser tab title */
  siteTitle: "Invitation from Dr. Shama Kousar",

  /* First screen (the closed envelope) */
  splash: {
    /* printed on the envelope's front flap, one item per line */
    lines: [
      "You are warmly invited",
      "to celebrate the wedding",
      "of Dr. Shama Kousar",
      "& Hajimalanga Baba"
    ],
    sealLabel: "Open Me"
  },

  blessing: [
    "With joy, we invite you",
    "to celebrate our special days."
  ],

  bride: { name: "Dr. Shama Kousar" },
  groom: { name: "Hajimalanga Baba" },

  timezoneOffset: "+05:30",
  events: [
    {
      id: "engagement",
      label: "Engagement",
      date: "2026-12-27",
      time: "11:00 AM",
      at: "11:00",
      venue: "M K Mulla Home",
      address: "Near Mittevali Dargha, Moratagi"
    },
    {
      id: "wedding",
      label: "Wedding",
      date: "2026-12-28",
      venue: "Sadbhavna School",
      address: "Moratagi, Taluk Sindagi, District Vijayapura"
    },
    {
      id: "reception",
      label: "Reception",
      date: "2026-12-30",
      venue: "Near Abbasali Camp",
      address: "Davalsab Doddi, Gurugunta, Taluk Lingasaguru, District Raichur"
    }
  ],

  /* Venue page */
  venue: {
    photo: "assets/venue.jpg"
  },

  countdown: {
    date: "2026-12-28",
    kicker: "Until the Wedding Day",
    heading: "Countdown",
    arrived: "The wedding day has arrived"
  },

  thanks: {
    heading: "Compliments From",
    line: "Family & Friends",
    message: "We look forward to your gracious presence."
  },

  shareMessage: "You are warmly invited to celebrate the wedding of Dr. Shama Kousar and Hajimalanga Baba. Engagement: Sunday, 27 December 2026 at 11:00 AM, M K Mulla Home, Near Mittevali Dargha, Moratagi. Wedding: Monday, 28 December 2026, Sadbhavna School, Moratagi, Taluk Sindagi, District Vijayapura. Reception: Wednesday, 30 December 2026, Near Abbasali Camp, Davalsab Doddi, Gurugunta, Taluk Lingasaguru, District Raichur.",

  /* Optional RSVP button. Put a WhatsApp number with country code and no
     spaces or + (example: "919876543210"). Leave empty "" to hide the button. */
  rsvpWhatsApp: "",

  /* Background music (your nasheed)
     - file:  the audio file inside the assets folder
     - start: seconds skipped at the start. It plays from here, and every time
              it ends it loops back to here.
     - volume: 0 to 100 */
  music: {
    file: "assets/nasheed.mp3",
    start: 5,
    volume: 80
  }
};
