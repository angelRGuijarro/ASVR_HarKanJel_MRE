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
export default class BoatApp {		
	private assets: MRE.AssetContainer;
	private prefabs: {[key: string]: MRE.Prefab} = {};
	private actors: MRE.Actor;
	private secondButtonPos: MRE.Vector3 = MRE.Vector3.Zero();

	constructor(private context: MRE.Context, secondButtonPos?: MRE.Vector3) {		
		console.log(`Constructror de BoatApp`);
		this.assets = new MRE.AssetContainer(context);
		this.actors = MRE.Actor.Create(this.context);

		if (typeof(secondButtonPos) !== 'undefined'){
			this.secondButtonPos = secondButtonPos;
		}		

		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private started() {				
		this.loadModels();		
		
		const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);		
		
		const button = MRE.Actor.Create(this.context,{
			actor:{
				parentId: this.actors.id,
				name: 'button',
				appearance: { meshId: buttonMesh.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
				transform: {
					local: { position: { x: 0, y: 0, z: 0 } }
				}
			}
		});
		// Set a click handler on the button.
		button.setBehavior(MRE.ButtonBehavior)
			.onClick(user => this.catchTheBoat(user.id));

		if (this.secondButtonPos !== MRE.Vector3.Zero()){
			const button2 = MRE.Actor.Create(this.context,{
				actor:{
					parentId: this.actors.id,
					name: 'button2',
					appearance: { meshId: buttonMesh.id },
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: { position: this.secondButtonPos }
					}
				}
			});
			// Set a click handler on the button.
			button2.setBehavior(MRE.ButtonBehavior)
				.onClick(user => this.catchTheBoat(user.id));
		}
		
	}	


	private catchTheBoat(userId: MRE.Guid) {
		// if (this.context.actors.find(a => a.name === 'toy_boat')){
		// 	console.log('Barco encontrado');

		// }
		const barco = this.context.actors.find(a => a.name === 'toy_boat');
		if (barco){
			console.log("Barco encontrado");
			barco.destroy();
			return;
		}else{
			console.log("No hay Barco");
		}

		MRE.Actor.CreateFromPrefab(this.context, {
			prefab: this.prefabs['ship_id'],
			actor: {
				name: 'toy_boat',
				transform: {
					local: {
						position: new MRE.Vector3(0,-0.3,0),
						rotation: MRE.Quaternion.FromEulerAngles(
							0 * MRE.DegreesToRadians,
							0 * MRE.DegreesToRadians,
							0 * MRE.DegreesToRadians),
						scale: new MRE.Vector3(0.3,0.3,0.3),
					}
				},
				attachment: {
					attachPoint: 'hips',
					userId
				}
			}
		})		
	}
	//Load 3D models for this app
	private async loadModels() {		
		//This work is based on "Toy Boat" 
		//(https://sketchfab.com/3d-models/toy-boat-3c96a2a3f207411987c6151e680b72d2) 
		//by Pablo88 (https://sketchfab.com/Pablo88) licensed under CC-BY-4.0 
		//(http://creativecommons.org/licenses/by/4.0/)
		try {
			const assets = await this.assets.loadGltf('toy_boat.glb');
			this.prefabs['ship_id'] = assets.find(a => a.prefab !== null) as MRE.Prefab;
		} catch (e) {
			return MRE.log.error("app", e);
		}
	}

	
}
