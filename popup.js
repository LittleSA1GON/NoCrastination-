Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

function show(className, show = true) {
  if (document.getElementById("maintitle").style.display == "") {
    document.getElementById("fakeback").style.display = "none";
  } else {
    document.getElementById("fakeback").style.display = "";
  }
  for (let element of document.getElementsByClassName(className)) {
    if (
      element.className.includes("back") &&
      document.getElementById("maintitle").style.display != ""
    ) {
      element.style.display = "";
      element.style.visibility = "visible";
    } else if (
      element.className.includes("back") &&
      document.getElementById("maintitle").style.display == ""
    ) {
      element.style.display = "none";
      element.style.visibility = "invisible";
    } else {
      if (show) {
        element.style.display = "";
      } else {
        element.style.display = "none";
      }
    }
  }
}
show("main");
show("alarms", false);
show("reminders", false);
show("sitetracking", false);

var Intensity = document.getElementById("Intensity");
var SiteList = document.getElementById("SiteList");

// This function creates each one of those little things that show the blocked/allowed sites for each intensity
function makeSiteElement(url) {
  var siteElement = document.createElement("div");
  siteElement.classList.add("site");
  // This is the actual text displaying the url
  var siteElementText = document.createElement("p");
  siteElementText.classList.add("sitetext");
  siteElementText.innerText = url;
  // This is the X button to deltet it
  var siteElementClose = document.createElement("img");
  siteElementClose.classList.add("siteclose");
  siteElementClose.src = "images/x.png";
  siteElementClose.onclick = function (e) {
    // This function runds when the x button is clicked
    var site = e.target.parentElement.children[0].innerText;
    var siteHostname = new URL("https://" + site).hostname;
    var sitePath = site.split(siteHostname)[1];
    console.log(siteHostname);

    chrome.storage.local.get(["blockedSites"]).then((sites) => {
      var siteList = JSON.parse(sites.blockedSites);
      chrome.storage.local.get(["intensity"]).then((inten) => {
        var intensity = inten.intensity;
        // This for loop loops through every site for the current intensity
        for (var i in siteList[intensity]) {
          var siteArray = siteList[intensity][i];
          if (siteArray[0] == siteHostname && siteArray[1] == sitePath) {
            // This means weve found it
            console.log(siteArray[0]);
            console.log(siteList[intensity][i]);
            console.log(i);
            // and this deletes it
            siteList[intensity].splice(i, 1);
            break;
          }
        }
        // and updates it in localstorage
        chrome.storage.local
          .set({ blockedSites: JSON.stringify(siteList) })
          .then(async () => {
            await updateRuleFile();
            // preety self explanatory
            updateSiteList();
          });
      });
    });
  };
  // This adds the text and X to the siteElement
  siteElement.appendChild(siteElementText);
  siteElement.appendChild(siteElementClose);
  return siteElement;
}
function makeSetting(name, func, sel) {
  var setting = document.createElement("div");
  setting.classList.add("setting");
  setting.style.backgroundColor = sel ? "rgb(74, 194, 117)" : "#F34949";
  // This is the actual text displaying the name
  var settingText = document.createElement("p");
  settingText.innerText = name;
  // This is what happens when you click on it
  setting.onclick = function (e) {
    var selected = false;
    if (
      window.getComputedStyle(setting).backgroundColor == "rgb(74, 194, 117)"
    ) {
      setting.style.backgroundColor = "#F34949";
    } else {
      setting.style.backgroundColor = "rgb(74, 194, 117)";
      selected = true;
    }
    func(e, selected);
  };
  // This adds the text and X to the siteElement
  setting.appendChild(settingText);
  SettingsPopup.appendChild(setting);
}
function makeMenu(name, func) {
  var menu = document.createElement("div");
  menu.classList.add("menu");
  // This is the actual text displaying the name
  var menuText = document.createElement("p");
  menuText.innerText = name;
  // This is what happens when you click on it
  menu.onclick = function (e) {
    func(e);
  };
  // This adds the text and X to the siteElement
  menu.appendChild(menuText);
  MenuPopup.appendChild(menu);
}
//                      this defaults to the current intensity, but you can update any intensity if specified
function updateSiteList(type = "defaultIntensity") {
  chrome.storage.local.get(["blockedSites"]).then((sites) => {
    console.log(sites);
    var siteList = JSON.parse(sites.blockedSites);
    chrome.storage.local.get(["intensity"]).then((inten) => {
      var intensity = inten.intensity;

      if (type == "defaultIntensity") {
        type = intensity;
      }

      // Removes all existing site elements
      SiteList.replaceChildren();
      console.log(type);
      console.log(siteList[type]);
      // Loops through localstorage and adds site elements
      for (var i in siteList[type]) {
        var site = siteList[type][i];
        SiteList.prepend(makeSiteElement(site.join("")));
      }
    });
  });
}

