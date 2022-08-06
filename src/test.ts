/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
//import { Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import Utils from './Utils';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class TestApp {		
	private text: MRE.Actor = null;
	private mainActor: MRE.Actor;
	private testActor: MRE.Actor;
	private testChildActor: MRE.Actor;
	private utils: Utils;

	constructor(private context: MRE.Context) {		
		console.log(`Constructror de TestApp`);
		this.utils = new Utils(context);
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {		
		this.text = this.utils.MakeText("Testing new code...", MRE.Vector3.Zero());
		this.mainActor = MRE.Actor.Create(this.context);

		this.testActor = MRE.Actor.Create(this.context,{
			actor:{
				parentId: this.mainActor.id,
				name:'testActor'
			}
		});

		this.testChildActor = MRE.Actor.Create(this.context,{
			actor:{
				parentId: this.testActor.id,
				name: 'testChild'
			}
		});

		const child = this.mainActor.findChildrenByName('testChild',true);
		if (child[0]){			
			this.text = this.utils.MakeText("Found child o'mine", new MRE.Vector3(0,1,0));
		}
	}	
}
