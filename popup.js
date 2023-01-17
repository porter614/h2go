// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
"use strict";

async function setAlarm(event) {
  let isActive = await chrome.action.getBadgeText({});
  console.log(isActive);
  if (isActive === "ON") {
    chrome.action.setBadgeText({ text: "" });
    chrome.alarms.clearAll();
    event.target.innerHTML = "Remind me";
  } else {
    let minutes = parseFloat(event.target.value);
    chrome.action.setBadgeText({ text: "ON" });
    chrome.alarms.create({ periodInMinutes: minutes });
    chrome.storage.sync.set({ minutes: minutes });
    event.target.innerHTML = "Turn me off";
  }
}

async function updateLitersDrank(event) {
  let inputEle = document.getElementById("input");
  let addedLiters = parseInt(inputEle.value);

  const cachedLiters = await chrome.storage.sync.get(["liters"]);
  const currentLiters = parseInt(cachedLiters.liters) || 0;
  const totalLiters = currentLiters + addedLiters;
  await chrome.storage.sync.set({ liters: totalLiters });

  console.log("I drank " + totalLiters + " liters so far");
  const totalLitersEle = document.getElementById("totalLiters");
  totalLitersEle.innerHTML = totalLiters.toString();
  updateProgress();
  return false;
}

async function updateProgress(event) {
  const cachedLiters = await chrome.storage.sync.get(["liters"]);
  const currentLiters = parseInt(cachedLiters.liters) || 0;
  let progressEle = document.getElementById("progress");

  progressEle.value = currentLiters;
}

function clearAlarm() {
  chrome.action.setBadgeText({ text: "" });
  chrome.alarms.clearAll();
  window.close();
}

//An Alarm delay of less than the minimum 1 minute will fire
// in approximately 1 minute increments if released
document.getElementById("remindMe").addEventListener("click", setAlarm);

document.getElementById("minus").addEventListener("click", function (event) {
  let inputEle = document.getElementById("input");
  let liters = inputEle.value;
  let count = parseInt(liters) - 1;
  count = count < 0 ? 0 : count;
  inputEle.value = count;
  return false;
});
document.getElementById("plus").addEventListener("click", function (event) {
  let inputEle = document.getElementById("input");
  let liters = inputEle.value;
  let count = parseInt(liters) + 1;
  count = count > 4 ? 4 : count;
  inputEle.value = count;
  return false;
});

document
  .getElementById("clearLiters")
  .addEventListener("click", async function (event) {
    await chrome.storage.sync.set({ liters: 0 });
    const totalLitersEle = document.getElementById("totalLiters");
    totalLitersEle.innerHTML = 0;
    updateProgress();
  });

document
  .getElementById("addLiters")
  .addEventListener("click", updateLitersDrank);

updateLitersDrank();
updateProgress();
