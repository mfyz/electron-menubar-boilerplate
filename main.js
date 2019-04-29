const {
	app,
	BrowserWindow,
	ipcMain,
	Tray,
	systemPreferences
} = require('electron');
const path = require('path');

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
	createTray()
	createWindow()
})

systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
	tray.setImage(getTrayIcon())
})

const getTrayIcon = () => {
	return path.join('TrayIcon-' + (systemPreferences.isDarkMode() ? 'Dark' : 'Light') + '.png')
}

const createTray = () => {
	tray = new Tray(getTrayIcon())
	tray.on('click', function (event) {
		toggleWindow()
	});
}

const getWindowPosition = () => {
	const windowBounds = window.getBounds();
	const trayBounds = tray.getBounds();
	// Center window horizontally below the tray icon
	const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
	// Position window 4 pixels vertically below the tray icon
	const y = Math.round(trayBounds.y + trayBounds.height + 4);

	return { x, y };
}

const createWindow = () => {
	window = new BrowserWindow({
		width: 400,
		height: 300,
		show: false,
		frame: false,
		fullscreenable: false,
		resizable: false,
		transparent: false,
		webPreferences: {
			backgroundThrottling: false
		}
	})
	window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

	// Hide the window when it loses focus
	window.on('blur', () => {
		if (!window.webContents.isDevToolsOpened()) {
			window.hide()
		}
	})
}

const toggleWindow = () => {
	window.isVisible() ? window.hide() : showWindow();
}

const showWindow = () => {
	const position = getWindowPosition();
	window.setPosition(position.x, position.y, false);
	window.show();
}

ipcMain.on('show-window', () => {
	showWindow()
})