// Defines a bunch of elements to be used later, changes styles of some
var IntensityPopup = document.getElementById("IntensityPopup");
IntensityPopup.style.display = "none";
Intensity.style.borderBottomLeftRadius = "10px";
Intensity.style.borderBottomRightRadius = "10px";
var Overlay = document.getElementById("overlay");
Overlay.style.display = "none";
var URLInputPopup = document.getElementById("URLInputPopup");
var URLInput = document.getElementById("URLInput");
var URLEndingInput = document.getElementById("URLEndingInput");
var Alarms = document.getElementById("Alarms");
var AlarmPopup = document.getElementById("AlarmPopup");
var AlarmName = document.getElementById("AlarmName");
var AlarmTime = document.getElementById("AlarmTime");
var AlarmDate = document.getElementById("AlarmDate");
var AlarmSubmit = document.getElementById("AlarmSubmit");
var Reminders = document.getElementById("Reminders");
var ReminderPopup = document.getElementById("ReminderPopup");
var ReminderName = document.getElementById("ReminderName");
var ReminderPriority = document.getElementById("ReminderPriority");
var ReminderSubmit = document.getElementById("ReminderSubmit");
var SiteTimes = document.getElementById("SiteTimes");
//var URLInputPopup = document.getElementById("URLInputPopup");
var openPopup = false;
var Mild = document.getElementById("Mild");
var Restrictive = document.getElementById("Restrictive");
var Serious = document.getElementById("Serious");
var FullyRestricted = document.getElementById("FullyRestricted");

var Settings = document.getElementById("Settings");
var SettingsPopup = document.getElementById("SettingsPopup");
SettingsPopup.style.display = "none";
var Block = document.getElementById("Block");
var URLInputSubmit = document.getElementById("URLInputSubmit");
var URLIcon = document.getElementById("URLIcon");
var Menu = document.getElementById("Menu");
var MenuPopup = document.getElementById("MenuPopup");
MenuPopup.style.display = "none";

// Again, Initializes Intensity in localstorage onload
chrome.storage.local.get(["intensity"]).then(async (inten) => {
  var intensity = inten.intensity;
  if (intensity == null) {
    await chrome.storage.local.set({ intensity: "Mild" });
    await updateRuleFile();

    Intensity.children[0].innerText = "Mild";
    Intensity.children[0].style.color = "black";
    Intensity.style.backgroundColor = "lightgreen";

    Block.style.backgroundColor = "#f94343";
    Block.children[0].src = "images/block.png";
  } else {
    // sets intensity to the correct color onload
    switch (intensity) {
      case "Mild":
        Intensity.children[0].innerText = "Mild";
        Intensity.children[0].style.color = "black";
        Intensity.style.backgroundColor = "lightgreen";

        Block.style.backgroundColor = "#f94343";
        Block.children[0].src = "images/block.png";
        break;
      case "Serious":
        Intensity.children[0].innerText = "Serious";
        Intensity.children[0].style.color = "black";
        Intensity.style.backgroundColor = "yellow";

        Block.style.backgroundColor = "#f94343";
        Block.children[0].src = "images/block.png";
        break;
      case "Restrictive":
        Intensity.children[0].innerText = "Restrictive";
        Intensity.children[0].style.color = "black";
        Intensity.style.backgroundColor = "#F34949";

        Block.style.backgroundColor = "#4ac275";
        Block.children[0].src = "images/allow.png";
        break;
      case "FullyRestricted":
        Intensity.children[0].innerText = "Fully Restricted";
        Intensity.children[0].style.color = "white";
        Intensity.style.backgroundColor = "#000000";

        Block.style.backgroundColor = "#4ac275";
        Block.children[0].src = "images/allow.png";
        break;

      default:
      // code block
    }
  }
});

async function updateRuleFile() {
  await chrome.runtime.sendMessage({ updateRuleFile: true });
}

async function setIntensity(intensity) {
  await chrome.storage.local.set({ intensity: intensity });
  await updateRuleFile();
}
// Timer stuff
async function createAlarm(name, newTime) {
  await chrome.alarms.create(name, {
    delayInMinutes: newTime / 1000 / 60, // Set alarm to fire after specified minutes
  });
  console.log(`Timer set for ${newTime / 1000 / 60} minutes.`);
}

async function editAlarm(oldValue, name, newTime) {
  // Initially deletes the alarm
  console.log("editing " + oldValue);
  await chrome.alarms.clear(oldValue);
  // Creates it again
  console.log("creating " + name);
  await chrome.alarms.create(name, {
    delayInMinutes: newTime / 1000 / 60, // Set alarm to fire after specified minutes
  });
}

function deleteAlarm(id, name) {
  console.log(id, name);
  chrome.alarms.clear(id + "--{*^.^*}--" + name);
}
// Reminder stuff
async function createReminder(name, priority) {
  var remindersString = await chrome.storage.local.get(["reminders"]);
  var reminders = JSON.parse(remindersString.reminders);
  var newReminder = {
    id: name.split("--{*^.^*}--")[0],
    name: name.split("--{*^.^*}--")[1],
    priority: priority,
  };
  reminders["times"].push(newReminder);
  var remindersNewString = JSON.stringify(reminders);
  await chrome.storage.local.set({ reminders: remindersNewString });
}

