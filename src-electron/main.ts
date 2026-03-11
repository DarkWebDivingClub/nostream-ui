import {app, BrowserWindow, protocol, net, Tray, Menu, session} from 'electron';
import path from 'path';
import url from 'url';
import {stat} from 'node:fs/promises';
import electronSquirrelStartup from 'electron-squirrel-startup';

import {initializeExtension} from '@red-token/nos2x-electron/extension-init';

if (electronSquirrelStartup) app.quit();

// only one instance
if (!app.requestSingleInstanceLock()) {
	app.quit();
}
//path

const srcFolder = path.join(app.getAppPath(), `.vite/main_window`);
const extensionsFolder = path.join(process.resourcesPath, `dist`, `extension`);
// const extensionsFolder = path.join(app.getAppPath(), `extensions`);
const staticAssetsFolder = import.meta.env.DEV ? path.join(import.meta.dirname, '../../static/') : srcFolder;
const extensionsPath = import.meta.env.DEV
	? path.join(import.meta.dirname, '../../node_modules/@red-token/nos2x-electron/dist/extension')
	: extensionsFolder;

// const extensionPath = path.join(__dirname, 'extension');

// Init nos2x

console.log('extensionPath: ', extensionsPath);
// Variables
const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin';
const scheme = 'app';

let nos2x: any;
let tray: Tray;
// let nos2x: Extension;
let mainWindow: BrowserWindow;

// app.setPath('userData', '/tmp/bob/data');

console.log('App is packaged:', !isDev);

app.on('second-instance', () => {
	if (mainWindow) {
		if (!mainWindow.isVisible()) mainWindow.show();
		mainWindow.focus();
	}
});

protocol.registerSchemesAsPrivileged([
	{
		scheme: scheme,
		privileges: {
			standard: true,
			secure: true,
			allowServiceWorkers: true,
			supportFetchAPI: true,
			bypassCSP: true,
			corsEnabled: false,
			stream: true, // video stream from schema
			codeCache: true
		}
	}
]);
app.whenReady().then(async () => {
	protocol.handle(scheme, async (request) => {
		const requestPath = path.normalize(decodeURIComponent(new URL(request.url).pathname));

		async function isFile(filePath: string) {
			try {
				if ((await stat(filePath)).isFile()) return filePath;
				// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
			} catch (e) {}
		}

		const responseFilePath =
			(await isFile(path.join(srcFolder, requestPath))) ??
			(await isFile(
				path.join(srcFolder, path.dirname(requestPath), `${path.basename(requestPath) || 'index'}.html`)
			)) ??
			path.join(srcFolder, '200.html');

		return await net.fetch(url.pathToFileURL(responseFilePath).toString());
	});
	nos2x = initializeExtension({
		extensionPath: extensionsPath,
		debug: true
	});
	// await integrateNos2x(app, extensionsPath);
	// session.defaultSession
	// 	.loadExtension(path.join(extensionsPath, '/kpgefcfmnafjgpblomihpgmejjdanjjp'))
	// 	.then((extension) => {
	// 		console.log('Extension loaded:', extension.name);
	// 		nos2x = extension;
	// 		openOptions(`${nos2x.id}/options.html`, true);
	// 		openOptions(
	// 			`${nos2x.id}/prompt.html?host=localhost%3A5173&id=82617495493197&params=%7B%7D&type=getPublicKey&result=8dc5ce6489cdb3dc8d00e9e21db9f8da168096615560d00245cec66aafcbce2a`
	// 		);
	// 	});

	createWindow();
	setupTray();
	/// Remove app Menu
	// if (isMac) {
	// 	Menu.setApplicationMenu(
	// 		Menu.buildFromTemplate([{label: app.name, submenu: [{role: 'about'}, {role: 'quit'}]}]) //TODO should be the custom menu
	// 	);
	// } else {
	// 	if (!isDev) Menu.setApplicationMenu(null);
	// }
});

