/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { DegreesToRadians, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
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
	private attachedBoats = new Map<MRE.Guid, MRE.Actor>();

	constructor(private context: MRE.Context, secondButtonPos?: MRE.Vector3) {		
		console.log(`Constructror de BoatApp`);
		this.assets = new MRE.AssetContainer(context);
		this.assets.createMaterial('invisible', { color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.0), alphaMode: MRE.AlphaMode.Blend });
		this.actors = MRE.Actor.Create(this.context);

		if (typeof(secondButtonPos) !== 'undefined'){
			this.secondButtonPos = secondButtonPos;
		}		

		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {				
		this.loadModels();		
		
		//const buttonMesh = this.assets.createBoxMesh('button', 0.3, 0.3, 0.01);		
		const buttonMesh = this.assets.createSphereMesh('button',2.5); // , 0.3, 0.3, 0.01);		
		const buttonBoat = await this.assets.loadGltf('toy_boat.glb',"mesh");
		const buttonBoatScale = new Vector3(0.5,0.5,0.5);

		const invisibleMaterial = this.assets.materials.find(m => m.name === 'invisible');		
		
		const button = MRE.Actor.CreateFromPrefab(this.context,{
			firstPrefabFrom: buttonBoat,
			actor:{
				parentId: this.actors.id,
				name: 'button',		
				appearance: {meshId: buttonMesh.id, materialId: invisibleMaterial.id},							
				collider: { geometry: { shape: MRE.ColliderType.Auto } },
				transform: {
					local: {
						position: MRE.Vector3.Zero(),
						scale: buttonBoatScale,
						//rotation: {x:0, y:90 * MRE.DegreesToRadians , z:0}
						rotation: MRE.Quaternion.FromEulerAngles(0,90*DegreesToRadians,0)
					}
				}
			}
		});
		// Set a click handler on the button.
		button.setBehavior(MRE.ButtonBehavior)
			.onClick(user => this.catchTheBoat(user));
		
		if (this.secondButtonPos !== MRE.Vector3.Zero()){			
			const button2 = MRE.Actor.CreateFromPrefab(this.context,{
				firstPrefabFrom: buttonBoat,
				actor:{
					parentId: this.actors.id,
					name: 'button2',					
					appearance: {meshId: buttonMesh.id, materialId: invisibleMaterial.id},
					collider: { geometry: { shape: MRE.ColliderType.Auto } },
					transform: {
						local: {
							position: this.secondButtonPos,
							scale: buttonBoatScale,
							//rotation: {x:0, y:90 * MRE.DegreesToRadians , z:0}
							rotation: MRE.Quaternion.FromEulerAngles(0,90*DegreesToRadians,0)
						}
					}
				}
			});
			// Set a click handler on the button.
			button2.setBehavior(MRE.ButtonBehavior)
				.onClick(user => this.catchTheBoat(user));
		}
		
	}	


	private catchTheBoat(user: MRE.User) {
		// if (this.context.actors.find(a => a.name === 'toy_boat')){
		// 	console.log('Barco encontrado');

		// }
		// const barco = this.context.actors.find(a => a.name === 'toy_boat');
		// if (barco){			
		// 	barco.destroy();
		// 	return;
		// }
		if (!this.removeBoat(user)){
			this.attachedBoats.set(user.id, 
				MRE.Actor.CreateFromPrefab(this.context, {
					prefab: this.prefabs['ship_id'],
					actor: {
						name: 'toy_boat',
						transform: {
							local: {
								position: new MRE.Vector3(0,-0.3,-0.3),
								rotation: MRE.Quaternion.FromEulerAngles(
									0 * MRE.DegreesToRadians,
									0 * MRE.DegreesToRadians,
									0 * MRE.DegreesToRadians),
								scale: new MRE.Vector3(0.3,0.3,0.3),
							}
						},
						attachment: {
							attachPoint: 'hips',
							userId: user.id
						}
					}
				}));
		}
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

	private removeBoat(user: MRE.User): boolean {
		if (this.attachedBoats.has(user.id)) { 
			this.attachedBoats.get(user.id).destroy(); 
			this.attachedBoats.delete(user.id);
			return true;
		}
		return false;
	}
	
}