async function editReminder(oldValue, name, priority) {
  var remindersString = await chrome.storage.local.get(["reminders"]);
  var reminders = JSON.parse(remindersString.reminders);
  for (var i in reminders["times"]) {
    var reminder = reminders["times"][i];
    if (reminder.id == oldValue.split("--{*^.^*}--")[0]) {
      reminder.name = name.split("--{*^.^*}--")[1];
      reminder.priority = priority;
    }
  }
  var remindersNewString = JSON.stringify(reminders);
  await chrome.storage.local.set({ reminders: remindersNewString });
}

async function deleteReminder(id, name) {
  var remindersString = await chrome.storage.local.get(["reminders"]);
  var reminders = JSON.parse(remindersString.reminders);
  var indexToDelete = 0;
  for (var i in reminders["times"]) {
    var reminder = reminders["times"][i];
    if (reminder.id == id) {
      indexToDelete = i;
      break;
    }
  }
  reminders["times"].splice(indexToDelete, 1);
  var remindersNewString = JSON.stringify(reminders);
  await chrome.storage.local.set({ reminders: remindersNewString });
}

// updates the sitelist at the very beginging
updateSiteList();

// On clicking Intensity button
Intensity.onclick = function (e) {
  /** Because IntensityPopup is a child of Intensity, we run this
    if statement to only capture clicks from the actual intensity. */
  if (e.target.id != "Intensity" && e.target.id != "IntensityText") {
    return;
  }
  // Opens and closes the popup
  if (openPopup) {
    IntensityPopup.style.display = "none";
    Intensity.style.borderBottomLeftRadius = "10px";
    Intensity.style.borderBottomRightRadius = "10px";
    Intensity.style.borderBottomLeftRadius = "10px";
    Intensity.style.borderBottomRightRadius = "10px";
  } else {
    IntensityPopup.style.display = "";
    Intensity.style.borderBottomLeftRadius = "0px";
    Intensity.style.borderBottomRightRadius = "0px";
  }

  openPopup = !openPopup;
};
// On clicking anywhere else, close the intensity popup
document.body.onclick = function (e) {
  if (
    !(
      IntensityPopup.contains(e.target) ||
      e.target == IntensityPopup ||
      Intensity.contains(e.target) ||
      e.target == Intensity
    )
  ) {
    //console.log(e.target);
    IntensityPopup.style.display = "none";
    Intensity.style.borderBottomLeftRadius = "10px";
    Intensity.style.borderBottomRightRadius = "10px";
    openPopup = false;
  }
};
// Same thing with overlay and the urlinput popup
Overlay.onclick = function (e) {
  if (URLInputPopup.contains(e.target) || e.target == URLInputPopup) {
    console.log(e.target);
  } else if (AlarmPopup.contains(e.target) || e.target == AlarmPopup) {
    console.log(e.target);
  } else if (ReminderPopup.contains(e.target) || e.target == ReminderPopup) {
    console.log(e.target);
  } else {
    Overlay.style.display = "none";
  }
};
// On clicking intendiity selectors
Mild.onclick = function () {
  Intensity.children[0].innerText = this.innerText;
  Intensity.children[0].style.color = "black";
  Intensity.style.backgroundColor = "lightgreen";

  Block.style.backgroundColor = "#f94343";
  Block.children[0].src = "images/block.png";

  console.log(IntensityPopup.style.display);
  IntensityPopup.style.display = "none";
  console.log(IntensityPopup.style.display);
  Intensity.style.borderBottomLeftRadius = "10px";
  Intensity.style.borderBottomRightRadius = "10px";
  openPopup = false;

  setIntensity("Mild").then(updateSiteList());
};
Serious.onclick = function () {
  Intensity.children[0].innerText = this.innerText;
  Intensity.children[0].style.color = "black";
  Intensity.style.backgroundColor = "yellow";

  Block.style.backgroundColor = "#f94343";
  Block.children[0].src = "images/block.png";

  IntensityPopup.style.display = "none";
  Intensity.style.borderBottomLeftRadius = "10px";
  Intensity.style.borderBottomRightRadius = "10px";
  openPopup = false;

  setIntensity("Serious").then(updateSiteList());
};
Restrictive.onclick = function () {
  Intensity.children[0].innerText = this.innerText;
  Intensity.children[0].style.color = "black";
  Intensity.style.backgroundColor = "#F34949";

  Block.style.backgroundColor = "#4ac275";
  Block.children[0].src = "images/allow.png";

  IntensityPopup.style.display = "none";
  Intensity.style.borderBottomLeftRadius = "10px";
  Intensity.style.borderBottomRightRadius = "10px";
  openPopup = false;

  setIntensity("Restrictive").then(updateSiteList());
};
FullyRestricted.onclick = function () {
  Intensity.children[0].innerText = this.innerText;
  Intensity.children[0].style.color = "white";
  Intensity.style.backgroundColor = "#000000";

  Block.style.backgroundColor = "#4ac275";
  Block.children[0].src = "images/allow.png";

  IntensityPopup.style.display = "none";
  Intensity.style.borderBottomLeftRadius = "10px";
  Intensity.style.borderBottomRightRadius = "10px";
  openPopup = false;

  setIntensity("FullyRestricted").then(updateSiteList());
};

