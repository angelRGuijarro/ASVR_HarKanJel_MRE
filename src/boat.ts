/*!
 * Copyright Ángel Ruiz Guijarro. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor } from '@microsoft/mixed-reality-extension-sdk';
import Utils from './server';

/**
 * Clase principal de la aplicación. Aquí se resuelve todo.
 */
export default class BoatApp {		
	private assetsContainer: MRE.AssetContainer;
	private prefabs: {[key: string]: MRE.Prefab} = {};
	private actors: MRE.Actor;
	private secondButtonPos: MRE.Vector3 = MRE.Vector3.Zero();
	private attachedBoats = new Map<MRE.Guid, MRE.Actor>();
	private invisibleMaterial: MRE.Material;

	constructor(private context: MRE.Context, secondButtonPos?: MRE.Vector3) {		
		console.log(`Constructror de BoatApp`);
		this.assetsContainer = new MRE.AssetContainer(context);
		this.assetsContainer.createMaterial('invisible', 
			{ color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.0), alphaMode: MRE.AlphaMode.Blend });
		this.invisibleMaterial = this.assetsContainer.materials.find(m => m.name === 'invisible');		
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
		
		//Exposed (clickable) boat
		await this.createNewBoat(true);
		
		// If needed a second boat, place on position
		if (JSON.stringify(this.secondButtonPos) !== JSON.stringify(MRE.Vector3.Zero())){
			const secondBoat = await this.createNewBoat(true).then();
			secondBoat.transform.local.position = this.secondButtonPos;		
		}
	}	


	private async createNewBoat(clickable: boolean, atachToUser?: MRE.User): Promise<MRE.Actor> {		
		// Create a basic boat with appearance and collider if it has to be clickable
		const newBoat = MRE.Actor.CreateFromPrefab(this.context, {
			firstPrefabFrom: await this.assetsContainer.loadGltf('toy_boat.glb', "mesh"),
			actor: {
				parentId: this.actors.id,
				name: 'boat',
				appearance: clickable?{ meshId: this.assetsContainer.createSphereMesh('button', 2.5).id, 
					materialId: this.invisibleMaterial.id }:null,
				collider: clickable?{ geometry: { shape: MRE.ColliderType.Auto } }:null,
				transform: { local: {
					position: MRE.Vector3.Zero(),
					scale: new MRE.Vector3(0.5, 0.5, 0.5),						
					rotation: MRE.Quaternion.FromEulerAngles(0, 90 * MRE.DegreesToRadians, 0)
				}
				}
			}
		});
		// If it has to be attached, needs to be smaller and positioned behind the user model
		if (atachToUser !== undefined){
			const attachedTransformLocal = new MRE.ScaledTransform();
			attachedTransformLocal.position = new MRE.Vector3(0,-0.3,-0.3);
			attachedTransformLocal.rotation = MRE.Quaternion.FromEulerAngles(
				0 * MRE.DegreesToRadians,
				0 * MRE.DegreesToRadians,
				0 * MRE.DegreesToRadians);
			attachedTransformLocal.scale =new MRE.Vector3(0.3,0.3,0.3);
			
			newBoat.transform.local = attachedTransformLocal;
			newBoat.attach(atachToUser,'hips');
		}else{
			const cInfoTransformLocal = new MRE.ScaledTransform();
			cInfoTransformLocal.position = new MRE.Vector3(0,0,-3.5);
			// cInfoTransformLocal.rotation = MRE.Quaternion.FromEulerAngles(
			// 	0 * MRE.DegreesToRadians,
			// 	90 * MRE.DegreesToRadians,
			// 	0 * MRE.DegreesToRadians);
			cInfoTransformLocal.scale =new MRE.Vector3(1,1,1);
			
			this.copyRightInfo(newBoat, cInfoTransformLocal);
		}

		
		// Set ButtonBehavior if clickable
		if (clickable){
			// Set a click handler on the button.
			newBoat.setBehavior(MRE.ButtonBehavior)
				.onClick(user => this.catchOrLeaveTheBoat(user));
		}
		return newBoat;
	}

	private async catchOrLeaveTheBoat(user: MRE.User) {
		// If you got it, leave it
		if (!this.removeBoat(user)){
			const newBoat = await this.createNewBoat(false,user).then();
			this.attachedBoats.set(user.id, newBoat);
		}
	}
	//Load 3D models for this app
	private async loadModels() {		
		// This work is based on "Toy Boat" 
		// (https://sketchfab.com/3d-models/toy-boat-3c96a2a3f207411987c6151e680b72d2) 
		// by Pablo88 (https://sketchfab.com/Pablo88) licensed under CC-BY-4.0 
		// (http://creativecommons.org/licenses/by/4.0/)
		try {
			const assets = await this.assetsContainer.loadGltf('toy_boat.glb');
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

	private copyRightInfo(parent: MRE.Actor, transformLocal: MRE.ScaledTransform){				
		//Create button		
		const button = MRE.Actor.Create(this.context,{
			actor: {
				parentId: parent.id,
				name: 'buttonC',
				appearance: { meshId: this.assetsContainer.createBoxMesh('buttonCMesh', 0.5, 0.5, 0.1).id,
					materialId: this.invisibleMaterial.id },
				collider: { geometry: { shape: MRE.ColliderType.Auto } }
			}
		});			
		button.transform.local = transformLocal;		
		//click handler for this button
		button.setBehavior(MRE.ButtonBehavior).onClick(() => this.showCopyRightInfo(button));
			
		// Create a label for the button.
		MRE.Actor.Create(this.context,{
			actor: {
				parentId: button.id,
				name: 'labelButtonC',
				text: {
					contents: "(C)",
					height: 0.3,
					anchor: MRE.TextAnchorLocation.MiddleCenter
				}
			}
		});
	}

	private showCopyRightInfo(button: Actor){
		const copyRightInfoText = Utils.MakeText(this.context,
			'This work is based on "Toy Boat" <br> ' +
			'(https://sketchfab.com/3d-models/toy-boat-3c96a2a3f207411987c6151e680b72d2) <br>' +
			'by Pablo88 (https://sketchfab.com/Pablo88) licensed under CC-BY-4.0 <br>' +
			'(http://creativecommons.org/licenses/by/4.0/)',new MRE.Vector3(0.5,1.5,0),0.1);
		copyRightInfoText.parent = button;		
		setTimeout(() => {
			copyRightInfoText.destroy();
		}, 10000); 
	}
}
