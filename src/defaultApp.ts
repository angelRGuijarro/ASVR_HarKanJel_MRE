/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class DefaultApp {		
	private text: MRE.Actor = null;
	private utils: Utils;

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de DefaultApp`);
		this.utils = new Utils(context);
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {		
		this.text = this.utils.MakeText("List of available apps:<br>" +
												"· soccer<br>" +
												"· scoreboard<br>" + 
												"· boat<br>" + 
												"· cicada_car", MRE.Vector3.Zero());
	}	

	
}