Settings.onclick = async function (e) {
  if (Overlay.style.display == "none") {
    if (e.target.id == "Settings" || e.target.nodeName == "IMG") {
      if (SettingsPopup.style.display == "none") {
        SettingsPopup.style.display = "";
        Settings.style.borderTopLeftRadius = "0px";

        MenuPopup.style.display = "none";
        Menu.style.borderTopRightRadius = "25px";

        var tracking1 = await chrome.storage.local.get(["tracking"]);
        var tracking = tracking1.tracking;
        SettingsPopup.children[1].style.backgroundColor = tracking
          ? "rgb(74, 194, 117)"
          : "#F34949";
      } else {
        SettingsPopup.style.display = "none";
        Settings.style.borderTopLeftRadius = "25px";
      }
    }
  }
};
makeSetting(
  "Allow Tracking",
  async function (e, selected) {
    chrome.storage.local.set({ tracking: selected });
    console.log(selected);
  },
  false
);
makeSetting(
  "Google Classroom",
  function (e, selected) {
    console.log(selected);
  },
  false
);
makeSetting(
  "Canvas",
  function (e, selected) {
    console.log(selected);
  },
  false
);
// On Clicking Block button, open up the thingy
Block.onclick = async function () {
  if (Overlay.style.display == "none") {
    Overlay.style.display = "";
    if (
      document.getElementById("maintitle").style.display == "none" &&
      document.getElementById("remindertitle").style.display == "none"
    ) {
      await showAlarmPopup();
      return;
    } else if (
      document.getElementById("maintitle").style.display == "none" &&
      document.getElementById("alarmtitle").style.display == "none"
    ) {
      await showReminderPopup();
      return;
    }
    MenuPopup.style.display = "none";
    Menu.style.borderTopRightRadius = "25px";

    SettingsPopup.style.display = "none";
    Settings.style.borderTopLeftRadius = "25px";

    var urlTo = "Block";
    var inten = await chrome.storage.local.get(["intensity"]);
    var intensity = inten.intensity;
    if (intensity == "Restrictive" || intensity == "FullyRestricted") {
      urlTo = "Allow";
      URLInputSubmit.style.backgroundColor = "#4ac275";
    } else {
      URLInputSubmit.style.backgroundColor = "#f94343";
    }
    URLInputPopup.children[0].innerText = "Input URL to " + urlTo;
    URLInputSubmit.innerText = urlTo;
    // Sets the icon and url and url ending path to the inputs
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let url = tabs[0].url;
      console.log(tabs[0]);
      URLIcon.src = tabs[0].favIconUrl;
      URLInput.value = new URL(url).hostname;
      URLEndingInput.value = url.split(new URL(url).hostname)[1];
    });
  } else {
    Overlay.style.display = "none";
  }
};
// On url submit
URLInputSubmit.onclick = async function () {
  chrome.storage.local.get(["blockedSites"]).then(async (sites) => {
    var siteList = JSON.parse(sites.blockedSites);

    var site = [URLInput.value, URLEndingInput.value];
    var doit = true;

    var inten = await chrome.storage.local.get(["intensity"]);
    var intensity = inten.intensity;
    // If url is adlready in list then "doit" will be false
    for (var i in siteList[intensity]) {
      var existingSite = siteList[intensity][i];
      if (existingSite[0] == site[0] && existingSite[1] == site[1]) {
        doit = false;
      }
    }
    // if "doit" is true, then add the site thing to localstorage
    if (doit) {
      siteList[intensity].push(site);
      chrome.storage.local
        .set({ blockedSites: JSON.stringify(siteList) })
        .then(async () => {
          // preety self explanatory
          await updateRuleFile();
          updateSiteList();
          Overlay.style.display = "none";
        });
    } else {
      // Done twice in an else to satisfy syncrhornus behavior
      updateSiteList();
      Overlay.style.display = "none";
    }
  });
};

