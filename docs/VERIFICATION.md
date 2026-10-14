# Verification — studio upgrades

14 October 2026.

- Syntax checks, production build, and `git diff --check` passed.
- All 61 Node/Linkedom tests passed, including original motion/slideshow/demo checks and new streaming, Markdown, public comparison and recording checks.
- Chromium rendered home, chat, and six changed/new product routes at 320, 390, 768 and 1440px without horizontal page overflow or page JavaScript errors. Games filtering returned exactly two projects at each width.
- Eight desktop/phone demo recordings and their posters were generated from actual interactions in the site's fictional workspaces. Each MP4 is under 40KB; video and poster assets total approximately 364KB on disk.
- On a mobile Chromium viewport, both video elements were muted, inline, playing, and had advancing current time. Explicit pause survived leaving/re-entering the viewport; selecting FlowTrack loaded its own recordings.
- Browser → real Node API handler → fixture upstream/Redis → streamed browser reply was verified locally. The backend-reported model appeared, Markdown table/code rendered, provider HTML stayed text, usage settlement was called, Retry produced one replacement reply, and Use in project brief populated the native dialog. A catalog comparison added no extra provider request. There were no page JavaScript errors.
- The production landing project settings were readable but contained no environment variables. Actual Redis/provider credentials have not been connected; distributed quota behavior and production chat remain unverified. Local integration used a fixture provider/Redis REST response, not real production services.
- Email delivery is not implemented or provisioned yet. The Marketplace CLI required login and no enquiry recipient was provided. The existing project brief remains a local review/download flow, with no false submission confirmation.
- No installable workspace, service worker or persistent conversation history was added.

Checks used Chromium mobile emulation, not physical iPhone/Safari testing. Live activation and email delivery need the pending account/configuration steps in [PUBLIC_CHAT.md](PUBLIC_CHAT.md).
