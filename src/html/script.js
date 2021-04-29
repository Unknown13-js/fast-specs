const { ipcRenderer } = require('electron')

ipcRenderer.on('systeminfo', (eventData, sysInfo) => {
	document.getElementById("fastLoadSpecs").innerHTML = sysInfo.join("");
	document.body.style.display = "block";
	setTimeout(() => {
		document.body.style.opacity = "1";
	}, 100);
});

document.getElementById("showMoreInfo").addEventListener("click", function (e) {
	document.getElementById("load-spinner").style.width = this.clientHeight + "px";
	document.getElementById("load-spinner").style.height = this.clientHeight + "px";
	this.style.opacity = "0";
	setTimeout(() => {
		this.style.display = "none";
		document.getElementById("load-spinner").style.display = "block";
		setTimeout(() => {
			document.getElementById("load-spinner").style.opacity = "1";
			// start
			ipcRenderer.send("loadMoreSysData", "empty");
		}, 50);
	}, 250);
});

ipcRenderer.on('systemSlowLoadDataGet', (event, systemSlowLoadData) => {

	console.log(systemSlowLoadData);
	document.getElementById("load-spinner").style.opacity = "0";

	setTimeout(() => {
		
		document.getElementById("loadSlowSpecs").innerHTML = systemSlowLoadData.join("");
		document.getElementById("loadSlowSpecs").style.display = "block";
		document.getElementById("load-spinner").style.display = "none";

		setTimeout(() => {
			document.getElementById("loadSlowSpecs").style.opacity = "1";
		}, 100);
		
	}, 250);


})