// app.on('ready', createWindow);

// app.on('ready', setupTray);

app.on('window-all-closed', () => {
	if (!isMac) app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// ipcMain.on('toggleDevTools', (event) => event.sender.toggleDevTools());
// ipcMain.on('setTitleBarColors', (event, bgColor, iconColor) => {
// 	const window = BrowserWindow.fromWebContents(event.sender);
// 	if (window === null) return;

// 	// MacOS title bar overlay buttons do not need styling so the function is undefined
// 	if (window.setTitleBarOverlay === undefined) return;

// 	window.setTitleBarOverlay({
// 		color: bgColor,
// 		symbolColor: iconColor,
// 		height: 40
// 	});
// });

//#region Functions

function createWindow() {
	mainWindow = new BrowserWindow({
		icon: path.join(staticAssetsFolder, '/icon.png'),
		title: `iz-stream`,
		width: 900,
		height: 700,
		minWidth: 400,
		minHeight: 200,

		show: false,
		// titleBarStyle: 'hiddenInset',
		darkTheme: true,
		// titleBarOverlay: {
		// 	color: '#101010',
		// 	symbolColor: '#f8fafc',
		// 	height: 40,

		// },
		backgroundColor: 'black',
		webPreferences: {
			session: session.defaultSession,
			contextIsolation: true,

			devTools: true, //isDev,
			nodeIntegration: false,
			// preload: app.nos2x.getPreloadPath()
			preload: path.join(import.meta.dirname, '../preload/preload.js')
		}
	});

	if (import.meta.env.DEV) {
		mainWindow.loadURL(VITE_DEV_SERVER_URLS['main_window']);

		// Open the DevTools.
		// mainWindow.webContents.openDevTools();
	} else {
		// mainWindow.loadFile(path.join(srcFolder, `index.html`))
		mainWindow.loadURL('app://-/');
	}

	// mainWindow.webContents.on('new-window', (event, url) => {
	// 	///TODO fix it
	// 	event.preventDefault();
	// 	shell.openExternal(url);
	// });

	// mainWindow.webContents.on('did-finish-load', () => {
	// 	const extensionPath = path.join(extensionsPath,  'nostr-provider.js');
	// 	const scriptContent = fs.readFileSync(extensionPath, 'utf-8');
	// 	mainWindow.webContents
	// 		.executeJavaScript(scriptContent)
	// 		.then(() => console.log('extensionscript install'))
	// 		.catch((err) => console.error('error script install:', err));
	// });
	mainWindow.on('ready-to-show', async () => {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.focus();
		}
	});
	// mainWindow.webContents.on('did-finish-load', () => {
	// 	const extensions = mainWindow.webContents.session.getAllExtensions();
	// 	console.log('Extensions in session of MainWindow:', extensions);
	// });
	mainWindow.on('close', (event) => {
		// if (!app.isQuiting) {
		event.preventDefault();
		mainWindow.hide();

		// }
	});
	mainWindow.on('minimize', () => mainWindow.minimize());
}

/// Add Contect Menu
function setupTray() {
	tray = new Tray(path.join(staticAssetsFolder, '/icon.png'));
	tray.setToolTip('iz-stream');
	tray.setContextMenu(
		Menu.buildFromTemplate([
			{label: 'Show', click: () => mainWindow.show()},
			{
				label: 'nos2x:Option',
				click: () =>
					nos2x.openOptions().catch((err: Error) => {
						console.error('Error opening options:', err);
					})
			},
			{
				label: 'nos2x: Get Public Key',
				click: () => {
					nos2x.getPublicKeyOrShowOptions().catch((err: Error) => {
						console.error('Error getting public key:', err);
					});
				}
			},
			{label: 'Quit', click: () => app.exit()}
		])
	);
	tray.on('click', () => (mainWindow.isMinimized() ? mainWindow.show() : mainWindow.minimize()));
}

//#endregion
