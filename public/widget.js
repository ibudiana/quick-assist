(function () {
  var iframe = document.createElement("iframe");
  var script = document.currentScript;
  var origin = "";

  if (script && script.src) {
    try {
      origin = new URL(script.src).origin;
    } catch (e) {
      origin = "";
    }
  }

  if (!origin && window.location && window.location.origin) {
    origin = window.location.origin;
  }

  iframe.src = (origin ? origin : "") + "/widget";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "380px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  iframe.style.zIndex = "999999";
  iframe.allowTransparency = "true";

  document.body.appendChild(iframe);
})();