Menu.onclick = function (e) {
  if (Overlay.style.display == "none") {
    if (e.target.id == "Menu" || e.target.nodeName == "IMG") {
      if (MenuPopup.style.display == "none") {
        MenuPopup.style.display = "";
        Menu.style.borderTopRightRadius = "0px";

        SettingsPopup.style.display = "none";
        Settings.style.borderTopLeftRadius = "25px";
      } else {
        MenuPopup.style.display = "none";
        Menu.style.borderTopRightRadius = "25px";
      }
    }
  }
};
makeMenu("Alarms", async function (e) {
  console.log("Move to Timer Menu");
  MenuPopup.style.display = "none";
  Menu.style.borderTopRightRadius = "25px";
  show("main", false);
  show("alarms");
  show("reminders", false);
  show("sitetracking", false);
  Block.style.backgroundColor = "#4ac275";
  Block.children[0].src = "images/add.png";
  await updateAlarmsUI();
});
async function showAlarmPopup(add = true, id = "") {
  var trueName = "";
  var trueDate = "";
  if (!add) {
    Overlay.style.display = "";
    var alarms = await chrome.alarms.getAll();
    for (var i in alarms) {
      var alarmID = alarms[i].name.split("--{*^.^*}--")[0];
      var alarmName = alarms[i].name.split("--{*^.^*}--")[1];
      if (alarmID == id) {
        trueName = alarmName;
        trueDate = alarms[i].scheduledTime;
        AlarmPopup.setAttribute("oldValue", alarms[i].name);
      }
    }
  }
  AlarmPopup.children[0].innerText = (add ? "Add" : "Edit") + " Alarm";

  AlarmName.value = add ? "New Alarm" : trueName;
  var hour =
    (new Date(add ? new Date() : trueDate).getHours() < 10 ? "0" : "") +
    new Date(add ? new Date() : trueDate).getHours();
  var min =
    (new Date(add ? new Date() : trueDate).getMinutes() < 10 ? "0" : "") +
    new Date(add ? new Date() : trueDate).getMinutes();
  var displayTime = hour + ":" + min;
  AlarmTime.value = displayTime;
  AlarmDate.value = new Date(add ? new Date() : trueDate).toDateInputValue();
  AlarmSubmit.innerText = add ? "Add" : "Save";
}

function createAlarmUI(alarmID, alarmName, alarmDate) {
  var alarm = document.createElement("div");
  alarm.classList.add("alarm");
  alarm.setAttribute("name", alarmID);
  // This is the actual text displaying the alarm
  var alarmText = document.createElement("p");
  alarmText.innerText = alarmName;
  //
  var alarmTimeAndDateContainer = document.createElement("div");
  alarmTimeAndDateContainer.classList.add("timeAndDateContainer");

  var pm = alarmDate.getHours() >= 12;

  var time = document.createElement("p");
  time.innerText =
    (pm
      ? alarmDate.getHours() - 12
      : alarmDate.getHours() == 0
      ? 12
      : alarmDate.getHours()
    ).toString() +
    ":" +
    (alarmDate.getMinutes() > 9
      ? alarmDate.getMinutes()
      : "0" + alarmDate.getMinutes()) +
    " " +
    (pm ? "PM" : "AM");
  var date = document.createElement("p");
  date.innerText =
    (alarmDate.getMonth() + 1).toString() +
    "/" +
    alarmDate.getDate().toString() +
    "/" +
    alarmDate.getFullYear().toString().slice(-2);
  alarmTimeAndDateContainer.appendChild(time);
  alarmTimeAndDateContainer.appendChild(date);
  //
  var elipses = document.createElement("img");
  elipses.src = "images/ellipsis.png";
  //
  var alarmpopup = document.createElement("nav");
  alarmpopup.classList.add("alarmpopup");
  alarmpopup.classList.add("dropup");
  var edit = document.createElement("p");
  edit.innerText = "Edit";
  var deletee = document.createElement("p");
  deletee.innerText = "Delete";
  alarmpopup.appendChild(edit);
  alarmpopup.appendChild(deletee);
  // put it all together
  alarm.appendChild(alarmText);
  alarm.appendChild(alarmTimeAndDateContainer);
  alarm.appendChild(elipses);
  alarm.appendChild(alarmpopup);
  return alarm;
}

