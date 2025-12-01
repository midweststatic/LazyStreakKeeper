# Lazy Streak Keeper

A focused and self-contained Tampermonkey userscript that automates KoGaMa chat streak keeping through timed outbound messages, delayed reply checks, and conditional follow-up dispatching, all with persistent state stored locally.

---

## Requirements

1. A browser with Tampermonkey (or any userscript-capable extension).  
2. An active and logged-in KoGaMa session in that browser.  
3. The account acting as the Streak Keeping Bot must be befriended with your account.  
   > If you use a dedicated bot or alternate account, set `TARGET_PROFILE` to that profile’s UID.    
   > On KoGaMa WWW the automated bot made by [Awxi](https://github.com/wowizowiii) is called [Streak Keeper](https://www.kogama.com/profile/670350173/)   
4. Set the correct sender UID inside the script:

   ```javascript
   const USERID = '12345';
   ```
   > Your User ID is the numeric segment found in your profile URL:   
     Example: ``https://www.kogama.com/profile/670350173/``   
     In this case, the UID is ``670350173``.

---

## Features
### Timed streak upkeep
Every seven hours, the script selects a message from its internal pool and sends it to the target profile. It then waits for a reply and, if none appears, transmits an additional follow-up after the grace period elapses.

### Local persistence
Two persistent keys are stored in localStorage:

``last_sent`` - timestamp of the initial message.     
``followup_sent`` - marker for either a received reply or a delivered follow-up.  
This allows the script to resume seamlessly after navigation or reloads without losing its place in the cycle.

### Structured reply detection
After each message dispatch, the script polls the KoGaMa chat history. It inspects the most recent entry and verifies whether it originated from the designated partner profile. The follow-up is only sent if no matching reply is observed.

### Message variation
The ``MESSAGES`` array defines a rotation pool of preset phrases. You may expand, refine, or fully replace this list without affecting core behaviour.

---

##Installation

1. Open Tampermonkey and create a new script.
2. Paste the userscript source into the new file.
3. Set your own UID in the ``USERID`` constant.
4. Save and enable the script.
5. Navigate to any KoGaMa page to allow execution.

---

## Customisation
The script can be tuned by adjusting the following values:

``MESSAGES`` - message pool   
``RESPONSE_WAIT_MS`` - reply wait duration   
``POLL_INTERVAL_MS`` - interval between history checks   
``MESSAGE_INTERVAL_MS`` - full streak interval  

--- 

## Security Notice
All requests are made under your authenticated KoGaMa session via credentials: "``include``".   
Avoid running this script in an untrusted environment and never share your session cookies or modified builds.

---

## License

```txt
Non-Redistributable Personal Use License (NRPUL)

Permission is granted to use, modify, and maintain private copies of this software for personal,
non-commercial purposes.

Redistribution of the software, in original or modified form, is strictly prohibited. This includes,
but is not limited to:
- public reposting,
- publication in repositories,
- mirroring,
- repackaging,
- sublicensing,
- inclusion in compilations or automated distribution systems.

You may not share derivative works or expose the script in any public-facing context.   
All rights not expressly granted remain with the author (https://github.com/midweststatic).
