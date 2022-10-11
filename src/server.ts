/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Context, ParameterSet, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import dotenv from 'dotenv';
import { resolve as resolvePath } from 'path';
import DefaultApp from './defaultApp';
import SoccerMatch from './soccer';
import Scoreboard from './scoreboard';
import TestApp from './test';
import BoatApp from './boat';
import CicadaCarApp from './cicadaCar';
import UFOApp from './UFO';
import ModelsManager from './modelsManager';

// add some generic error handlers here, to log any exceptions we're not expecting
process.on('uncaughtException', err => console.log('uncaughtException', err));
process.on('unhandledRejection', reason => console.log('unhandledRejection', reason));

// Read .env if file exists
dotenv.config();

function loadApp(context: Context, params: ParameterSet){	
	let secondButtonPos: MRE.Vector3;
	
	console.log(`parámetro: ${params.app}`);
	switch (params.app) {
		case 'soccer':
			return new SoccerMatch(context);
			break;	
		case 'scoreboard':
			return new Scoreboard(context);
			break;	
		case 'boat':
			try{
				//console.log(`X ${params.x} Y ${params.y} Z ${params.z}`);
				secondButtonPos = new MRE.Vector3(parseFloat(params.x.toString()),
					parseFloat(params.y.toString()),
					parseFloat(params.z.toString()));
			}catch{
				secondButtonPos = MRE.Vector3.Zero();
			}			
			return new BoatApp(context, secondButtonPos);
			break;	
		case 'cicada_car':
			return new CicadaCarApp(context);
		case 'UFO':
			return new UFOApp(context);
		case 'modelManager':
			return new ModelsManager(context,params);
		case 'test':
			return new TestApp(context);
			break;	
		default:			
			return new DefaultApp(context);
			break;
	}
	//looks like it doesn't works on node 8.12 , maybe on node 10
	// if (params.app){		
	// 	import(`./${params.app}`)
	// 		.then((m) => { return new m.default(context) });		
	// }
}

// This function starts the MRE server. It will be called immediately unless
// we detect that the code is running in a debuggable environment. If so, a
// small delay is introduced allowing time for the debugger to attach before
// the server starts accepting connections.
function runApp() {
	// Start listening for connections, and serve static files.
	const server = new MRE.WebHost({
		baseDir: resolvePath(__dirname, '../public')
	});

	// Handle new application sessions
	server.adapter.onConnection(loadApp);	
	// server.adapter.onConnection(context => new App(context));
}


// Check whether code is running in a debuggable watched filesystem
// environment and if so, delay starting the app by one second to give
// the debugger time to detect that the server has restarted and reconnect.
// The delay value below is in milliseconds so 1000 is a one second delay.
// You may need to increase the delay or be able to decrease it depending
// on the speed of your machine.
const delay = 1000;
const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');

if (isDebug) {
	setTimeout(runApp, delay);
} else {
	runApp();
}


