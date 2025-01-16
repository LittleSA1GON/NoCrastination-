// DEFAULT DATA
var defaultBlockedSites = [
  ["discord.com", ""],
  ["www.youtube.com", "/shorts/*"],
]; // Distracting sites

var defaultAllowedSites = [
  ["mail.google.com", ""],
  ["classroom.google.com", ""],
]; // Educational sites

var emptyBlockedSiteObject = {
  Mild: [], // example: [["www.reddit.com", "/r/comics"], ["www.tiktok.com", ""]]
  Serious: [], // example: [["discord.com", ""], ["www.youtube.com", "/shorts/*"]]
  Restrictive: [], // example: [["mail.google.com"], ["classroom.google.com", ""]]
  FullyRestricted: [], // example: [["docs.google.com", ""], ["www.easybib.com", "/mla/source"]]
};

var emptyReminders = { times: [] }; // {"times":[{"id": 0, "name": "Do Dishes", "priority": "low"}]}
var emptySiteTimeTracker = {}; // {"www.reddit.com", "10000000"}

chrome.runtime.onInstalled.addListener(() => {
  // Set data in chrome storage
  console.log("we added the things");
  emptyBlockedSiteObject.Serious = defaultBlockedSites; // default sites we deem distracting
  emptyBlockedSiteObject.Restrictive = defaultAllowedSites; // default sites we deem educational/productive
  var blockedSites = JSON.stringify(emptyBlockedSiteObject);
  var siteTimes = emptySiteTimeTracker;
  var reminders = JSON.stringify(emptyReminders);
  // We use localstorage because it persists after you close the extension
  chrome.storage.local.set({ blockedSites: blockedSites });
  // Set intensity as none
  chrome.storage.local.set({ intensity: "Mild" });
  // Set Reminders/Todo
  chrome.storage.local.set({ reminders: reminders });
  // Set tracked sites and time
  chrome.storage.local.set({ siteTimes: siteTimes });
  // Set tracking
  chrome.storage.local.set({ tracking: false });
});

async function playSound(source = "sounds/radar.mp3", volume = 1) {
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "alarm.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "alarm", // details for using the API
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await playSound();
  var alarmName = alarm.name.split("--{*^.^*}--")[1];
  chrome.notifications.create(alarm.name, {
    type: "basic",
    iconUrl: "hello_extensions.png",
    title: alarmName,
    message: "Your alarm for " + alarmName + " has rung!",
    contextMessage: ":)",
    buttons: [
      {
        title: "Stop",
        iconUrl: "/images/block.png",
      },
      {
        title: "Snooze",
        iconUrl: "/images/allow.png",
      },
    ],
  });
});

chrome.notifications.onButtonClicked.addListener(async function (
  notifId,
  btnIdx
) {
  if (btnIdx === 0) {
    console.log(notifId);
    chrome.offscreen.closeDocument();
    await chrome.runtime.sendMessage({ updateAlarm: true });
  } else if (btnIdx === 1) {
    // snooze
    await chrome.alarms.create(notifId, {
      //                                               9 mins, standard snooze time
      delayInMinutes: 9, // Set alarm to fire after specified minutes
    });
    chrome.offscreen.closeDocument();
    await chrome.runtime.sendMessage({ updateAlarm: true });
  }
});

// make an event listender usig chrome.tabs.onUpdated.addListener to see when a site is changed, and when it does, start a stopwatch in js to keep running until onupdate ahppend again, and when that happens, log the site name and time used in it in

var startTime; // to keep track of the start time
var stopwatchInterval; // to keep track of the interval
var elapsedPausedTime = 0; // to keep track of the elapsed time while stopped
var currentURL;
function startStopwatch() {
  startTime = new Date().getTime();
}

function stopStopwatch() {
  elapsedPausedTime = new Date().getTime() - startTime;
}