async function updateAlarmsUI() {
  var alarmsRaw = await chrome.alarms.getAll();
  var alarms = alarmsRaw.sort((a, b) => b.scheduledTime - a.scheduledTime);
  Alarms.innerHTML = "";
  for (var i in alarms) {
    var alarmID = alarms[i].name.split("--{*^.^*}--")[0];
    var alarmName = alarms[i].name.split("--{*^.^*}--")[1];
    var brandNewTime = new Date();
    var brandNewTim = brandNewTime.getTime();
    var newTime = alarms[i].scheduledTime;
    console.log(brandNewTim);
    console.log(newTime);
    var newTimeMili = newTime;
    console.log(newTimeMili);
    var alarmDate = new Date(newTimeMili);
    var newAlarmUI = createAlarmUI(alarmID, alarmName, alarmDate);
    Alarms.prepend(newAlarmUI);
  }
  var alarms = document.getElementsByClassName("alarm");
  console.log(alarms);
  for (var i = 0; i < alarms.length; i++) {
    var alarm = alarms[i];
    alarm.children[2].onclick = function (e) {
      if (e.target.parentElement.children[3].className.includes("dropup")) {
        e.target.parentElement.style.borderBottomRightRadius = "0px";
        e.target.parentElement.children[3].style.display = "flex";
        e.target.parentElement.children[3].classList.remove("dropup");
        e.target.parentElement.children[3].classList.add("dropdown");
      } else if (
        e.target.parentElement.children[3].className.includes("dropdown")
      ) {
        e.target.parentElement.style.borderBottomRightRadius = "10px";
        e.target.parentElement.children[3].classList.remove("dropdown");
        e.target.parentElement.children[3].classList.add("dropup");
        e.target.parentElement.children[3].style.display = "none";
      }
    };
    alarm.children[3].children[0].onclick = async function (e) {
      await showAlarmPopup(
        false,
        e.target.parentElement.parentElement.getAttribute("name")
      );
    };
    alarm.children[3].children[1].onclick = async function (e) {
      console.log(e);
      console.log(e.target.parentElement.parentElement);
      console.log(e.target.parentElement.parentElement.getAttribute("name"));
      deleteAlarm(
        e.target.parentElement.parentElement.getAttribute("name"),
        e.target.parentElement.parentElement.children[0].innerText
      );
      await updateAlarmsUI();
    };
  }
}

AlarmSubmit.onclick = async function (e) {
  var add = AlarmPopup.children[0].innerText == "Add Alarm";
  if (add) {
    chrome.alarms.getAll(async function (alarms) {
      var id = 0;
      for (var i in alarms) {
        var alarmID = alarms[i].name.split("--{*^.^*}--")[0];
        if (parseInt(alarmID) >= id) {
          id = parseInt(alarmID) + 1;
        }
      }
      var storedName = id.toString() + "--{*^.^*}--" + AlarmName.value;
      var currTime = new Date();
      var newTime = new Date();
      newTime.setYear(parseInt(AlarmDate.value.split("-")[0]));
      newTime.setMonth(parseInt(AlarmDate.value.split("-")[1]) - 1);
      newTime.setDate(parseInt(AlarmDate.value.split("-")[2]));
      newTime.setHours(
        parseInt(AlarmTime.value.split(":")[0]),
        parseInt(AlarmTime.value.split(":")[1]),
        0
      );
      var finalTime = newTime.getTime() - currTime.getTime();
      console.log(finalTime);
      await createAlarm(storedName, finalTime);
      console.log("createdAlarm");
      await updateAlarmsUI();
      Overlay.style.display = "none";
    });
  } else {
    chrome.alarms.getAll(async function (alarms) {
      var oldValue = AlarmSubmit.parentElement.getAttribute("oldValue");
      var storedName =
        oldValue.split("--{*^.^*}--")[0] + "--{*^.^*}--" + AlarmName.value;
      var currTime = new Date();
      var newTime = new Date();
      newTime.setYear(parseInt(AlarmDate.value.split("-")[0]));
      newTime.setMonth(parseInt(AlarmDate.value.split("-")[1]) - 1);
      newTime.setDate(parseInt(AlarmDate.value.split("-")[2]));
      newTime.setHours(
        parseInt(AlarmTime.value.split(":")[0]),
        parseInt(AlarmTime.value.split(":")[1]),
        0
      );
      var finalTime = newTime.getTime() - currTime.getTime();
      console.log(finalTime);
      await editAlarm(oldValue, storedName, finalTime);
      console.log("editedAlarm");
      await updateAlarmsUI();
      Overlay.style.display = "none";
    });
  }
};
makeMenu("Reminders", async function (e) {
  console.log("Move to Reminders Menu");
  MenuPopup.style.display = "none";
  Menu.style.borderTopRightRadius = "25px";
  show("main", false);
  show("alarms", false);
  show("reminders");
  show("sitetracking", false);
  Block.style.backgroundColor = "#4ac275";
  Block.children[0].src = "images/add.png";
  await updateRemindersUI();
});
var backs = document.getElementsByClassName("back");
console.log(backs);
for (var i = 0; i < backs.length; i++) {
  var back = backs[i];
  back.onclick = function () {
    show("main");
    show("alarms", false);
    show("reminders", false);
    show("sitetracking", false);
    Block.style.backgroundColor = "#f94343";
    Block.children[0].src = "images/block.png";
  };
}
// reminder
async function showReminderPopup(add = true, id = "") {
  var trueName = "";
  var truePriority = "";
  var priorities = ["low", "medium", "high"];
  if (!add) {
    Overlay.style.display = "";
    // Gets the
    var remindersString = await chrome.storage.local.get(["reminders"]);
    var reminders = JSON.parse(remindersString.reminders)["times"];
    for (var i in reminders) {
      var reminder = reminders[i];
      var reminderID = reminder.id;
      var reminderName = reminder.name;
      if (reminderID == id) {
        trueName = reminderName;
        truePriority = reminder.priority;
        ReminderPopup.setAttribute(
          "oldValue",
          reminder.id + "--{*^.^*}--" + reminder.name
        );
      }
    }
  }
  ReminderPopup.children[0].innerText = (add ? "Add" : "Edit") + " reminder";
  ReminderName.value = add ? "New Reminder" : trueName;
  ReminderPriority.value = add ? "low" : truePriority;
  ReminderSubmit.innerText = add ? "Add" : "Save";
}

