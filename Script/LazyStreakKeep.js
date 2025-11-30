// ==UserScript==
// @name         Lazy Streak Keeper
// @namespace    github.com/midweststatic/LazyStreakKeeper
// @version      1.2
// @author       Simon
// @description  Sends a chat POST every 7 hours, checks history and issues follow-ups; persists state in localStorage
// @match        *://www.kogama.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==


// General config
const USERID = '000000'; // Edit this value to be your own UID.
const TARGET_PROFILE = 670350173;

const LAST_SENT_KEY = 'last_sent';
const FOLLOWUP_SENT_KEY = 'followup_sent';

const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

// Chat history check 
const INITIAL_HISTORY_DELAY_MS = 60 * 1000; // first history check after 60s
const HISTORY_RETRY_DELAY_MS = 40 * 1000;   // retry every 40s if condition not met
const RESPONSE_WAIT_MS = 2 * 60 * 1000;     // total window to keep trying (2 minutes)

function nowIso(){ return new Date().toISOString(); }

async function postChat(message){
    const url = `https://www.kogama.com/chat/${USERID}/`;
    const payload = { to_profile_id: TARGET_PROFILE, message };
    const resp = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('POST failed: ' + resp.status);
    return resp.json().catch(() => null);
}

async function fetchChat(){
    const url = `https://www.kogama.com/chat/${USERID}/`;
    const resp = await fetch(url, { method: 'GET', credentials: 'include' });
    if (!resp.ok) throw new Error('GET failed: ' + resp.status);
    return resp.json().catch(() => null);
}

// target the specific account chat history to avoid abusing API >.<
// Endpoint: /chat/$USERID/history/$TARGET_PROFILE/
async function fetchHistory(){
    const url = `https://www.kogama.com/chat/${USERID}/history/${TARGET_PROFILE}/`;
    const resp = await fetch(url, { method: 'GET', credentials: 'include' });
    if (!resp.ok) throw new Error('HISTORY GET failed: ' + resp.status);
    return resp.json().catch(() => null);
}

function getIso(key){
    const v = localStorage.getItem(key);
    return v || '';
}

function setIso(key, iso){
    localStorage.setItem(key, iso);
}

function isoToTs(iso){
    const t = Date.parse(iso || '');
    return Number.isFinite(t) ? t : 0;
}

// Message array, be welcome to customise with anything silly ^_^
const MESSAGES = [
    "you are so loved <3",
    "streak check in, hi!",
    "keeping the streak alive <3",
    "quick hello from your streak bot",
    "sending love and a tiny nudge",
    "streak maintained, hi!",
    "just popping in to keep things going",
    "cheering for the streak <3",
    "automated hello, have a nice day",
    "tiny reminder: you are awesome"
];

function chooseRandom(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

// Waits using the history endpoint logic:
// - wait INITIAL_HISTORY_DELAY_MS
// - perform GET /chat/$USERID/history/$TARGET_PROFILE/
// - inspect data[0] (index 0 is expected to be the latest message)
// - if data[0].from_profile_id === TARGET_PROFILE -> return true (condition met)
// - otherwise wait HISTORY_RETRY_DELAY_MS and retry, until RESPONSE_WAIT_MS elapsed
async function waitForHistoryCondition(){
    const start = Date.now();
    await sleep(INITIAL_HISTORY_DELAY_MS);

    while (Date.now() - start < RESPONSE_WAIT_MS){
        try{
            const hist = await fetchHistory();
            if (hist && Array.isArray(hist.data) && hist.data.length > 0){
                const latest = hist.data[0]; // get the latest direct message 
                if (latest && Number(latest.from_profile_id) === Number(TARGET_PROFILE)){
                    return { ok: true, latest };
                }
            }
        } catch(e){
            // ignore all issues and retry on timeout :3
        }

        // wait and try again if no match
        const timeLeft = RESPONSE_WAIT_MS - (Date.now() - start);
        if (timeLeft <= 0) break;
        await sleep(Math.min(HISTORY_RETRY_DELAY_MS, timeLeft));
    }

    return { ok: false, latest: null };
}

async function sendIfDue(){
    const lastIso = getIso(LAST_SENT_KEY);
    const lastTs = isoToTs(lastIso);
    const now = Date.now();

    if (now - lastTs < SEVEN_HOURS_MS) return;

    const initialMsg = chooseRandom(MESSAGES);

    try{
        await postChat(initialMsg);
        const sentIso = nowIso();
        setIso(LAST_SENT_KEY, sentIso);
        setIso(FOLLOWUP_SENT_KEY, '');
        const histResult = await waitForHistoryCondition();
        if (histResult.ok){
            const storedFollowup = getIso(FOLLOWUP_SENT_KEY) || '';
            // storedFollowup may hold 'followup_sent:<iso>' or 'reply_received:<iso>'
            if (!storedFollowup.startsWith('followup_sent:') || isoToTs(storedFollowup.split(':')[1]) <= isoToTs(sentIso)){
                const followup = chooseRandom(MESSAGES);
                await postChat(followup);
                setIso(FOLLOWUP_SENT_KEY, `followup_sent:${nowIso()}`);
            }
            return;
        }

        // If not matched within window, do nothing here (no follow-up sent)
        // Too lazy to add extra logic, mayhaps one day lol
    } catch(e){
        // ignore all errors and hope for the best, let script work on scheduled cooldowns
        return;
    }
}

(function main(){
    sendIfDue();
    setInterval(sendIfDue, 60 * 1000);
})();
