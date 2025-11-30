# Lazy Streak Keeper
A lightweight Tampermonkey userscript that automatically maintains KoGaMa chat streaks by posting timed messages, waiting for replies, and issuing follow-up messages when necessary. All activity is persisted locally so it survives page reloads.

---

## Requirements

1. A browser with Tampermonkey (or a compatible userscript manager) installed.  
2. A logged-in KoGaMa session in the same browser.  
3. You must have the [Streak Keeper](https://www.kogama.com/profile/670350173) account befriended.
     > if you're hosting a bot to respond to you in your own environment, edit ``TARGET_PROFILE`` to be the UID of the account you use.
  
5. The script must be edited to set the correct chat user id:  

   ```javascript
   const USERID = 'PUT_USERID_HERE';
   ```   
    > User ID is contained within your profile URL, like this:   
    ``kogama.com/profile/670350173/``, In ths case `670350173` is the User ID we'd require if it was our account.

---

## Features
### Automated streak maintenance

The script sends a randomly selected message once every seven hours. A reply is expected from the streak keeper profile. If no reply arrives within two minutes, the script sends a follow-up message automatically.

### Local persistence

Two values are stored in localStorage:

``last_sent`` tracks when the initial message was sent.

``followup_sent`` records whether a follow-up was issued or a reply was received.

This guarantees uninterrupted operation even if the page reloads.

### Response polling

After sending a message, the script polls the chat endpoint every five seconds for up to two minutes. A reply from the target profile is detected by comparing timestamps.

### Randomized messages

A built-in array of message templates ensures variation in communication. Users may modify or expand this list directly in the script.

--- 
## Installation

1. Open Tampermonkey, create a new script.
2. Paste the content from the automatic streak keeper userscript file.
3. Replace the value of ``USERID`` with your own user ID.
4. Save and enable the script.
5. Visit any KoGaMa page to allow it to run.

---

## Customisation
You may adjust behaviour in the script:

- Message templates: modify the ``MESSAGES`` array
- Delay before follow-up: adjust ``RESPONSE_WAIT_MS``
- Polling frequency: modify ``POLL_INTERVAL_MS``
- Streak interval: change ``SEVEN_HOURS_MS``

---

## Security Notice
The script performs requests using your active KoGaMa login session (credentials: 'include').
Do not run it in an untrusted browser environment and never share your session.

--- 

## License
Free to use, modify, and adapt without restriction.
