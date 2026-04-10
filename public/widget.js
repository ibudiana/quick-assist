(function () {
  var iframe = document.createElement("iframe");

  iframe.src = "http://localhost:3000/widget";
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