function createReminderUI(reminderID, reminderName, reminderPriority) {
  var reminder = document.createElement("div");
  reminder.classList.add("reminder");
  reminder.style.backgroundColor =
    reminderPriority == "low"
      ? "lightgreen"
      : reminderPriority == "medium"
      ? "yellow"
      : reminderPriority == "high"
      ? "#f34949"
      : "lightgreen";
  reminder.setAttribute("name", reminderID);
  // This is the actual text displaying the reminder
  var reminderText = document.createElement("p");
  reminderText.innerText = reminderName;
  //
  var reminderInfoContainer = document.createElement("div");
  reminderInfoContainer.classList.add("timeAndDateContainer");

  var priorityTextText = document.createElement("p");
  priorityTextText.innerText = "Priority";
  var priorityText = document.createElement("p");
  priorityText.innerText = reminderPriority;
  reminderInfoContainer.appendChild(priorityTextText);
  reminderInfoContainer.appendChild(priorityText);
  //
  var elipses = document.createElement("img");
  elipses.style.filter = "invert(100%)"; // doesnt work for some reason, fix it

  elipses.src = "images/ellipsis.png";
  //
  var reminderpopup = document.createElement("nav");
  reminderpopup.classList.add("reminderpopup"); // reuisablitly
  reminderpopup.classList.add("dropup");
  var edit = document.createElement("p");
  edit.innerText = "Edit";
  var deletee = document.createElement("p");
  deletee.innerText = "Delete";
  reminderpopup.appendChild(edit);
  reminderpopup.appendChild(deletee);
  // put it all together
  reminder.appendChild(reminderText);
  reminder.appendChild(reminderInfoContainer);
  reminder.appendChild(elipses);
  reminder.appendChild(reminderpopup);
  return reminder;
}

function priToNum(pri) {
  return pri == "high" ? 3 : pri == "medium" ? 2 : pri == "low" ? 1 : 0;
}

async function updateRemindersUI() {
  var remindersString = await chrome.storage.local.get(["reminders"]);
  var reminderse = JSON.parse(remindersString.reminders)["times"];
  var reminders = reminderse.sort(
    (a, b) => priToNum(a.priority) - priToNum(b.priority)
  );
  Reminders.innerHTML = "";
  for (var i in reminders) {
    var reminder = reminders[i];
    var newReminderUI = createReminderUI(
      reminder.id,
      reminder.name,
      reminder.priority
    );
    Reminders.prepend(newReminderUI);
  }
  var reminders = document.getElementsByClassName("reminder");
  console.log(reminders);
  for (var i = 0; i < reminders.length; i++) {
    var reminder = reminders[i];
    reminder.children[2].onclick = function (e) {
      if (e.target.parentElement.children[3].className.includes("dropup")) {
        e.target.parentElement.style.borderBottomRightRadius = "0px";
        e.target.parentElement.children[3].style.display = "flex";
        e.target.parentElement.children[3].classList.remove("dropup");
        e.target.parentElement.children[3].classList.add("dropdown");
      } else if (
        e.target.parentElement.children[3].className.includes("dropdown")
      ) {
        e.target.parentElement.style.borderBottomRightRadius = "10px";
        e.target.parentElement.children[3].classList.remove("dropdown");
        e.target.parentElement.children[3].classList.add("dropup");
        e.target.parentElement.children[3].style.display = "none";
      }
    };
    reminder.children[3].children[0].onclick = async function (e) {
      await showReminderPopup(
        false,
        e.target.parentElement.parentElement.getAttribute("name")
      );
    };
    reminder.children[3].children[1].onclick = async function (e) {
      console.log(e);
      console.log(e.target.parentElement.parentElement);
      console.log(e.target.parentElement.parentElement.getAttribute("name"));
      await deleteReminder(
        e.target.parentElement.parentElement.getAttribute("name"),
        e.target.parentElement.parentElement.children[0].innerText
      );
      await updateRemindersUI();
    };
  }
}

