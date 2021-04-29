const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
require('dotenv').config()
const url = require("url");
const path = require("path");
const os = require("os");
const sysinfo = require('systeminformation');
const { takeHeapSnapshot } = require("process");

require('dotenv').config()

let mainWindow;
app.on('ready', () => {

	function addspan(txt) {
		return '<span id="specLoaded">' + txt + '</span>'
	}

	var systemdata = [];

	systemdata.push(addspan("- Operating System: " + os.version()));
	systemdata.push(addspan("- Operating System Platform: " + os.platform()));
	systemdata.push(addspan("- Operating System Version: " + os.version()));
	systemdata.push(addspan("- Operating System Type: " + os.type()));

	systemdata.push(addspan("- CPU Cores: "));
	for (let index = 0; index < os.cpus().length; index++) {
		systemdata.push(addspan("Core " + (index + 1) + ": " + os.cpus()[index].model + " (Speed: " + os.cpus()[index].speed + " MHz)"));
	}

	systemdata.push(addspan("- CPU Architecture: " + os.arch()));

	systemdata.push(addspan("- Total RAM Memory: " + (os.totalmem() / 1048576).toFixed(1) + " MB"));
	systemdata.push(addspan("- Free RAM Memory: " + (os.freemem() / 1048576).toFixed(1) + " MB"));
	systemdata.push(addspan("- Used RAM Memory: " + ((os.totalmem() - os.freemem()) / 1048576).toFixed(1) + " MB"));

	systemdata.push(addspan("- Active Time (can be innacurate): " + os.uptime() + " seconds"));

	systemdata.push(addspan("- Host Name: " + os.hostname()));
	systemdata.push(addspan("- Username: " + os.userInfo().username));
	systemdata.push(addspan("- User Folder: " + os.homedir()));
	systemdata.push(addspan("- Temp Folder: " + os.tmpdir()));
	
	mainWindow = new BrowserWindow({ width: 900, height: 600, resizable: true, title: "Fast Specs GUI - Tool created by C4rluX2576", webPreferences: { nodeIntegration: true, contextIsolation: false } });
	mainWindow.setMinimumSize(700, 450);
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'html/index.html'),
		protocol: 'file',
		slashes: true
	}));
	mainWindow.setMenu(new Menu());

	mainWindow.webContents.once('dom-ready', () => {

		mainWindow.webContents.send("systeminfo", systemdata);

		ipcMain.once('loadMoreSysData', async (event, arg) => {
			
			var moreSysInfo = [];
			const graphicsData = await sysinfo.graphics();

			moreSysInfo.push(addspan("- GPU Info:"));

			graphicsData.controllers.map(e => {
				moreSysInfo.push(addspan("(" + e.vendor + ") " + e.model + " (VRAM: " + e.vram + "MB)"));
			});

			moreSysInfo.push(addspan("- Displays:"));
			for (let index = 0; index < graphicsData.displays.length; index++) {
				var ifMain = "";
				if (graphicsData.displays[index].main) { ifMain = " (Main)" }
				var curDisplay = "";
				if (graphicsData.displays[index].resolutionX !== graphicsData.displays[index].currentResX || graphicsData.displays[index].resolutionY !== graphicsData.displays[index].currentResY) {
					curDisplay = "(Current Display: " + graphicsData.displays[index].currentResX + "x" + graphicsData.displays[index].currentResY + ") ";
				}
				var lastspace = "";
				if (graphicsData.displays[index].model) {
					lastspace = " ";
				}
				var connection = "";
				if (graphicsData.displays[index].connection) {
					connection = "(Connection: " + graphicsData.displays[index].connection + ")";
				}
				moreSysInfo.push(addspan("Display #" + (index + 1) + ifMain + " - " + graphicsData.displays[index].resolutionX + "x" + graphicsData.displays[index].resolutionY + " " + curDisplay + graphicsData.displays[index].model + lastspace + connection));
			}

			const drivesData = await sysinfo.fsSize();

			moreSysInfo.push("" + addspan("- Drives Info:"));
			drivesData.map(e1 => {
				moreSysInfo.push(addspan("<div class=\"driveInfo\">" + addspan("Drive " + e1.fs + " (" + e1.type + ")")));
				moreSysInfo.push(addspan("Total Space: " + (e1.size / 1048576).toFixed(1) + " MB"));
				moreSysInfo.push(addspan("Used Space: " + (e1.used / 1048576).toFixed(1) + " MB (" + e1.use.toFixed(1) + "%)"));
				moreSysInfo.push(addspan("Available Space: " + (e1.available / 1048576).toFixed(1) + " MB (" + (100 - e1.use).toFixed(1) + "%)</div>"));
			});

			mainWindow.webContents.send("systemSlowLoadDataGet", moreSysInfo);

		})

	});

});