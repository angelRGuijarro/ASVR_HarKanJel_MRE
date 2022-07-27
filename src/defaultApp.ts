/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
//import { Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import Utils from './server';

//import { TextFontFamily } from '@microsoft/mixed-reality-extension-sdk';
//import { runInNewContext } from 'vm';
/*
import {
	Actor,AssetContainer, ButtonBehavior,
	ColliderType, Context,Guid,
	PrimitiveShape, Vector3, User} from '@microsoft/mixed-reality-extension-sdk';
*/
/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class DefaultApp {		
	private text: MRE.Actor = null;

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de DefaultApp`);
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {		
		this.text = Utils.MakeText(this.context, "List of available apps:<br>" +
												"· soccer<br>" +
												"· scoreboard<br>" + 
												"· boat", MRE.Vector3.Zero());
	}	

	
}