ReminderSubmit.onclick = async function (e) {
  var add = ReminderPopup.children[0].innerText == "Add reminder";
  if (add) {
    var remindersString = await chrome.storage.local.get(["reminders"]);
    var reminders = JSON.parse(remindersString.reminders)["times"];
    var id = 0;
    for (var i in reminders) {
      var reminder = reminders[i];
      if (parseInt(reminder.id) >= id) {
        id = parseInt(reminder.id) + 1;
      }
    }
    var storedName = id.toString() + "--{*^.^*}--" + ReminderName.value;
    var reminderPriority = ReminderPriority.value;
    await createReminder(storedName, reminderPriority);
    console.log("createdreminder");
    await updateRemindersUI();
    Overlay.style.display = "none";
  } else {
    var oldValue = ReminderSubmit.parentElement.getAttribute("oldValue");
    var storedName =
      oldValue.split("--{*^.^*}--")[0] + "--{*^.^*}--" + ReminderName.value;
    var reminderPriority = ReminderPriority.value;
    await editReminder(oldValue, storedName, reminderPriority);
    console.log("edited reminder");
    await updateRemindersUI();
    Overlay.style.display = "none";
  }
};

chrome.runtime.onMessage.addListener(async (request, sender, reply) => {
  console.log(
    sender.tab ? "from a extension:" + sender.tab.url : "from the ajndco"
  );
  if (request.updateAlarm) {
    updateAlarmsUI();
  }

  return true;
});

makeMenu("Site Time", async function (e) {
  console.log("Move to Site Tracking Menu");
  MenuPopup.style.display = "none";
  Menu.style.borderTopRightRadius = "25px";
  show("main", false);
  show("alarms", false);
  show("reminders", false);
  show("sitetracking");
  await updateSiteTrackingUI();
});

function createSiteTrackingUI(siteName, siteTime, width) {
  var siteTracking = document.createElement("div");
  siteTracking.classList.add("sitetrack");
  // This is the actual text displaying the sitetracking
  var siteTrackingText = document.createElement("p");
  if (siteName.slice(0, 4) == "www.") {
    siteName = siteName.split(siteName.slice(0, 4))[1];
  }
  siteTrackingText.innerText = siteName;
  //
  var siteTrackingBarContainer = document.createElement("div");
  siteTrackingBarContainer.classList.add("sitetrackingbarcontainer");

  var siteTrackingBar = document.createElement("div");
  siteTrackingBar.classList.add("sitetrackingbar");
  siteTrackingBar.style.width = width + "%";
  //

  var siteTrackingTime = document.createElement("p");
  var fullSiteTime;
  if (siteTime / 1000 < 1) {
    fullSiteTime = siteTime;
    siteTrackingTime.innerText = fullSiteTime.toFixed(2) + " miliseconds";
  } else if (siteTime / 1000 / 60 < 1) {
    fullSiteTime = siteTime / 1000;
    siteTrackingTime.innerText = fullSiteTime.toFixed(2) + " seconds";
  } else if (siteTime / 1000 / 60 / 60 < 1) {
    fullSiteTime = siteTime / 1000 / 60;
    siteTrackingTime.innerText = fullSiteTime.toFixed(2) + " minuites";
  } else if (siteTime / 1000 / 60 / 60 / 60 / 24 < 1) {
    fullSiteTime = siteTime / 1000 / 60 / 60;
    siteTrackingTime.innerText = fullSiteTime.toFixed(2) + " hours";
  } else {
    fullSiteTime = siteTime / 1000 / 60 / 60 / 24;
    siteTrackingTime.innerText = fullSiteTime.toFixed(2) + " days";
  }
  siteTrackingBar.appendChild(siteTrackingTime);
  siteTrackingBarContainer.appendChild(siteTrackingBar);
  siteTracking.appendChild(siteTrackingText);
  siteTracking.appendChild(siteTrackingBarContainer);

  return siteTracking;
}

async function updateSiteTrackingUI() {
  var siteTimes1 = await chrome.storage.local.get(["siteTimes"]);
  var siteTimes = siteTimes1.siteTimes;

  var concatanatedSiteTimes = {};

  SiteTimes.innerHTML = "";
  for (var site in siteTimes) {
    if (site == undefined || site == "undefined" || site == "") {
      continue;
    }
    var siteTime = siteTimes[site];
    console.log(site);
    const isValidUrl = (urlString) => {
      try {
        return Boolean(new URL(urlString));
      } catch (e) {
        return false;
      }
    };
    var siteHostname = isValidUrl(site)
      ? new URL(site).hostname
      : "INVALID" + site;

    if (siteHostname in concatanatedSiteTimes) {
      concatanatedSiteTimes[siteHostname] += siteTime;
    } else {
      concatanatedSiteTimes[siteHostname] = siteTime;
    }
  }
  const sortedConcatanatedSiteTimes = Object.fromEntries(
    Object.entries(concatanatedSiteTimes).sort(([, a], [, b]) => b - a)
  );
  for (var site in sortedConcatanatedSiteTimes) {
    var siteTime = sortedConcatanatedSiteTimes[site];
    var width =
      (siteTime /
        sortedConcatanatedSiteTimes[
          Object.keys(sortedConcatanatedSiteTimes)[0]
        ]) *
      100;
    var newSiteTrackingUI = createSiteTrackingUI(site, siteTime, width);
    SiteTimes.appendChild(newSiteTrackingUI);
  }
}
