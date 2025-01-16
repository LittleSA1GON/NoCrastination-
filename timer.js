var timer = setInterval(function () {
  var duration = 300000;
  //var days = Math.floor(duration / (1000 * 60 * 60 * 24));
  var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((duration % (1000 * 60)) / 1000);
  document.getElementById("Timer").innerHTML =
    hours + ": " + minutes + ": " + seconds;
  if (duration == 0) {
    clearInterval(timer);
    document.getElementById("Timer").innerHTML = "done";
  }
}, 1000);