chrome.tabs.onUpdated.addListener(async function (e, changeinfo) {
  // find a way to get the on site updated only once per site
  var tracking1 = await chrome.storage.local.get(["tracking"]);
  var tracking = tracking1.tracking;
  if (tracking) {
    if (changeinfo.url != currentURL) {
      console.log(e);
      stopStopwatch();
      var siteTimes1 = await chrome.storage.local.get(["siteTimes"]);
      var siteTimes = siteTimes1.siteTimes;
      if (currentURL in siteTimes) {
        siteTimes[currentURL] += elapsedPausedTime;
      } else {
        siteTimes[currentURL] = elapsedPausedTime;
      }
      await chrome.storage.local.set({ siteTimes: siteTimes });
      currentURL = changeinfo.url;
      startStopwatch();
    }
  }
});

chrome.tabs.onActivated.addListener(async function (activeInfo) {
  var tracking1 = await chrome.storage.local.get(["tracking"]);
  var tracking = tracking1.tracking;
  if (tracking) {
    var changeinfo = await chrome.tabs.get(activeInfo.tabId);
    if (changeinfo.url != currentURL) {
      stopStopwatch();
      var siteTimes1 = await chrome.storage.local.get(["siteTimes"]);
      var siteTimes = siteTimes1.siteTimes;
      if (currentURL in siteTimes) {
        siteTimes[currentURL] += elapsedPausedTime;
      } else {
        siteTimes[currentURL] = elapsedPausedTime;
      }
      console.log(siteTimes);
      await chrome.storage.local.set({ siteTimes: siteTimes });
      currentURL = changeinfo.url;
      startStopwatch();
    }
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, reply) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.setIntensity) {
    chrome.storage.local.set({ intensity: request.setIntensity });
    console.log("recieved  " + request.setIntensity);
    reply("set"); // Reply with "Set"
  }
  if (request.updateRuleFile) {
    await updateRuleFile();
  }
  if (request.tracking == true) {
    tracking = true;
    var currTab = chrome.tabs.getCurrent();
    currentURL = currTab.url;
    startStopwatch();
  } else if (request.tracking == false) {
    tracking = false;
    stopStopwatch();
    var siteTimes1 = await chrome.storage.local.get(["siteTimes"]);
    var siteTimes = siteTimes1.siteTimes;
    if (currentURL in siteTimes) {
      siteTimes[currentURL] += elapsedPausedTime;
    } else {
      siteTimes[currentURL] = elapsedPausedTime;
    }
    await chrome.storage.local.set({ siteTimes: siteTimes });
    currentURL = changeinfo.url;
  }
  if (request.getTracking) {
    reply(tracking);
  }

  return true;
});

function djb2_xor(str) {
  let len = str.length;
  let h = 5381;

  for (let i = 0; i < len; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

async function updateRuleFile() {
  var blockedSitesString = await chrome.storage.local.get(["blockedSites"]);
  var intensityThing = await chrome.storage.local.get(["intensity"]);
  var blockedSites = JSON.parse(blockedSitesString.blockedSites);
  var intensity = intensityThing.intensity;
  console.log(blockedSites);
  console.log(intensityThing);
  console.log(blockedSites[intensity]);
  var blockedSitesForIntensity = blockedSites[intensity];

  const rules = [];

  var allow = intensity == "Restrictive" || intensity == "FullyRestricted";

  if (allow) {
    const rule = {
      id: 1,
      priority: 1,
      condition: {
        urlFilter: ".*",
        resourceTypes: ["main_frame", "sub_frame"],
      },
      action: {
        type: "redirect",
        redirect: { url: chrome.runtime.getURL("block.html") },
      },
    };
    rules.push(rule);
  }

  for (var i in blockedSitesForIntensity) {
    var siteArray = blockedSitesForIntensity[i];

    const rule = {
      id: djb2_xor(i),
      priority: allow ? 2 : 1,
      condition: {
        urlFilter:
          siteArray[1] === ""
            ? "||" + siteArray[0] + "/*"
            : "||" + siteArray[0] + siteArray[1],
        resourceTypes: ["main_frame", "sub_frame"],
      },
      action: allow
        ? {
            type: "allow",
          }
        : {
            type: "redirect",
            redirect: { url: chrome.runtime.getURL("block.html") },
          },
    };

    rules.push(rule);
  }

  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map((rule) => rule.id);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: rules,
  });
  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log(currentRules);
}
